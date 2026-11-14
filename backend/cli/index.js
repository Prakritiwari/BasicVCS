#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const readline = require("readline/promises");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const { v4: uuidv4 } = require("uuid");

const {
    GLOBAL_FILE,
    repoPath,
    readGlobalConfig,
    writeGlobalConfig,
    readProjectConfig,
    writeProjectConfig,
    getSession,
    requireSession,
    resolveApiUrl,
    s3Prefix,
} = require("./config");
const { apiRequest } = require("./api");

function parseRepoId(input) {
    const value = String(input || "").trim();
    const fromUrl = value.match(/\/repo\/([a-f0-9]{24})/i);
    if (fromUrl) return fromUrl[1];
    if (/^[a-f0-9]{24}$/i.test(value)) return value;
    throw new Error("Expected a repository URL or a 24-character repository id.");
}

function safeParts(relative) {
    return String(relative || "")
        .replace(/\\/g, "/")
        .split("/")
        .filter((part) => part && part !== "." && part !== "..");
}

async function prompt(question, state) {
    if (!state.rl) {
        state.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    }
    return state.rl.question(question);
}

async function listCommitDir(commitPath) {
    const entries = await fs.readdir(commitPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

async function login(argv) {
    const apiUrl = await resolveApiUrl(argv.api);
    const state = { rl: null };

    try {
        const email = argv.email || (await prompt("Email: ", state));
        const password = argv.password || (await prompt("Password: ", state));

        const data = await apiRequest("/cli/login", {
            method: "POST",
            apiUrl,
            auth: false,
            body: { email: email.trim(), password },
        });

        const current = await readGlobalConfig();
        await writeGlobalConfig({
            ...current,
            apiUrl,
            token: data.token,
            userId: data.userId,
            email: email.trim(),
            username: data.username,
        });

        console.log(`Signed in as ${data.username}. Token stored in ${GLOBAL_FILE}`);
    } finally {
        state.rl?.close();
    }
}

async function logout() {
    const current = await readGlobalConfig();
    const { token, ...rest } = current;
    await writeGlobalConfig(rest);
    console.log("Signed out. The API URL is kept.");
}

async function configCommand(argv) {
    const current = await readGlobalConfig();
    const action = String(argv.action || "show");

    if (action === "set") {
        if (argv.key !== "api" || !argv.value) {
            throw new Error("Usage: basicvcs config set api <url>");
        }
        current.apiUrl = String(argv.value).trim().replace(/\/+$/, "");
        await writeGlobalConfig(current);
        console.log(`API URL set to ${current.apiUrl}`);
        return;
    }

    if (action === "get") {
        if (argv.key === "api") {
            console.log(await resolveApiUrl());
            return;
        }
        if (argv.key === "token") {
            console.log(current.token ? "set" : "not set");
            return;
        }
        throw new Error("Usage: basicvcs config get api|token");
    }

    if (action === "show") {
        console.log(
            JSON.stringify(
                {
                    apiUrl: await resolveApiUrl(),
                    email: current.email || null,
                    userId: current.userId || null,
                    token: current.token ? "(set)" : "(not set)",
                },
                null,
                2
            )
        );
        return;
    }

    throw new Error("Usage: basicvcs config <set|get|show>");
}

async function link(argv) {
    const repoId = parseRepoId(argv.repo);
    const session = await requireSession({ apiUrl: argv.api });
    const data = await apiRequest(`/repo/${repoId}`, {
        apiUrl: session.apiUrl,
        token: session.token,
    });
    const repo = Array.isArray(data) ? data[0] : data;

    if (!repo?._id) {
        throw new Error("Repository not found.");
    }

    const current = await readProjectConfig();
    const config = {
        ...current,
        repoId,
        repoName: repo.name,
        apiUrl: session.apiUrl,
        s3Prefix: s3Prefix(repoId),
        linkedAt: new Date().toISOString(),
    };

    await fs.mkdir(path.join(repoPath(), "commits"), { recursive: true });
    await fs.mkdir(path.join(repoPath(), "staging"), { recursive: true });
    await writeProjectConfig(config);

    console.log(`Linked .hidGit to "${repo.name}" (${repoId})`);
    console.log(`API: ${session.apiUrl}`);
    console.log(`S3 prefix: ${s3Prefix(repoId)}commits/`);
}

async function init() {
    const session = await getSession();
    const existing = await readProjectConfig();

    await fs.mkdir(repoPath(), { recursive: true });
    await fs.mkdir(path.join(repoPath(), "commits"), { recursive: true });
    await fs.mkdir(path.join(repoPath(), "staging"), { recursive: true });

    await writeProjectConfig({
        ...existing,
        apiUrl: existing.apiUrl || session.apiUrl,
    });

    console.log("Repository initialised!");

    if (existing.repoId) {
        console.log(`Linked to ${existing.repoName || "repository"} (${existing.repoId}).`);
    } else {
        console.log("Not linked yet. Run `basicvcs login`, then `basicvcs link <repoUrl>`.");
    }
}

async function add(filePath) {
    const staging = path.join(repoPath(), "staging");
    await fs.mkdir(staging, { recursive: true });

    const fileName = path.basename(filePath);
    await fs.copyFile(path.resolve(process.cwd(), filePath), path.join(staging, fileName));
    console.log(`File ${fileName} added to the staging area!`);
}

async function commit(message) {
    const project = await readProjectConfig();
    const staging = path.join(repoPath(), "staging");
    const files = await fs.readdir(staging).catch(() => []);

    if (!files.length) {
        throw new Error("Nothing staged. Run `basicvcs add <file>` first.");
    }

    const commitId = uuidv4();
    const commitDir = path.join(repoPath(), "commits", commitId);
    await fs.mkdir(commitDir, { recursive: true });

    for (const file of files) {
        await fs.copyFile(path.join(staging, file), path.join(commitDir, file));
    }

    await fs.writeFile(
        path.join(commitDir, "commit.js"),
        JSON.stringify(
            {
                id: commitId,
                message,
                date: new Date().toISOString(),
                files,
                repoId: project.repoId || null,
            },
            null,
            2
        )
    );

    console.log(`Commit ${commitId} created with message: ${message}`);
}

async function push() {
    const session = await requireSession();
    const project = await readProjectConfig();

    if (!project.repoId) {
        throw new Error("This folder is not linked. Run `basicvcs link <repoUrl>` first.");
    }

    const apiUrl = project.apiUrl || session.apiUrl;
    const commitsPath = path.join(repoPath(), "commits");
    const entries = await fs.readdir(commitsPath, { withFileTypes: true }).catch(() => []);
    const commitDirs = entries.filter((entry) => entry.isDirectory());

    if (!commitDirs.length) {
        console.log("No commits to push. Run `basicvcs commit \"message\"` first.");
        return;
    }

    let uploaded = 0;

    for (const commitDir of commitDirs) {
        const commitPath = path.join(commitsPath, commitDir.name);
        const files = await listCommitDir(commitPath);

        const presign = await apiRequest(`/repo/${project.repoId}/commits/presign`, {
            method: "POST",
            apiUrl,
            token: session.token,
            body: {
                commitId: commitDir.name,
                files: files.map((name) => ({
                    name,
                    contentType:
                        name === "commit.js" ? "application/json" : "application/octet-stream",
                })),
            },
        });

        for (const upload of presign.uploads) {
            const content = await fs.readFile(path.join(commitPath, upload.name));
            const response = await fetch(upload.url, {
                method: "PUT",
                headers: { "Content-Type": upload.contentType },
                body: content,
            });

            if (!response.ok) {
                throw new Error(`Upload failed for ${upload.name} (${response.status}).`);
            }

            uploaded += 1;
        }
    }

    console.log(
        `Pushed ${uploaded} files from ${commitDirs.length} commit(s) to ${apiUrl}.`
    );
    console.log("Refresh the repository History tab.");
}

async function pull() {
    const session = await requireSession();
    const project = await readProjectConfig();

    if (!project.repoId) {
        throw new Error("This folder is not linked. Run `basicvcs link <repoUrl>` first.");
    }

    const data = await apiRequest(`/repo/${project.repoId}/commits/download`, {
        apiUrl: project.apiUrl || session.apiUrl,
        token: session.token,
    });

    if (!data.files?.length) {
        console.log("No commits found in S3 for this repository.");
        return;
    }

    let downloaded = 0;

    for (const file of data.files) {
        const parts = safeParts(file.name);
        if (parts.length < 2) continue;

        const destination = path.join(repoPath(), "commits", ...parts);
        await fs.mkdir(path.dirname(destination), { recursive: true });

        const response = await fetch(file.url);
        if (!response.ok) {
            throw new Error(`Download failed for ${file.name} (${response.status}).`);
        }

        await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
        downloaded += 1;
    }

    console.log(`Pulled ${downloaded} files into .hidGit/commits.`);
}

async function revert(commitID) {
    const commitDir = path.join(repoPath(), "commits", commitID);
    const projectDir = path.dirname(repoPath());
    const entries = await fs.readdir(commitDir, { withFileTypes: true });
    let restored = 0;

    for (const entry of entries) {
        if (!entry.isFile() || entry.name === "commit.js") continue;

        await fs.copyFile(
            path.join(commitDir, entry.name),
            path.join(projectDir, entry.name)
        );
        restored += 1;
    }

    console.log(`Reverted to commit ${commitID} (${restored} files restored).`);
}

function run(handler) {
    return async (argv) => {
        try {
            await handler(argv);
        } catch (err) {
            console.error(err.message);
            process.exitCode = 1;
        }
    };
}

yargs(hideBin(process.argv))
    .scriptName("basicvcs")
    .command(
        "login",
        "Sign in to the BasicVCS API",
        (y) =>
            y
                .option("email", { type: "string", describe: "Account email" })
                .option("password", { type: "string", describe: "Account password" })
                .option("api", { type: "string", describe: "API base URL" }),
        run(login)
    )
    .command("logout", "Remove the saved CLI token", {}, run(logout))
    .command(
        "config <action> [key] [value]",
        "Show or set CLI configuration",
        (y) =>
            y
                .positional("action", { choices: ["set", "get", "show"] })
                .positional("key", { type: "string" })
                .positional("value", { type: "string" }),
        run(configCommand)
    )
    .command(
        "link <repo>",
        "Link this folder to a repository URL or id",
        (y) =>
            y
                .positional("repo", { type: "string" })
                .option("api", { type: "string", describe: "API base URL" }),
        run(link)
    )
    .command("init", "Initialise .hidGit in the current folder", {}, run(init))
    .command(
        "add <file>",
        "Stage a file",
        (y) => y.positional("file", { type: "string" }),
        run((argv) => add(argv.file))
    )
    .command(
        "commit <message>",
        "Create a commit from staged files",
        (y) => y.positional("message", { type: "string" }),
        run((argv) => commit(argv.message))
    )
    .command("push", "Upload commits through presigned S3 URLs", {}, run(push))
    .command("pull", "Download this repository's commits", {}, run(pull))
    .command(
        "revert <commitID>",
        "Restore files from a commit",
        (y) => y.positional("commitID", { type: "string" }),
        run((argv) => revert(argv.commitID))
    )
    .demandCommand(1, "Pick a command")
    .help()
    .parse();

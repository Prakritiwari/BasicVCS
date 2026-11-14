const fs = require("fs").promises;
const os = require("os");
const path = require("path");

const GLOBAL_DIR = path.join(os.homedir(), ".basicvcs");
const GLOBAL_FILE = path.join(GLOBAL_DIR, "config.json");

function repoPath() {
    return path.resolve(process.cwd(), ".hidGit");
}

function configPath() {
    return path.join(repoPath(), "config.json");
}

async function readJson(file) {
    try {
        return JSON.parse(await fs.readFile(file, "utf8"));
    } catch (err) {
        return {};
    }
}

async function writeJson(file, value) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);

    if (process.platform !== "win32") {
        await fs.chmod(file, 0o600).catch(() => {});
    }
}

async function readGlobalConfig() {
    return readJson(GLOBAL_FILE);
}

async function writeGlobalConfig(config) {
    return writeJson(GLOBAL_FILE, config);
}

async function readProjectConfig() {
    return readJson(configPath());
}

async function writeProjectConfig(config) {
    return writeJson(configPath(), config);
}

function normaliseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
}

async function resolveApiUrl(explicit) {
    if (explicit) return normaliseUrl(explicit);
    if (process.env.BASICVCS_API_URL) return normaliseUrl(process.env.BASICVCS_API_URL);

    const global = await readGlobalConfig();
    return normaliseUrl(global.apiUrl || "http://localhost:3000");
}

async function getSession(options = {}) {
    const global = await readGlobalConfig();
    return {
        apiUrl: await resolveApiUrl(options.apiUrl),
        token: global.token || null,
        userId: global.userId || null,
        email: global.email || null,
    };
}

async function requireSession(options = {}) {
    const session = await getSession(options);

    if (!session.token) {
        throw new Error("Not signed in. Run `basicvcs login` first.");
    }

    return session;
}

function s3Prefix(repoId) {
    return `repos/${repoId}/`;
}

function commitsPrefix(repoId) {
    return `${s3Prefix(repoId)}commits/`;
}

module.exports = {
    GLOBAL_FILE,
    repoPath,
    configPath,
    readGlobalConfig,
    writeGlobalConfig,
    readProjectConfig,
    writeProjectConfig,
    resolveApiUrl,
    getSession,
    requireSession,
    s3Prefix,
    commitsPrefix,
};

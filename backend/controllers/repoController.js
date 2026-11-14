const mongoose = require("mongoose");
const Repository = require("../model/repoModel");
const User = require("../model/userModel");
const Issue = require("../model/issueModel");
const { s3, S3_BUCKET } = require("../config/aws-config");

const COMMITS_PREFIX = (repositoryId) => `repos/${repositoryId}/commits/`;

function ownerIdOf(repository) {
  return String(repository.owner?._id ?? repository.owner);
}

function isOwner(repository, user) {
  return Boolean(user) && ownerIdOf(repository) === String(user.id);
}

function canRead(repository, user) {
  return Boolean(repository.visibility) || isOwner(repository, user);
}

function safeRelativeName(value) {
  if (typeof value !== "string") return null;
  const name = value.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!name || name.length > 300) return null;
  const parts = name.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) return null;
  return name;
}

async function createRepository(req, res) {
  const { name, issues, content, description, visibility } = req.body;
  const owner = req.user?.id;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(401).json({ error: "Authentication required!" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository created!",
      repositoryID: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation : ", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllRepositories(req, res) {
  try {
    const filter = req.user
      ? { $or: [{ visibility: true }, { owner: req.user.id }] }
      : { visibility: true };

    const repositories = await Repository.find(filter)
      .populate("owner", "username")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID!" });
    }

    const repository = await Repository.findById(id)
      .populate("owner", "username")
      .populate("issues");

    if (!repository || !canRead(repository, req.user)) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json([repository]);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;

  try {
    const repositories = await Repository.find({ name })
      .populate("owner", "username")
      .populate("issues");

    res.json(repositories.filter((repository) => canRead(repository, req.user)));
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const repositories = await Repository.find({ owner: userID })
      .populate("owner", "username")
      .populate("issues");

    // An empty list is a valid result, not an error.
    res.json({ message: "Repositories found!", repositories });
  } catch (err) {
    console.error("Error during fetching user repositories : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryCommits(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Repository ID!" });
  }

  try {
    const repository = await Repository.findById(id);
    if (!repository || !canRead(repository, req.user)) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const prefix = COMMITS_PREFIX(id);
    const objects = [];
    let token;

    do {
      const page = await s3
        .listObjectsV2({
          Bucket: S3_BUCKET,
          Prefix: prefix,
          ContinuationToken: token,
        })
        .promise();

      objects.push(...(page.Contents || []));
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);

    const groups = new Map();

    for (const object of objects) {
      const relative = object.Key.slice(prefix.length);
      if (!relative) continue;

      const [commitId, ...fileParts] = relative.split("/");
      if (!commitId) continue;

      if (!groups.has(commitId)) {
        groups.set(commitId, {
          id: commitId,
          files: [],
          lastModified: object.LastModified || null,
        });
      }

      const group = groups.get(commitId);

      if (
        object.LastModified &&
        (!group.lastModified || object.LastModified > group.lastModified)
      ) {
        group.lastModified = object.LastModified;
      }

      if (fileParts.length) {
        const fileName = fileParts.join("/");
        if (fileName !== "commit.js") group.files.push(fileName);
      }
    }

    const commits = await Promise.all(
      [...groups.values()].map(async (group) => {
        let metadata = {};

        try {
          const object = await s3
            .getObject({
              Bucket: S3_BUCKET,
              Key: `${prefix}${group.id}/commit.js`,
            })
            .promise();

          metadata = JSON.parse(object.Body.toString("utf8"));
        } catch (err) {
          // Older commits may not have metadata; derive what we can from S3.
        }

        const files = (
          Array.isArray(metadata.files) && metadata.files.length
            ? metadata.files
            : group.files
        ).filter((file) => file && file !== "commit.js");

        const date = metadata.date || (group.lastModified ? group.lastModified.toISOString() : null);

        return {
          id: group.id,
          message: metadata.message || "No commit message",
          date,
          files: [...new Set(files)],
          repoId: id,
        };
      })
    );

    commits.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA || String(b.id).localeCompare(String(a.id));
    });

    res.json({
      message: "Commits fetched!",
      bucket: S3_BUCKET,
      prefix,
      commits,
    });
  } catch (err) {
    console.error("Error during fetching commits from S3 : ", err.message);
    res.status(500).json({
      error: "Could not read commits from S3. Check the AWS credentials and bucket.",
    });
  }
}

async function presignCommitUpload(req, res) {
  const { id } = req.params;
  const { commitId, files } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID!" });
    }

    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (!isOwner(repository, req.user)) {
      return res.status(403).json({ error: "Only the repository owner can push." });
    }

    if (!/^[a-zA-Z0-9-]{6,80}$/.test(String(commitId || ""))) {
      return res.status(400).json({ error: "Invalid commit id." });
    }

    if (!Array.isArray(files) || !files.length || files.length > 500) {
      return res.status(400).json({ error: "Provide between 1 and 500 files." });
    }

    const prefix = COMMITS_PREFIX(id) + `${commitId}/`;
    const seen = new Set();
    const uploads = [];

    for (const file of files) {
      const name = safeRelativeName(file?.name);
      if (!name || seen.has(name)) {
        return res.status(400).json({ error: "Invalid or duplicate file name." });
      }
      seen.add(name);

      const contentType =
        typeof file.contentType === "string" && file.contentType
          ? file.contentType
          : "application/octet-stream";

      const key = `${prefix}${name}`;
      const url = await s3.getSignedUrlPromise("putObject", {
        Bucket: S3_BUCKET,
        Key: key,
        Expires: 900,
        ContentType: contentType,
      });

      uploads.push({ name, key, url, contentType });
    }

    res.json({
      message: "Upload URLs ready.",
      bucket: S3_BUCKET,
      prefix,
      uploads,
    });
  } catch (err) {
    console.error("Error creating upload URLs : ", err.message);
    res.status(500).json({ error: "Could not create S3 upload URLs." });
  }
}

async function fetchCommitDownloadUrls(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID!" });
    }

    const repository = await Repository.findById(id);
    if (!repository || !canRead(repository, req.user)) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const prefix = COMMITS_PREFIX(id);
    const objects = [];
    let token;

    do {
      const page = await s3
        .listObjectsV2({
          Bucket: S3_BUCKET,
          Prefix: prefix,
          ContinuationToken: token,
        })
        .promise();

      objects.push(...(page.Contents || []));
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);

    const files = await Promise.all(
      objects
        .filter((object) => object.Key && object.Key !== prefix)
        .map(async (object) => ({
          name: object.Key.slice(prefix.length),
          key: object.Key,
          size: object.Size,
          url: await s3.getSignedUrlPromise("getObject", {
            Bucket: S3_BUCKET,
            Key: object.Key,
            Expires: 900,
          }),
        }))
    );

    res.json({ message: "Download URLs ready.", bucket: S3_BUCKET, prefix, files });
  } catch (err) {
    console.error("Error creating download URLs : ", err.message);
    res.status(500).json({ error: "Could not create S3 download URLs." });
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (!isOwner(repository, req.user)) {
      return res.status(403).json({ error: "Only the repository owner can edit it." });
    }

    const incomingContent = Array.isArray(content) ? content : [content];
    for (const item of incomingContent) {
      if (typeof item === "string" && item.trim() && !repository.content.includes(item)) {
        repository.content.push(item);
      }
    }

    if (typeof description === "string") {
      repository.description = description;
    }

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function toggleVisibilityByID(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (!isOwner(repository, req.user)) {
      return res.status(403).json({ error: "Only the repository owner can change visibility." });
    }

    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility : ", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (!isOwner(repository, req.user)) {
      return res.status(403).json({ error: "Only the repository owner can delete it." });
    }

    await repository.deleteOne();
    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).send("Server error");
  }
}



module.exports = {
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryCommits,
    presignCommitUpload,
    fetchCommitDownloadUrls,
    fetchRepositoryByName,
    updateRepositoryById,
    deleteRepositoryById,
    toggleVisibilityByID,
    fetchRepositoriesForCurrentUser
}
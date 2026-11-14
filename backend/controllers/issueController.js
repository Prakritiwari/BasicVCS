const mongoose = require("mongoose");
const Repository = require("../model/repoModel");
const User = require("../model/userModel");
const Issue = require("../model/issueModel");

function isRepositoryOwner(repository, user) {
  return Boolean(user) && String(repository.owner?._id ?? repository.owner) === String(user.id);
}

function canReadRepository(repository, user) {
  return Boolean(repository.visibility) || isRepositoryOwner(repository, user);
}

async function createIssue(req, res) {
  const { title, description } = req.body;
  const repository = req.body.repository || req.params.id;

  try {
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Issue title is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(repository)) {
      return res.status(400).json({ error: "A valid repository id is required!" });
    }

    const repo = await Repository.findById(repository);
    if (!repo) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (!isRepositoryOwner(repo, req.user)) {
      return res.status(403).json({ error: "Only the repository owner can create issues." });
    }

    const issue = new Issue({
      title,
      description,
      repository,
    });

    await issue.save();

    res.status(201).json(issue);
  } catch (err) {
    console.error("Error during issue creation : ", err.message);
    res.status(500).json({ error: "Could not create the issue." });
  }
}

async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    const repo = await Repository.findById(issue.repository);
    if (!repo || !isRepositoryOwner(repo, req.user)) {
      return res.status(403).json({ error: "Only the repository owner can edit issues." });
    }

    issue.title = title;
    issue.description = description;
    issue.status = status;

    await issue.save();

    res.json({ message: "Issue updated", issue });
  } catch (err) {
    console.error("Error during issue updation : ", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteIssueById(req, res) {
  const { id } = req.params;

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    const repo = await Repository.findById(issue.repository);
    if (!repo || !isRepositoryOwner(repo, req.user)) {
      return res.status(403).json({ error: "Only the repository owner can delete issues." });
    }

    await issue.deleteOne();
    res.json({ message: "Issue deleted" });
  } catch (err) {
    console.error("Error during issue deletion : ", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllIssues(req, res) {
  const repository = req.query.repository || req.params.id;

  try {
    if (repository) {
      if (!mongoose.Types.ObjectId.isValid(repository)) {
        return res.status(400).json({ error: "Invalid Repository ID!" });
      }

      const repo = await Repository.findById(repository);
      if (!repo || !canReadRepository(repo, req.user)) {
        return res.status(404).json({ error: "Repository not found!" });
      }

      const issues = await Issue.find({ repository }).sort({ _id: -1 });
      return res.status(200).json(issues);
    }

    const ownRepositories = await Repository.find({ owner: req.user.id }).distinct("_id");
    const issues = await Issue.find({ repository: { $in: ownRepositories } }).sort({ _id: -1 });

    res.status(200).json(issues);
  } catch (err) {
    console.error("Error during issue fetching : ", err.message);
    res.status(500).send("Server error");
  }
}

async function getIssueById(req, res) {
  const { id } = req.params;

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    const repo = await Repository.findById(issue.repository);
    if (!repo || !canReadRepository(repo, req.user)) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json(issue);
  } catch (err) {
    console.error("Error during issue fetching : ", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
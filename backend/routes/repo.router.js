const express = require("express");
const repoController = require("../controllers/repoController");
const { authenticate, optionalAuth, requireSelf } = require("../middleware/authMiddleware");

const repoRouter = express.Router();

// Specific/static routes must be registered before the generic /repo/:id route.
repoRouter.post("/repo/create", authenticate, repoController.createRepository);
repoRouter.get("/repo/all", optionalAuth, repoController.getAllRepositories);
repoRouter.get(
    "/repo/user/:userID",
    authenticate,
    requireSelf("userID"),
    repoController.fetchRepositoriesForCurrentUser
);
repoRouter.get("/repo/name/:name", optionalAuth, repoController.fetchRepositoryByName);

repoRouter.post(
    "/repo/:id/commits/presign",
    authenticate,
    repoController.presignCommitUpload
);
repoRouter.get(
    "/repo/:id/commits/download",
    optionalAuth,
    repoController.fetchCommitDownloadUrls
);
repoRouter.get(
    "/repo/:id/commits",
    optionalAuth,
    repoController.fetchRepositoryCommits
);

repoRouter.put("/repo/update/:id", authenticate, repoController.updateRepositoryById);
repoRouter.delete("/repo/delete/:id", authenticate, repoController.deleteRepositoryById);
repoRouter.patch("/repo/toggle/:id", authenticate, repoController.toggleVisibilityByID);
repoRouter.get("/repo/:id", optionalAuth, repoController.fetchRepositoryById);

module.exports = repoRouter;

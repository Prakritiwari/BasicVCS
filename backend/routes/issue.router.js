const express = require("express");
const issueController = require("../controllers/issueController");
const { authenticate, optionalAuth } = require("../middleware/authMiddleware");

const issueRouter = express.Router();

issueRouter.post("/issue/create", authenticate, issueController.createIssue);
issueRouter.put("/issue/update/:id", authenticate, issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", authenticate, issueController.deleteIssueById);
issueRouter.get("/issue/all", authenticate, issueController.getAllIssues);
issueRouter.get("/issue/:id", optionalAuth, issueController.getIssueById);

module.exports = issueRouter;

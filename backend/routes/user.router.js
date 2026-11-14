const express = require("express");
const userController = require("../controllers/userController");
const { authenticate, optionalAuth, requireSelf } = require("../middleware/authMiddleware");

const userRouter = express.Router();

userRouter.get("/allUsers", authenticate, userController.getAllUsers);
userRouter.get("/allUser", authenticate, userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.post("/cli/login", userController.cliLogin);
userRouter.get("/userProfile/:id", optionalAuth, userController.getUserProfile);
userRouter.put("/updateProfile/:id", authenticate, requireSelf("id"), userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", authenticate, requireSelf("id"), userController.deleteUserProfile);

module.exports = userRouter;

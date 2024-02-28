const express = require("express");
const {
  signUp,
  createManager,
  signIn,
  updateProfile,
  allUsers,
  singleUser,
  profile,
  updatePassword,
  retriveAllManagerUsers,
  changeStatus,
  updateUser,
  changePassword,
  forgetUserPassword,
  resetUserPassword,
  deleteUser,
} = require("../controllers/userController");
const router = express.Router();
const fs = require("fs");
const userFileUploadMiddleware = require("../middlewares/fileUpload");

const UPLOADS_FOLDER_USERS = "./public/uploads/users";
const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);
const { isValidUser, verifyRefreshToken } = require("../middlewares/auth");
const validationMiddleware = require("../middlewares/user/signupValidation");

const auth = require("../middlewares/auth");
const parseData = require("../middlewares/parseData.js");

if (!fs.existsSync(UPLOADS_FOLDER_USERS)) {
  // If not, create the folder
  fs.mkdirSync(UPLOADS_FOLDER_USERS, { recursive: true }, (err) => {
    if (err) {
      console.error("Error creating uploads folder:", err);
    } else {
      console.log("Uploads folder created successfully");
    }
  });
}

//Sign-up user
router.post("/sign-up", auth("manager"), signUp);
router.post("/create-manager", createManager);
router.post("/sign-in", signIn);
router.get("/", auth("manager"), allUsers);
router.get("/managers-users", auth("manager"), retriveAllManagerUsers);
router.get("/profile", auth("manager", "user"), profile);
router.get("/:id", auth("manager", "user"), singleUser);
router.patch(
  "/",
  auth("manager", "user"),
  [uploadUsers.single("file")],
  parseData(),
  updateProfile
);
router.patch(
  "/update-user/:id",
  auth("manager"),
  [uploadUsers.single("file")],
  parseData(),
  updateUser
);
router.patch("/update-password", auth("manager", "user"), updatePassword);
router.patch("/change-status/:id", auth("manager"), changeStatus);
router.patch("/change-password", auth("manager", "user"), changePassword);
router.patch("/change-password", auth("manager", "user"), changePassword);
router.patch("/forget-password", forgetUserPassword);
router.patch("/reset-password", resetUserPassword);
router.delete("/:id", auth("manager"), deleteUser);
module.exports = router;

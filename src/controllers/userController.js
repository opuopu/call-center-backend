require("dotenv").config();
const response = require("../helpers/response");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const unlinkImage = require("../common/image/unlinkImage");
const {
  addUser,
  userSignIn,
  addManager,
  getAllUsers,
  updateUserByManager,
  getSingleUser,
  getProfile,
  updateUserPassword,
  getManagerUsers,
  changeUserStatus,
  updateMyProfile,
  changePasswordFromDB,
  forgetPassword,
  resetPassword,
  deleteUserFromDb,
} = require("../services/userService");
const sendResponse = require("../utils/sendResponse");
const catchAsync = require("../utils/catchAsync");
const { createFileDetails } = require("../common/image/createImage.js");
const generateRandomPassword = require("../utils/randomPasswordGenerator.js");

// create a manager
const createManager = catchAsync(async (req, res) => {
  const result = await addManager(req.body);
  sendResponse(res, {
    statusCode: 201,
    data: result,
    message: "Signup successful",
    success: true,
  });
});

//Sign up
const signUp = catchAsync(async (req, res) => {
  const { userId, role, teamId } = req.user;
  if (role === "manager" && userId) {
    req.body.managerId = userId;
    req.body.password = generateRandomPassword();
    req.body.needPasswordChange = true;
    req.body.teamId = teamId;
  }
  const result = await addUser(req.body);
  sendResponse(res, {
    statusCode: 201,
    data: result,
    message: "User Created Successfully",
    success: true,
  });
});

//Sign in
const signIn = catchAsync(async (req, res) => {
  const result = await userSignIn(req.body);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Signed in successfully.",
    success: true,
  });
});

const profile = catchAsync(async (req, res) => {
  const id = req.user.userId;
  const result = await getProfile(id);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "User Profile successfully",
    success: true,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  if (req?.file) {
    req.body.image = createFileDetails("users", req?.file?.filename);
  }
  const id = req.user.userId;
  console.log(id, req.body);

  const result = await updateMyProfile(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "User Updated successfully",
    success: true,
  });
});
const updateUser = catchAsync(async (req, res) => {
  console.log(req.params.id);
  if (req?.file) {
    req.body.image = createFileDetails("users", req?.file?.filename);
  }
  const result = await updateUserByManager(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "User Updated successfully",
    success: true,
  });
});

const allUsers = catchAsync(async (req, res) => {
  const result = await getAllUsers(req.query);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Users Retrieved successfully",
    success: true,
  });
});

const retriveAllManagerUsers = catchAsync(async (req, res) => {
  req.query.managerId = req.user.userId;
  console.log(req.user.userId, "hitted");
  const result = await getManagerUsers(req.query);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Users Retrieved successfully",
    success: true,
  });
});
const singleUser = catchAsync(async (req, res) => {
  const result = await getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "User Retrieve successfully",
    success: true,
  });
});
const updatePassword = catchAsync(async (req, res) => {
  const id = req.user.userId;
  console.log(req);
  const result = await updateUserPassword(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Password updated successfully",
    success: true,
  });
});
const changeStatus = catchAsync(async (req, res) => {
  const id = req.user.userId;
  const result = await changeUserStatus(req.params.id, id, req.body.status);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Status Changed Successfully",
    success: true,
  });
});
const changePassword = catchAsync(async (req, res) => {
  const id = req.user.userId;
  const result = await changePasswordFromDB(id, req.body.password);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Password Changed Successfully",
    success: true,
  });
});
const forgetUserPassword = catchAsync(async (req, res) => {
  const result = await forgetPassword(req.body.email);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Reset Password Link Successfully Sent Your Email",
    success: true,
  });
});
const resetUserPassword = catchAsync(async (req, res) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  const result = await resetPassword(token, req?.body);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Password Reseted Successfully",
    success: true,
  });
});
const deleteUser = catchAsync(async (req, res) => {
  const result = await deleteUserFromDb(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "user deleted Successfully",
    success: true,
  });
});

module.exports = {
  signUp,
  signIn,
  updateProfile,
  profile,
  createManager,
  allUsers,
  singleUser,
  updatePassword,
  retriveAllManagerUsers,
  changeStatus,
  updateUser,
  changePassword,
  forgetUserPassword,
  resetUserPassword,
  deleteUser,
};

const httpStatus = require("http-status");
const AppError = require("../errors/AppError");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QueryBuilder = require("../builder/QueryBuilder");
const unlinkImage = require("../common/image/unlinkImage.js");
const sendEmail = require("../utils/sendEmail.js");
const { generateNewTeam } = require("../utils/Team.utils.js");

const addManager = async (userBody) => {
  const { userName, email } = userBody;
  const teamId = await generateNewTeam();
  userBody.teamId = teamId;
  const userExist = await User.findOne({ email });
  if (userExist) {
    throw new AppError(httpStatus.CONFLICT, "Manager already exists");
  }
  const checkDuplicateUserName = await User.findOne({
    userName: new RegExp("^" + userName + "$", "i"),
  });
  if (checkDuplicateUserName) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This username is already in use. Please choose a different one."
    );
  }
  const user = await User.create(userBody);

  return user;
};

const addUser = async (userBody) => {
  const { email, userName } = userBody;
  // Check if the user already exists
  const userExist = await User.findOne({ email });
  if (userExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this same email"
    );
  }
  const checkDuplicateUserName = await User.findOne({
    userName: new RegExp("^" + userName + "$", "i"),
  });
  if (checkDuplicateUserName) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This username is already in use. Please choose a different one."
    );
  }
  // Create the user in the database
  const user = await User.create(userBody);
  if (user) {
    await sendEmail(
      userBody?.email,
      "Your Password is",
      "Your One Time Password is",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
        <p style="font-size: 24px; font-weight: bold; color: #2ecc71; text-align: center;">${userBody?.password}</p>
        <p style="font-size: 14px; color: #888;">Please do not share this code with anyone for security reasons.</p>
      </div>
    `
    );
  }
  return user;
};

// Sign in a user
const userSignIn = async (userBody) => {
  const { email, password } = userBody;
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found");
  }
  if (user?.status !== "active") {
    throw new AppError(httpStatus.BAD_REQUEST, "Your Account Is Disabled");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password Doesn't Match");
  }

  // Token, set the Cokkie
  const accessToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      teamId: user?.teamId,
    },
    "secret2020",
    { expiresIn: "1d" }
  );

  return { user, accessToken };
};

const getProfile = async (id) => {
  const result = await User.findById(id);
  return result;
};

const updateMyProfile = async (id, userBody) => {
  const { email, userName } = userBody;
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Not Found");
  }
  if (user?.email !== email) {
    const isDuplicateUser = await User.findOne({ email });
    if (isDuplicateUser) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User Already Exist With This Same Email. Try Another One"
      );
    }
  }

  const result = await User.findByIdAndUpdate(id, userBody, {
    new: true,
  });

  if (userBody?.image && user?.image) {
    unlinkImage(user?.image);
  }
  return result;
};
const updateUserByManager = async (id, userBody) => {
  const { email } = userBody;
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Not Found");
  }
  if (user?.email !== email) {
    const isDuplicateUser = await User.findOne({ email });
    if (isDuplicateUser) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User Already Exist With This Same Email. Try Another One"
      );
    }
  }

  const result = await User.findByIdAndUpdate(id, userBody, {
    new: true,
  });

  if (userBody?.image && user?.image) {
    unlinkImage(user?.image);
  }
  return result;
};

const getAllUsers = async (query) => {
  const userModel = new QueryBuilder(User.find(), query)
    .search()
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await userModel.modelQuery;
  const meta = await userModel.meta();
  return { result, meta };
};

const getSingleUser = async (id) => {
  const result = await User.findById(id);
  return result;
};

const updateUserPassword = async (id, payload) => {
  const { oldPassword } = payload;
  const isUserExist = await User.findById(id);

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Not Found");
  }

  const isPasswordMatched = bcrypt.compare(oldPassword, isUserExist?.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "old password does not match");
  }
  // if old and new password are the same
  if (oldPassword === payload?.newPassword) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      "old password and new password should not be same"
    );
  }
  const result = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        password: payload?.newPassword,
      },
    },
    { new: true }
  );
  return result;
};
const getManagerUsers = async (query) => {
  // const userQuery = new QueryBuilder(User.find(), query)
  //   .search()
  //   .filter()
  //   .paginate()
  //   .sort()
  //   .fields();
  // const result = await userQuery.modelQuery;
  // const meta = await userQuery.meta();
  // console.log(meta);
  // return {
  //   data: result,
  //   meta,
  // };
  const result = await User.find(query);
  return result;
};

const changeUserStatus = async (id, managerId, status) => {
  const result = await User.findOneAndUpdate(
    {
      $and: [{ _id: id }, { managerId: managerId }],
    },
    {
      $set: {
        status: status,
      },
    },
    { new: true }
  );
  return result;
};

const changePasswordFromDB = async (userId, password) => {
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Not Found");
  }

  const result = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        password: password,
        needPasswordChange: false,
      },
    },
    { new: true }
  );
  return result;
};
const forgetPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User Not Exist With This Email"
    );
  }
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    "secret2020",
    { expiresIn: "1h" }
  );

  const resetUiLink = `http://165.227.211.138:3001/reset-password?email=${user?.email}&token=${accessToken}`;
  if (resetUiLink) {
    await sendEmail(
      email,
      "Your Reset Password Link",
      "Your Reset Password Link",
      `
      <div style="text-align: center; padding: 20px;">
  <p style="font-size: 18px;">This link is only valid for 1 hour. Please reset your password within this time.</p>
  <a href="${resetUiLink}" target="_blank" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #54C999; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
  <p style="font-size: 14px; color: #888;">For security reasons, please do not share this link with anyone.</p>
</div>

    
    `
    );
  }
  return null;
};
const resetPassword = async (token, payload) => {
  console.log("token", token);
  const { email, password } = payload;
  if (!token) {
    throw new AppError(401, "you are not authorized!");
  }
  let decode;
  try {
    decode = jwt.verify(token, "secret2020");
  } catch (err) {
    throw new AppError(httpStatus.UNAUTHORIZED, "unauthorized");
  }
  if (decode?.email !== email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Something Went Wrong. Please Provide Valid Email"
    );
  }
  const result = await User.findByIdAndUpdate(
    decode?.userId,
    {
      $set: { password: password },
    },
    { new: true }
  );
  return result;
};

const deleteUserFromDb = async (id) => {
  const result = await User.findOneAndDelete(id);
  return result;
};

module.exports = {
  addUser,
  addManager,
  userSignIn,
  getProfile,
  updateMyProfile,
  getAllUsers,
  getSingleUser,
  updateUserPassword,
  getManagerUsers,
  changeUserStatus,
  updateUserByManager,
  changePasswordFromDB,
  forgetPassword,
  resetPassword,
  deleteUserFromDb,
};

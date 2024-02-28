const httpStatus = require("http-status");
const AppError = require("../errors/AppError.js");
const { Question } = require("../models/Quiz.js");
const UserResponse = require("../models/UserResponses.js");
const mongoose = require("mongoose");
const LeaderBoard = require("../models/leaderBorad.js");
const insertResponseintoDb = async (payload) => {
  const { questionId, answerId } = payload;
  const questionObjectId = new mongoose.Types.ObjectId(questionId);
  const answerObjectId = new mongoose.Types.ObjectId(answerId);
  const findAnswer = await Question.aggregate([
    { $match: { _id: questionObjectId } },
    { $unwind: "$answers" },
    { $match: { "answers._id": answerObjectId } },
    {
      $project: {
        _id: 0,
        isCorrect: {
          $ifNull: ["$answers.isCorrect", false],
        },
      },
    },
  ]);
  const isCorrect = findAnswer[0]?.isCorrect;
  if (isCorrect) {
    payload.score = 3;
  } else {
    payload.score = 1;
  }

  const result = await UserResponse.create(payload);
  return result;
};
const CalculateTotalScore = async (contextId, userId) => {
  const contextObjectId = new mongoose.Types.ObjectId(contextId);
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const result = await UserResponse.aggregate([
    { $match: { userId: userObjectId } },
    {
      $lookup: {
        from: "questions",
        localField: "questionId",
        foreignField: "_id",
        as: "questionss",
      },
    },
    { $unwind: "$questionss" },
    { $match: { "questionss.context": contextObjectId } },
    {
      $group: {
        _id: null,
        totalScore: {
          $sum: "$score",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalScore: 1,
      },
    },
  ]);
  return result[0];
};
const getManagerLeaderBoardDataFromDB = async (managerId) => {
  const managerObjectId = new mongoose.Types.ObjectId(managerId);
  const result = await UserResponse.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: "$users" },
    {
      $lookup: {
        from: "leaderboards",
        let: { contextId: "$contextId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$contextId", "$$contextId"],
              },
            },
          },
        ],
        as: "contexts",
      },
    },
    {
      $match: {
        // if we want to find managers users data then uncomment this line=====>
        // "user.managerId":managerObjectId,

        // // if we want to find managers users data then comment this  this line============>
        "users.role": "manager",
        "contexts.0": { $exists: true },
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "questionId",
        foreignField: "_id",
        as: "questions",
      },
    },
    {
      $unwind: "$users",
    },
    {
      $unwind: "$questions",
    },
    {
      $group: {
        _id: { userId: "$users._id" },
        score: { $sum: "$score" },
        userDetails: { $first: "$users" },
      },
    },

    { $sort: { score: -1 } },
  ]);

  return result;
};
const getUsersLeaderboardDataFromDB = async () => {
  const result = await UserResponse.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: "$users" },
    {
      $lookup: {
        from: "leaderboards",
        let: { contextId: "$contextId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$contextId", "$$contextId"],
              },
            },
          },
        ],
        as: "contexts",
      },
    },
    {
      $match: {
        "users.role": "user",
        "contexts.0": { $exists: true },
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "questionId",
        foreignField: "_id",
        as: "questions",
      },
    },
    {
      $unwind: "$users",
    },
    {
      $unwind: "$questions",
    },
    {
      $group: {
        _id: { userId: "$users._id" },
        score: { $sum: "$score" },
        userDetails: { $first: "$users" },
      },
    },

    { $sort: { score: -1 } },
  ]);
  return result;
};

const deleteAllResponsesFromDB = async (contextId, userId) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deleteAllResponses = await UserResponse.deleteMany(
      {
        userId: userId,
        contextId: contextId,
      },
      { session }
    );

    if (!deleteAllResponses.acknowledged) {
      throw new AppError(httpStatus.BAD_REQUEST, "something went wrong");
    }
    const deleteLeaderBoard = await LeaderBoard.deleteMany(
      {
        userId: userId,
        contextId: contextId,
      },
      { session }
    );
    if (!deleteLeaderBoard.acknowledged) {
      throw new AppError(httpStatus.BAD_REQUEST, "something went wrong");
    }
    await session.commitTransaction();
    session.endSession();
    return deleteAllResponses[0];
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    throw new Error(err);
  }
};

const resetAllSessionFromDb = async (userId) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await UserResponse.deleteMany({ userId }, { session });
    if (!result?.acknowledged) {
      throw new AppError(httpStatus.BAD_REQUEST, "something went wrong");
    }
    const deleteAllContextsFromLeaderboard = await LeaderBoard.findOneAndUpdate(
      { userId },
      { $set: { contextId: [] } },
      { session }
    );
    console.log(deleteAllContextsFromLeaderboard);
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(err);
  }
};

const resetContextWiseSession = async (userId) => {};
module.exports = {
  insertResponseintoDb,
  CalculateTotalScore,
  getManagerLeaderBoardDataFromDB,
  getUsersLeaderboardDataFromDB,
  deleteAllResponsesFromDB,
  resetAllSessionFromDb,
};

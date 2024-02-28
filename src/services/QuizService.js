const httpStatus = require("http-status");
const QueryBuilder = require("../builder/QueryBuilder");
const AppError = require("../errors/AppError.js");
const { Quiz, Question, Answer } = require("../models/Quiz");
const User = require("../models/User");
const UserResponse = require("../models/UserResponses");
const mongoose = require("mongoose");
const LeaderBoard = require("../models/leaderBorad.js");
const insertQuizIntoDB = async (payload) => {
  const { managerId, context, ...others } = payload;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // create context with transaction and rollback
    const createContext = await Quiz.create(
      [{ context: context, managerId: managerId }],
      {
        session,
      }
    );
    if (!createContext) {
      throw new AppError(httpStatus.BAD_REQUEST, "Context Not Created");
    }
    // after successfully context is created then create question
    const createQuestion = await Question.create(
      [
        {
          ...others,
          context: createContext[0]?._id,
        },
      ],
      { session }
    );
    if (!createQuestion) {
      throw new AppError(httpStatus.BAD_REQUEST, "Question Not Created");
    }

    await session.commitTransaction();
    session.endSession();
    return {
      context: createContext[0],
      question: createQuestion[0],
    };
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    throw new Error(err);
  }
};

const getAllQuizs = async (query, loginUser) => {
  // Use the QueryBuilder for fetching quiz data
  const quizModel = new QueryBuilder(Quiz.find(), query)
    .search()
    .filter()
    .paginate()
    .sort()
    .fields();
  // Fetch quiz data
  const result = await quizModel.modelQuery;
  // Fetch meta information
  const meta = await quizModel.meta();

  // Fetch manager scores for the logged-in user
  const managerScores = await UserResponse.find({ userId: loginUser?.userId });

  // Calculate quiz scores
  const quizScores = managerScores.reduce((accumulator, item) => {
    const { quizId, score } = item;
    accumulator[quizId] = (accumulator[quizId] || 0) + score;
    return accumulator;
  }, {});
  console.log(quizScores);

  // Associate quizScores with corresponding quiz objects based on _id matching
  const resultWithScores = result.map((quiz) => ({
    ...quiz.toObject(),
    score: quizScores[quiz._id] || 0,
  }));

  console.log(resultWithScores);

  return { result: resultWithScores, meta };
};

const getSingleQuiz = async (id) => {
  const result = await Quiz.findById(id);
  return result;
};

const getAnswerQuestion = async (quizBody, loginUser) => {
  const { questionId } = quizBody;
  const { userId } = loginUser;
  const user = await User.findOne({ _id: userId });
  let managerId = user.managerId;
  let role = user?.role;
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  const question = quiz?.questions?.id(questionId);
  // console.log("Question", question)
  if (!question) {
    throw new Error("Question not found");
  }

  // Assuming answerIndex is within the bounds of the answers array
  const selectedAnswer = question.answers[answerIndex];
  if (!selectedAnswer) {
    throw new Error("Invalid answer index");
  }

  const isCorrect = selectedAnswer.isCorrect;
  const score = isCorrect ? 3 : 1;

  const answer = selectedAnswer.text;

  // Create or update user response in the UserResponses collection
  const existingUserResponse = await UserResponse.findOneAndUpdate(
    { userId, quizId, managerId, questionId, answer, role },
    { $inc: { score } },
    { upsert: true, new: true }
  );

  console.log("userResponse", existingUserResponse);

  return selectedAnswer;
};

const getUserScores = async (userId) => {
  const userScores = await UserResponse.find({ userId });
  const totalScore = userScores.reduce(
    (sum, response) => sum + response.score,
    0
  );
  return userScores;
};

const getManager = async (managerId) => {
  const managerScores = await UserResponse.find({ userId: managerId });
  return managerScores;
};

const getQuizManagerScores = async (managerId) => {
  const managerScores = await UserResponse.find({ userId: managerId });
  const quizScores = managerScores.reduce((accumulator, item) => {
    const { quizId, score } = item;
    accumulator[quizId] = (accumulator[quizId] || 0) + score;
    return accumulator;
  }, {});
  console.log(quizScores);
  return quizScores;
};

const getManagerWiseScores = async (managerId) => {
  // Find all users under the specified manager
  const usersUnderManager = await User.find({ managerId });
  const userIds = usersUnderManager.map((user) => user._id);

  // Find user responses for the users under the manager
  const managerWiseScores = await UserResponse.find({
    userId: { $in: userIds },
  });

  return managerWiseScores;
};

const getUserLeaderboard = async () => {
  // Find all distinct user IDs in the UserResponse collection
  const distinctUserIds = await UserResponse.distinct("userId", {
    role: "user",
  });

  // Calculate total scores for each user
  const leaderboard = await Promise.all(
    distinctUserIds.map(async (userId) => {
      const userScores = await UserResponse.find({ userId });
      const totalScore = userScores.reduce(
        (sum, response) => sum + response.score,
        0
      );
      return { userId, totalScore };
    })
  );

  // Sort the leaderboard in descending order based on total scores
  const sortedLeaderboard = leaderboard.sort(
    (a, b) => b.totalScore - a.totalScore
  );

  // Add rankings to the sorted leaderboard
  // const rankedLeaderboard = sortedLeaderboard.map((user, index) => ({
  //     rank: index + 1,
  //     ...user,
  // }));

  // Add rankings to the sorted leaderboard
  const rankedLeaderboard = await Promise.all(
    sortedLeaderboard.map(async (user, index) => {
      const userDetails = await User.findById(user.userId); // Assuming you have a User model
      // const userDetails = await User.find({ role: 'user', _id: user.userId });
      return {
        rank: index + 1,
        userId: user.userId,
        totalScore: user.totalScore,
        userDetails,
      };
    })
  );

  return rankedLeaderboard;
};

const getManagerLeaderboard = async (managerId) => {
  // Find all distinct user IDs in the UserResponse collection for the given manager
  const distinctUserIds = await UserResponse.distinct("userId", { managerId });

  // Calculate total scores for each user
  const leaderboard = await Promise.all(
    distinctUserIds.map(async (userId) => {
      const userScores = await UserResponse.find({
        userId,
        managerId,
      }).populate("userId");
      const totalScore = userScores.reduce(
        (sum, response) => sum + response.score,
        0
      );
      return { userId, totalScore };
    })
  );

  // Sort the leaderboard in descending order based on total scores
  const sortedLeaderboard = leaderboard.sort(
    (a, b) => b.totalScore - a.totalScore
  );

  // Add rankings to the sorted leaderboard
  // const rankedLeaderboard = sortedLeaderboard.map((user, index) => ({
  //     rank: index + 1,
  //     ...user,
  // }));
  const rankedLeaderboard = await Promise.all(
    sortedLeaderboard.map(async (user, index) => {
      const populatedUser = await User.findById(user.userId);
      return {
        rank: index + 1,
        ...user,
        userDetails: populatedUser, // Include populated user details in the result
      };
    })
  );

  return rankedLeaderboard;
};
const getRandomContextFromDb = async (userId) => {
  const retriveContextId = await LeaderBoard.findOne({ userId }).select(
    "contextId"
  );
  const contextIdsArray = retriveContextId?.contextId || [];
  const result = await Quiz.aggregate([
    { $match: { _id: { $nin: contextIdsArray } } },
    { $sample: { size: 1 } },
  ]);

  return result[0] ? result[0] : null;
};

const deleteQuizFromDb = async (contextId) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deletecontext = await Quiz.findByIdAndDelete(contextId, { session });

    const deletequestions = await Question.deleteMany({
      context: contextId,
    });
    await session.commitTransaction();
    session.endSession();

    return deletecontext;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(err);
  }
};
module.exports = {
  insertQuizIntoDB,
  getAllQuizs,
  getSingleQuiz,
  getAnswerQuestion,
  getUserScores,
  getManager,
  getQuizManagerScores,
  getManagerWiseScores,
  getUserLeaderboard,
  getManagerLeaderboard,
  getRandomContextFromDb,
  deleteQuizFromDb,
};

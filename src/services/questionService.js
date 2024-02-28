const { default: mongoose } = require("mongoose");
const { Question } = require("../models/Quiz.js");
const UserResponse = require("../models/UserResponses.js");

const insertNewQuestionsIntoDb = async (id, payload) => {
  const data = {
    context: id,
    ...payload,
  };
  const result = await Question.create(data);
  return result;
};
const getTotalQuestionsFromDB = async (id, userId) => {
  const contextObjectId = new mongoose.Types.ObjectId(id);
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const result = await Question.aggregate([
    { $match: { context: contextObjectId } },
    {
      $lookup: {
        from: "userresponses",
        let: { questionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$questionId", "$$questionId"] },
                  { $eq: ["$userId", userObjectId] },
                ],
              },
            },
          },
        ],
        as: "userResponses",
      },
    },
    { $match: { userResponses: [] } },
  ]);
  return {
    result,
    total: result.length,
  };
};

const updateQuestionintoDB = async (id, payload) => {
  const result = await Question.findByIdAndUpdate(id, payload, { new: true });
  return result;
};
const deleteQuestionFromDb = async (id, payload) => {
  const result = await Question.findByIdAndUpdate(id, payload, { new: true });
  return result;
};
const findRandomQuestionsFromDb = async (contextId, userId) => {
  console.log(contextId, "contextId");
  const contextObjectId = new mongoose.Types.ObjectId(contextId);
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const pipeline = [
    { $match: { context: contextObjectId } },
    {
      $lookup: {
        from: "userresponses",
        let: { questionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$questionId", "$$questionId"] },
                  { $eq: ["$userId", userObjectId] },
                ],
              },
            },
          },
        ],
        as: "userResponses",
      },
    },
    { $match: { userResponses: [] } },
    { $sample: { size: 1 } },
    { $unset: "userResponses" },
  ];

  const result = await Question.aggregate(pipeline);
  console.log(result);
  return result[0] ? result[0] : null;
};
module.exports = {
  insertNewQuestionsIntoDb,
  getTotalQuestionsFromDB,
  updateQuestionintoDB,
  deleteQuestionFromDb,
  findRandomQuestionsFromDb,
};

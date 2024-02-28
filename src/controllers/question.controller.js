const {
  insertNewQuestionsIntoDb,
  updateQuestionintoDB,
  deleteQuestionFromDb,
  findRandomQuestionsFromDb,
  getTotalQuestionsFromDB,
} = require("../services/questionService.js");
const catchAsync = require("../utils/catchAsync.js");
const sendResponse = require("../utils/sendResponse.js");

const insertNewQuestion = catchAsync(async (req, res) => {
  const result = await insertNewQuestionsIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "questions added  successfully",
    success: true,
  });
});
const getTotalQuestions = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await getTotalQuestionsFromDB(req.params.id, userId);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "all questions retrived  successfully",
    success: true,
  });
});
const updateQuestion = catchAsync(async (req, res) => {
  const result = await updateQuestionintoDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "questions Updated  successfully",
    success: true,
  });
});
const deleteQuestion = catchAsync(async (req, res) => {
  const result = await deleteQuestionFromDb(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "question deleted  successfully",
    success: true,
  });
});

const findRandomQuestions = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  console.log(req.params.contextId, "hittedcontext id");
  const result = await findRandomQuestionsFromDb(req.params.contextId, userId);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "random question retrive successfully",
    success: true,
  });
});
module.exports = {
  insertNewQuestion,
  getTotalQuestions,
  updateQuestion,
  deleteQuestion,
  findRandomQuestions,
};

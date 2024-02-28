const mongoose = require("mongoose");
// Answer Schema
// Quiz Schema
const quizSchema = new mongoose.Schema({
  context: { type: String, required: true },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
// Model for Answers
const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean },
});
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  context: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
  },
  answers: [answerSchema],
});
// Model for Questions
const Question = mongoose.model("Question", questionSchema);

// Model for Quizzes
const Quiz = mongoose.model("Quiz", quizSchema);
module.exports = { Quiz, Question };

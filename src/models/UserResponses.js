const mongoose = require("mongoose");

const userResponseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true }, // Add this line
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answerId: { type: String, required: true },
    score: { type: Number, required: true },
    // role: { type: String },
    // Other details like timestamp
  },
  { timestamps: true }
); // Adding timestamps for createdAt and updatedAt

const UserResponse = mongoose.model("UserResponse", userResponseSchema);

module.exports = UserResponse;

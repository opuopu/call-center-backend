const mongoose = require("mongoose");

const LeaderBoardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contextId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Context",
        required: true,
      },
    ],
    teamId: {
      type: String,
      required: true,
    },
    totalScores: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const LeaderBoard = mongoose.model("LeaderBoard", LeaderBoardSchema);
module.exports = LeaderBoard;

const express = require("express");
const {
  insertQuizAnswer,
  calculateScore,
  getManagerLeaderBoardData,
  getUserLeaderBoardData,
  deleteAllResponses,
  resetSession,
} = require("../controllers/userResponse.js");
const auth = require("../middlewares/auth.js");
const router = express.Router();
router.post("/", auth("user", "manager"), insertQuizAnswer);
router.get("/manager-leaderboard", auth("manager"), getManagerLeaderBoardData);
router.get(
  "/manager-leaderboard",
  auth("user", "manager"),
  getUserLeaderBoardData
);
router.get(
  "/user-leaderboard",
  auth("user", "manager"),
  getUserLeaderBoardData
);
router.delete("/reset-session", auth("user", "manager"), resetSession);
router.get("/total-score/:id", auth("user", "manager"), calculateScore);
router.delete("/:id", auth("user", "manager"), deleteAllResponses);

const userResponseRouter = router;
module.exports = {
  userResponseRouter,
};

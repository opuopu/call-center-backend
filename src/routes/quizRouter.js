const express = require("express");
const {
  getAllQuizzes,
  answerQuestion,
  updateQuiz,
  singleQuiz,
  userScores,
  managerScores,
  managerWiseScores,
  userLeaderboard,
  managerLeaderboard,
  singleQuestion,
  managerQuizScores,
  insertQuiz,
  findARandomContext,
  deleteQuiz,
} = require("../controllers/quizController");
const auth = require("../middlewares/auth");
const router = express.Router();
// Create a new quiz
router.post("/", auth("manager"), insertQuiz);
// Update Quizzes
router.patch("/:id", auth("manager"), updateQuiz);
// User leaderboard
router.get("/user-leaderboard", auth("manager", "user"), userLeaderboard);
// Manager leaderboard
router.get(
  "/manager-leaderboard/:managerId",
  auth("manager", "user"),
  managerLeaderboard
);

router.get("/random-context", auth("user", "manager"), findARandomContext);
// Get all quizzes
router.get("/", auth("manager", "user"), getAllQuizzes);
// Get single quizzes
router.get("/:id", auth("manager", "user"), singleQuiz);
// Get single qus
router.get("/question/:id", auth("manager", "user"), singleQuestion);
// Answer a question in a quiz
router.post(
  "/quizzes/:quizId/:questionId/:answerIndex",
  auth("manager", "user"),
  answerQuestion
);
// Endpoint to get user-wise scores
router.get("/user-scores/:userId", auth("manager", "user"), userScores);
// Endpoint to get manager scores
router.get(
  "/manager-scores/:managerId",
  auth("manager", "user"),
  managerScores
);
// Quiz Id wise Manager Score
router.get(
  "/manager-quiz-scores/:managerId",
  auth("manager", "user"),
  managerQuizScores
);
// Manager-wise Scores API Endpoint:
router.get(
  "/manager-wise-scores/:managerId",
  auth("manager"),
  managerWiseScores
);
router.delete("/:id", auth("manager", "user"), deleteQuiz);
module.exports = router;

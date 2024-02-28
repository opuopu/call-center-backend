const express = require("express");
const auth = require("../middlewares/auth.js");
const {
  insertNewQuestion,
  updateQuestion,
  deleteQuestion,
  findRandomQuestions,
  getTotalQuestions,
} = require("../controllers/question.controller.js");
const router = express.Router();
router.get(
  "/random-question/:contextId",
  auth("manager", "user"),
  findRandomQuestions
);
router.post("/:id", auth("manager"), insertNewQuestion);
router.get("/:id", auth("manager", "user"), getTotalQuestions);

router.patch("/:id", auth("manager"), updateQuestion);
router.delete("/:id", auth("manager"), deleteQuestion);
const questionRoutes = router;
module.exports = questionRoutes;

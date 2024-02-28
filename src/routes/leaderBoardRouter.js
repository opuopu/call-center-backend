const express = require("express");
const auth = require("../middlewares/auth.js");
const {
  insertLeaderboardData,
  getLeaderBoardData,
} = require("../controllers/leaderBoard.controller.js");
const router = express.Router();
router.put("/", auth("user", "manager"), insertLeaderboardData);
router.get("/", auth("user", "manager"), getLeaderBoardData);
const leaderBoardRoutes = router;
module.exports = leaderBoardRoutes;

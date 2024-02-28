const {
  insertnewDataIntoLeaderBoardDB,
  getLeaderBoardDataFromDb,
} = require("../services/leaderboard.service.js");
const catchAsync = require("../utils/catchAsync.js");
const sendResponse = require("../utils/sendResponse.js");

const insertLeaderboardData = catchAsync(async (req, res) => {
  req.body.userId = req.user.userId;
  const teamId = req?.user?.teamId;
  const result = await insertnewDataIntoLeaderBoardDB(teamId, req.body);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "user progress  submitted successfully",
    success: true,
  });
});
const getLeaderBoardData = catchAsync(async (req, res) => {
  const teamId = req?.user?.teamId;
  const result = await getLeaderBoardDataFromDb(teamId);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "LeaderBoard Data Retrived successfully",
    success: true,
  });
});

module.exports = {
  insertLeaderboardData,
  getLeaderBoardData,
};

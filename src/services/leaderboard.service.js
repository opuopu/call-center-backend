const UserResponse = require("../models/UserResponses.js");
const LeaderBoard = require("../models/leaderBorad.js");

const insertnewDataIntoLeaderBoardDB = async (teamId, payload) => {
  const findResponses = await UserResponse.find({ userId: payload?.userId });
  const totalScores = findResponses?.reduce((acc, curr) => {
    return (acc += curr.score);
  }, 0);
  let result;
  const userProgress = await LeaderBoard.findOne({ userId: payload?.userId });
  if (userProgress) {
    result = await LeaderBoard.findByIdAndUpdate(
      userProgress?._id,
      {
        $inc: { totalScores: totalScores },
        $addToSet: {
          contextId: payload?.contextId,
        },
      },
      { new: true }
    );
  } else {
    const contextIds = [];
    contextIds.push(payload?.contextId);
    const formatedData = {
      ...payload,
      teamId: teamId,
      contextId: contextIds,
      totalScores: totalScores,
    };
    result = await LeaderBoard.create(formatedData);
  }
  return result;
};

const getLeaderBoardDataFromDb = async (teamId) => {
  const result = await LeaderBoard.aggregate([
    {
      $match: {
        teamId: teamId,
      },
    },
    {
      $sort: {
        totalScores: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
  ]);
  return result;
};
module.exports = {
  insertnewDataIntoLeaderBoardDB,
  getLeaderBoardDataFromDb,
};

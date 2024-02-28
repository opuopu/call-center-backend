const User = require("../models/User.js");

const findLastTeamId = async () => {
  const lastTeam = await User.findOne({ role: "manager" })
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastTeam?.teamId ? lastTeam?.teamId : undefined;
};

const generateNewTeam = async () => {
  let currentId = (0).toString();
  const lastTeam = await findLastTeamId();
  console.log(lastTeam);
  if (lastTeam) {
    currentId = lastTeam.substring(5);
  }
  let incrementId = (Number(currentId) + 1).toString().padStart(4, "0");
  incrementId = `Team-${incrementId}`;
  return incrementId;
};
module.exports = { generateNewTeam };

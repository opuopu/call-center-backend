const catchAsync = require("../utils/catchAsync.js");
const parseData = () => {
  return catchAsync(async (req, res, next) => {
    if (req.body && req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  });
};
module.exports = parseData;

const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.MONGODB_CONNECTION, {});
const port = process.env.PORT || 3000;
const url = process.env.SERVER_URL || "";
app.listen(port, () => {
  console.log(`Call Center Server is listening on ${port}`);
});

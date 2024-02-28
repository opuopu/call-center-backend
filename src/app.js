const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const quizRouter = require("./routes/quizRouter");

const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const globalErrorHandler = require("./middlewares/GlobalErrorHanlder");
const questionRoutes = require("./routes/questionRouter.js");
const { userResponseRouter } = require("./routes/userResponseRouter.js");
const leaderBoardRoutes = require("./routes/leaderBoardRouter.js");
require("dotenv").config();
const app = express();

// Connect to the MongoDB database

//making public folder static for publicly access
app.use(express.static("public"));

// For handling form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
const corsOptions = {
  origin: ["http://localhost:3001", "http://64.23.212.196:3001"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

//initilizing API routes
app.use("/api/users", userRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/questions", questionRoutes);
app.use("/api/user-response", userResponseRouter);
app.use("/api/leaderboard", leaderBoardRoutes);

//testing API is alive
app.get("/test", (req, res) => {
  res.send("Back-end is responding!!");
});

//invalid route handler
app.use(notFoundHandler);
//error handling
app.use(globalErrorHandler);

module.exports = app;

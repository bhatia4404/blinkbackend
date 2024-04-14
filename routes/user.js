const jwt = require("jsonwebtoken");
const { Router } = require("express");
const { signupMiddleware, signinMiddleware } = require("../middlewares/user");
const { User } = require("../db.js");
const userRouter = Router();
const generateId = require("unique-id-generator");
const { generateBalance } = require("../helpers/generateBalance");
const JWT_SECRET_KEY = require("../config.js");
userRouter.post("/signup", signupMiddleware, async function (req, res) {
  const { firstname, lastname, email, password } = req.body;
  const alreadyUser = await User.findOne({
    email,
  });
  if (alreadyUser) {
    res.json({
      message: "Email already in use.",
    });
    return;
  }
  const newBal = generateBalance();
  await User.create({
    firstname,
    lastname,
    email,
    password,
    balance: newBal,
    blinkId: generateId({ suffix: "@blink" }),
    transactions: [newBal],
  });
  res.json({
    message: "Signed up",
  });
});
userRouter.post("/signin", signinMiddleware, async function (req, res, next) {
  const { email, password } = req.body;
  const existingUser = await User.findOne({
    email,
    password,
  });
  if (!existingUser) {
    res.status(401).json({
      message: "Incorrect username or password.",
    });
    return;
  }
  const token = jwt.sign(
    {
      email,
    },
    JWT_SECRET_KEY
  );
  res.json({
    message: "Logged in",
    token,
  });
});
module.exports = userRouter;

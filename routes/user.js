const jwt = require("jsonwebtoken");
const { Router } = require("express");
const { signupMiddleware, signinMiddleware } = require("../middlewares/user");
const { User, Verification } = require("../db.js");
const userRouter = Router();
const generateId = require("unique-id-generator");
const otpGenerator = require("otp-generator");
const { generateBalance } = require("../helpers/generateBalance");
const mongoose = require("mongoose");
const JWT_SECRET_KEY = require("../config.js");
userRouter.post("/signup", async function (req, res) {
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
    transactions: [
      {
        from: "Initial Deposit",
        amt: newBal,
        time: new Date(),
      },
    ],
    card: { exists: false },
  });

  res.json({
    message: "Signed up",
  });
});
userRouter.post(
  "/sendverifyemail",
  signupMiddleware,
  async function (req, res) {
    const { firstname, email } = req.body;
    const existing = await Verification.findOne({
      email,
    });
    if (existing) {
      await Verification.deleteOne({
        email,
      });
    }
    const code = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await Verification.create({
        email,
        code,
      });
      const verifyRes = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            service_id: "service_0qksz9f",
            template_id: "template_iz0uw7g",
            user_id: "ZgBBPcuJX_-fQA8zp",
            accessToken: "V4BRkoX2JhQwG5I4guPkC",
            template_params: {
              firstname,
              code,
              toEmail: email,
            },
          }),
        }
      );
      if (verifyRes.status != 200) {
        session.abortTransaction();
        res.status(500).json({
          message: "Something went wrong!",
        });
      }
      res.status(200).json({
        message: "Verfication code sent.",
      });
      await session.commitTransaction();
    } catch (e) {
      session.abortTransaction();
      res.status(500).json({
        message: "Something went wrong!",
      });
    }
  }
);
userRouter.post("/verify", async function (req, res) {
  const { email, code } = req.body;
  const existing = await Verification.findOne({
    email,
  });
  if (!existing) {
    res.status(400).json({
      message: "Invalid Request",
    });
    return;
  }
  if (existing.code == code) {
    res.status(200).json({
      message: "Email Verified",
    });
    await Verification.deleteOne({
      email,
    });
  } else {
    res.status(401).json({
      message: "Incorrect Verification Code",
    });
  }
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
  next();
});
userRouter.get("/ping", function (req, res) {
  res.json({
    message: "Hello",
  });
});
module.exports = userRouter;

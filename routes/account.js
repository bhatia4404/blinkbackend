const { Router } = require("express");
const { User } = require("../db");
const { authMiddleware } = require("../middlewares/account");
const accountRouter = Router();
const mongoose = require("mongoose");
const {
  generateCardNumber,
  generateCVV,
  generatePin,
  generateExpiry,
} = require("../helpers/generateCard");
accountRouter.get("/find", async function (req, res) {
  const filter = req.query.filter || "";
  const users = await User.find({
    $or: [
      {
        firstname: {
          $regex: filter,
        },
      },
      {
        lastname: {
          $regex: filter,
        },
      },
      {
        email: {
          $regex: filter,
        },
      },

      {
        blinkId: {
          $regex: filter,
        },
      },
    ],
  });
  res.send({
    users,
  });
});
accountRouter.post("/transfer", authMiddleware, async function (req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  const amt = Number(req.query.amt);
  const fromUser = await User.findOne({
    email: req.email,
  });
  if (!fromUser) {
    res.json({
      message: "Transaction Failed",
    });
    return;
  }
  if (fromUser.balance < amt) {
    session.abortTransaction();
    res.status(400).json({
      message: "Insufficient Balance!",
    });
    return;
  }
  const from = fromUser.blinkId;
  const to = req.query.to.concat("@blink");
  const toUser = await User.findOne({
    blinkId: to,
  });
  if (!toUser) {
    res.json({
      message: "Transaction Failed",
    });
    return;
  }
  await User.updateOne(
    {
      blinkId: from,
    },
    {
      $inc: {
        balance: -amt,
      },
      $push: {
        transactions: { amt: -amt, to, time: Date.now() },
      },
    }
  );
  await User.updateOne(
    {
      blinkId: to,
    },
    {
      $inc: {
        balance: +amt,
      },
      $push: {
        transactions: { amt, from, time: Date.now() },
      },
    }
  );
  await session.commitTransaction();
  res.status(200).json({
    message: "Transaction Successfull",
  });
});
accountRouter.post("/createCard", authMiddleware, async function (req, res) {
  const eligible = await User.findOneAndUpdate(
    {
      email: req.email,
      card: { exists: false },
    },
    {
      $set: {
        card: {
          exists: true,
          number: generateCardNumber(),
          cvv: generateCVV(),
          expiry: generateExpiry(),
          pin: generatePin(),
        },
      },
    }
  );
  if (!eligible) {
    res.status(400).json({
      message: "Invalid request",
    });
    return;
  }

  res.status(200).json({
    message: "Card created successfully",
  });
});
accountRouter.post("/firstname", authMiddleware, async function (req, res) {
  const { firstname } = req.body;
  await User.findOneAndUpdate(
    {
      email: req.email,
    },
    {
      firstname,
    }
  );

  res.json({
    message: "updated",
  });
});
module.exports = accountRouter;

const { Router } = require("express");
const { User } = require("../db");
const { authMiddleware } = require("../middlewares/account");
const accountRouter = Router();
const mongoose = require("mongoose");
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
        password: {
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
  if (fromUser.balance < amt) {
    session.abortTransaction();
    res.status(400).json({
      message: "Insufficient Balance!",
    });
    return;
  }
  const from = fromUser.blinkId;
  let to = req.query.to.concat("@blink");
  await User.updateOne(
    {
      blinkId: from,
    },
    {
      $inc: {
        balance: -amt,
      },
      $push: {
        transactions: -amt,
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
        transactions: +amt,
      },
    }
  );
  await session.commitTransaction();
  res.status(200).json({
    message: "Transaction Successfull",
  });
});
module.exports = accountRouter;

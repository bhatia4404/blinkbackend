const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const { authMiddleware } = require("../middlewares/account");
const passwordGenerator = require("generate-password");
const accountRouter = Router();
const mongoose = require("mongoose");
const {
  generateCardNumber,
  generateCVV,
  generatePin,
  generateExpiry,
} = require("../helpers/generateCard");
const JWT_SECRET_KEY = require("../config");
accountRouter.get("/existing", async function (req, res) {
  const { email } = req.query;
  const existing = await User.findOne({
    email,
  });

  if (existing) {
    res.json({
      existing: true,
    });
    return;
  }
  res.json({
    existing: false,
  });
  return;
});
accountRouter.get("/find", async function (req, res) {
  const token = req.query.token;
  if (token) {
    const { email } = jwt.verify(token, JWT_SECRET_KEY);
    const curUser = await User.findOne({
      email,
    });
    res.json({
      user: curUser,
    });
    return;
  }
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
  if (amt <= 0) {
    res.json({
      message: "We require a valid amount to proceed. ",
    });
    return;
  }
  const fromUser = await User.findOne({
    email: req.email,
  });
  const fromUserPrevTransaction = fromUser.transactions;
  if (!fromUser) {
    res.status(400).json({
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
  const to = req.query.to;
  const toUser = await User.findOne({
    blinkId: to,
  });
  const toUserPrevTransaction = toUser.transactions;

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

      transactions: [
        { amt: -amt, to, time: new Date() },
        ...fromUserPrevTransaction,
      ],
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

      transactions: [{ amt, from, time: new Date() }, ...toUserPrevTransaction],
    }
  );
  await session.commitTransaction();
  res.status(200).json({
    message: "Transaction Successfull!",
  });
});
accountRouter.put("/createcard", authMiddleware, async function (req, res) {
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
accountRouter.put("/firstname", authMiddleware, async function (req, res) {
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
    message: "Firstname Updated",
  });
});
accountRouter.put("/lastname", authMiddleware, async function (req, res) {
  const { lastname } = req.body;
  await User.findOneAndUpdate(
    {
      email: req.email,
    },
    {
      lastname,
    }
  );

  res.json({
    message: "Lastname Updated",
  });
});
// accountRouter.post("/pin", authMiddleware, async function (req, res) {
//   const { pin } = req.body;
//   await User.findOneAndUpdate(
//     {
//       email: req.email,
//     },
//     {
//       pin,
//     }
//   );

//   res.json({
//     message: "Pin Updated",
//   });
// });
accountRouter.put("/password", authMiddleware, async function (req, res) {
  const { password } = req.body;
  await User.findOneAndUpdate(
    {
      email: req.email,
    },
    {
      password,
    }
  );

  res.json({
    message: "Password Updated",
  });
});
accountRouter.put("/newpassword", async function (req, res) {
  const existing = await User.findOne({
    email: req.query.email,
  });
  if (!existing) {
    res.json({
      message: "Invalid Email",
    });
    return;
  }
  const newPassword = passwordGenerator.generate({
    length: 8,
    numbers: true,
    symbols: true,
  });

  await User.findOneAndUpdate(
    {
      email: req.query.email,
    },
    {
      password: newPassword,
    }
  );

  const emailRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      service_id: "service_0qksz9f",
      template_id: "template_d8lae14",
      user_id: "ZgBBPcuJX_-fQA8zp",
      accessToken: "V4BRkoX2JhQwG5I4guPkC",
      template_params: {
        firstname: existing.firstname,
        password: newPassword,
        toEmail: req.query.email,
      },
    }),
  });

  if (emailRes.status != 200) {
    res.json({
      message: "Something went wrong ! Please try after some time.",
    });
    return;
  }

  res.json({
    message: "Email Sent",
  });
});
accountRouter.put("/deletecard", authMiddleware, async function (req, res) {
  await User.findOneAndUpdate(
    {
      email: req.email,
    },
    {
      card: {
        exists: false,
      },
    }
  );
  res.json({
    message: "Card Deleted",
  });
});
//later
// accountRouter.get("/balance", authMiddleware, async function (req, res) {
//   const user = await User.find({
//     email: req.email,
//   });
//   res.json({
//     balance: user.balance,
//   });
// });
// accountRouter.get("/transactions", authMiddleware, async function (req, res) {
//   const user = await User.find({
//     email: req.email,
//   });
//   res.json({
//     balance: user.transactions,
//   });
// });
module.exports = accountRouter;

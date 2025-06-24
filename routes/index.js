const { Router } = require("express");
const userRouter = require("./user");
const accountRouter = require("./account");
const pollRouter = require("./poll");
const rootRouter = Router();
rootRouter.use("/user", userRouter);
rootRouter.use("/account", accountRouter);
rootRouter.use("/poll", pollRouter);
module.exports = rootRouter;

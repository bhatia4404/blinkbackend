const { Router } = require("express");
const userRouter = require("./user");
const accountRouter = require("./account");
const rootRouter = Router();
rootRouter.use("/user", userRouter);
rootRouter.use("/account", accountRouter);
module.exports = rootRouter;

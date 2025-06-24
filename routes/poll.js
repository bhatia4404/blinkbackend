const { Router } = require("express");

const pollRouter = Router();
pollRouter.get("/", async function (req, res) {
  return res.json({
    status: "up",
  });
});
module.exports = pollRouter;

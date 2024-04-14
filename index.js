const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const rootRouter = require("./routes");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/v1", rootRouter);
app.listen(3000, () => console.log("Server 👍"));

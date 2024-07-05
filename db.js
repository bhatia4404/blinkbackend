const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.DB_URL);
const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  blinkId: String,
  balance: Number,
  transactions: Array,
  card: Object,
});
const verificationSchema = new mongoose.Schema({
  email: String,
  code: Number,
});
const User = mongoose.model("User", UserSchema);
const Verification = mongoose.model("Verification", verificationSchema);
module.exports = { User, Verification };

const mongoose = require("mongoose");
const { string, ParseStatus, number } = require("zod");
mongoose.connect(
  "mongodb+srv://bhatia4404:Bhatia440@db.kdbe673.mongodb.net/users"
);
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

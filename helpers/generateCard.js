const random = require("random-number");
function generateCardNumber() {
  return random({
    min: 6000000000000000,
    max: 9000000000000000,
  });
}
function generateCVV() {
  return Number(
    random({
      min: 400,
      max: 999,
    }).toFixed(0)
  );
}
function generatePin() {
  return Number(
    random({
      min: 1001,
      max: 9999,
    }).toFixed(0)
  );
}
function generateExpiry() {
  let expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 10);
  expiry = `${expiry.getMonth() + 1}/${expiry
    .getFullYear()
    .toString()
    .slice(2)}`;

  return expiry;
}
module.exports = {
  generateCardNumber,
  generateCVV,
  generatePin,
  generateExpiry,
};

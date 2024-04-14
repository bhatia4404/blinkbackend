function generateBalance() {
  const bal = Number((Math.random() * 10000 + 1).toFixed(2));
  return bal;
}
module.exports = { generateBalance };

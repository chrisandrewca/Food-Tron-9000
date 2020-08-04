const tallyCheckoutSale = (displayItems) => {
  let amount = 0;
  for (const item of displayItems) {
    // TODO item.currency
    amount += item.amount * item.quantity;
  }

  return amount / 100;
}

const toMoney = (value) => {
  const precision = 2;
  const base = 10 ** precision;
  const _ = Number(value);
  return Number((Math.round(_ * base) / base).toFixed(precision));
}

module.exports = {
  tallyCheckoutSale,
  toMoney
};
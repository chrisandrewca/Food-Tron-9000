const bodyParser = require('body-parser');
const db = require('../db');
const express = require('express');
const Mailgun = require('mailgun-js');
const money = require('../money');
const router = express.Router();
const Stripe = require('stripe');

router.post('/', async (req, res) => {

  let event;
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_HOOK_SECRET_KEY);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { handle } = session.metadata;
    const { access_token } = await db.findStripeInfo({ handle });

    await db.incrementStat(handle, 'orderCount', 1);
    const dollarSales = money.tallyCheckoutSale(event.data.object.display_items);
    await db.incrementStat(handle, 'dollarSales', dollarSales);

    // TODO customer engagement for restaurants
    const customer = await Stripe(access_token)
      .customers
      .retrieve(session.customer);
    const listItems = session.display_items.map(item =>
      `<li>${item.custom.name}</li>`
    );

    const user = await db.findUser({ handle });
    const mailgun = Mailgun({
      apiKey: process.env.MAILGUN_SECRET_KEY,
      domain: process.env.DOMAIN
    });
    const msg = {
      to: user.email,
      from: process.env.EMAIL,
      subject: 'Order from Food-Tron 9000',
      html: `
        <p>An order has been placed by ${customer.email}</p>
        <ul>
          ${listItems}
        </ul>`,
    };
    await mailgun.messages().send(msg);
  }

  res.json({ received: true });
});

module.exports = router;
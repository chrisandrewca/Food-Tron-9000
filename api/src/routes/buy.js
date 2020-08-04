// TODO if stripe not setup && buy click sendEmail
'use strict';

const db = require('../db');
const express = require('express');
const Order = require('../business/order');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  timeout: 5000
});

router.post('/', async (req, res) => {

  const systemOrder = await (async () => {
    const build = await Order.api.build(req.body);
    if (build.err) {
      console.dir({ err: build.err }, { depth: null });
      return undefined;
    }

    console.dir({ build }, { depth: null });

    const order = await Order.api.set(build.order);
    if (order.err) {
      console.dir({ err: order.err }, { depth: null });
      return undefined;
    }

    return order.systemOrder;
  })();

  if (!systemOrder) {
    console.log('no system order!');
    return res.status(400).end();
  }

  console.dir({ systemOrder }, { depth: null });
  const { handle } = systemOrder;
  const stripeInfo = await db.findStripeInfo({ handle })
    || {
    accountId: 'TODO_STRIPE_ACCOUNT_ID',
    isSystemAccount: true
  };

  const { currency, rate } = await db.findSetting({ handle });
  console.log({ currency, rate, fee: Math.floor(systemOrder.price * 0.11 * 100) });

  let payment_intent_data;
  if (!stripeInfo.isSystemAccount) {
    payment_intent_data = {
      application_fee_amount: String(Math.floor(systemOrder.price * 0.11 * 100)),
    };
  }

  const checkout = {
    line_items: systemOrder.lineItems.map(item => ({
      price_data: {
        currency,
        // TODO intl amount https://blog.khophi.co/charge-stripe-in-actual-dollars-not-cents/
        unit_amount: item.totalPrice * 100,
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images
        }
      },
      quantity: item.quantity
    })),
    payment_intent_data,
    payment_method_types: ['card'], // TODO see what can be offered here
    cancel_url: `https://${process.env.DOMAIN}/@${handle}`,
    success_url: `https://${process.env.DOMAIN}/@${handle}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      handle
    },
    mode: 'payment'
  };

  console.dir({ checkout }, { depth: null });
  const session = await stripe.checkout.sessions.create(
    checkout,
    {
      stripeAccount: stripeInfo.stripe_user_id
    }
  );

  return res.json({
    isUserAccount: !stripeInfo.isSystemAccount,
    sessionId: session.id,
    stripeAccount: stripeInfo.stripe_user_id
  }).end();
});

module.exports = router;
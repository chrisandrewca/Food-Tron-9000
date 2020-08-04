'use strict';

const auth = require('../auth');
const db = require('../db');
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get('/url', auth.authorizeRequest, async (req, res) => {

  const query = new URLSearchParams();
  query.set('client_id', process.env.STRIPE_CONNECT_CLIENT_ID);
  query.set('response_type', 'code');
  query.set('scope', 'read_write');
  query.set('stripe_user[email]', req.user.email);

  return res.json(`https://connect.stripe.com/oauth/authorize?${query.toString()}`);
});

router.get('/', auth.authorizeRequest, async (req, res) => {

  const stripeInfo = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code: req.query.code
  });

  console.info({ stripeInfo });
  await db.upsertStripeInfo({ handle: req.user.handle, ...stripeInfo });
  await auth.setCookie(res, req.user);

  res.redirect(303, '/dashboard');
});

module.exports = router;
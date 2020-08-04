// don't have to persist everything, some things could be regenerated in the store from default
'use strict';

const auth = require('../auth');
const db = require('../db');
const express = require('express');
const router = express.Router();

router.get('/', auth.authorizeRequest, async (req, res) => {
  const { handle } = req.user;
  const promotions = await db.findPromotion({ handle });
  const settings = await db.findSetting({ handle });
  const stats = await db.findStats({ handle });
  const hasStripeInfo = await db.hasStripeInfo({ handle });

  const { dollarSales, menuItemCount, orderCount } = stats;
  res.json({
    dollarSales,
    handle,
    hasStripeInfo,
    menuItemCount,
    orderCount,
    ...promotions,
    showStripeEmailWarning: settings.showStripeEmailWarning
  });
});

module.exports = router;
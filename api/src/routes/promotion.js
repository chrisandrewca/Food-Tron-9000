const auth = require('../auth');
const db = require('../db');
const express = require('express');
const { Joi } = require('express-validation');
const router = express.Router();
const validate = require('../validation').validate;

router.post('/', [
  auth.authorizeRequest,
  validate({
    body: Joi.object({
      id: Joi.string().trim().required()
    })
  })
], async (req, res) => {

  const { handle } = req.user;
  const { id } = req.body;
  const promotion = await db.findPromotion({ handle });
  const stats = await db.findStats({ handle });

  let claimedPromotion;

  if (id === 'free-orders') {
    claimedPromotion = false;

    const hasStripeInfo = await db.hasStripeInfo(handle);
    if (hasStripeInfo
      && !promotion.claimedFreeOrders
      && stats.orderCount <= 25) {

      claimedPromotion = true;
      await db.upsertPromotion(handle, { claimedFreeOrders: true });
    }
  } else if (id === 'reduced-rate') {
    claimedPromotion = false;

    if (!promotion.claimedReducedRate && stats.dollarSales >= 1000) {
      claimedPromotion = true;
      await db.upsertPromotion(handle, { claimedReducedRate: true });
    }
  }

  return res.json({ claimedPromotion });
});

router.post('/free-ads', [
  auth.authorizeRequest,
  validate({
    body: Joi.object({
      name: Joi.string().trim().required(),
      role: Joi.string().trim().required(),
      establishmentName: Joi.string().trim().required(),
      establishmentAddress: Joi.string().trim().required(),
      establishmentAge: Joi.number().greater(0).required(),
      establishmentDescription: Joi.string().trim().required(),
      customerDescription: Joi.string().trim().required(),
      facebookPage: Joi.string().trim(),
      additionalLinks: Joi.string().trim()
    })
  })
], async (req, res) => {

  const { handle } = req.user;
  await db.insertFreeAdCampaign({
    handle,
    ...req.body
  });

  const adCampaignStatus = 'In-Progress';
  await db.upsertPromotion(handle, { adCampaignStatus, claimedAds: true });

  await auth.setCookie(res, req.user);
  // TODO review redirect status
  return res.redirect(303, '/dashboard');
});

module.exports = router;
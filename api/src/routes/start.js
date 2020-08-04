'use strict';

const auth = require('../auth');
const db = require('../db');
const express = require('express');
const { Joi } = require('express-validation');
const Mailgun = require('mailgun-js');
const multer = require('multer')({ dest: 'photos' });
const router = express.Router();
const Start = require('../business/start');
const uuid = require('uuid').v4;
const validate = require('../validation').validate;

// TODO check for dupe user, etc
router.post('/', [
  multer.single('photo'),
  validate({
    body: Joi.object({
      item: Joi.string().trim().required(),
      price: Joi.number().precision(2).greater(0).required(),
      currency: Joi.string().trim().valid('usd', 'cad').required(),
      handle: Joi.string().trim().required(), // TODO normalize handle, mongo case sensitive, avoid fake profile names
      email: Joi.string().trim().email().required()
    })
  })
], async function (req, res) {

  // const { body, file } = req;

  // console.log({ body, file });

  // const user = {
  //   email: body.email,
  //   handle: body.handle
  // };

  // const product = {
  //   name: body.item,
  //   photo: file,
  //   price: body.price // TODO is this saved as a number or a string?
  //   // TODO use toInt sanitizer
  // };

  const user = await Start.api.start(req.body, [req.file]);

  auth.setCookie(res, user);

  const dashboardLink = await auth.createLoginLink(req.body.email);

  const mailgun = Mailgun({
    apiKey: process.env.MAILGUN_SECRET_KEY,
    domain: process.env.DOMAIN
  });

  const msg = {
    to: req.body.email,
    from: process.env.EMAIL,
    subject: 'Food-Tron 9000 selling & collecting payments',
    html: `
        <p>Time to fire it up! Share this link to get selling and collecting payments.<p>
        <p><a href='https://${process.env.DOMAIN}/@${req.body.handle}'>@${req.body.handle}/${req.body.item}</a><p>
        <p>You'll receive an email when a customer places an order.</p>
        <p>Add account details to <a href='${dashboardLink}'>receive your payments.</a></p>`,
  };

  await mailgun.messages().send(msg);

  return res.redirect(303, '/share');
});

module.exports = router;
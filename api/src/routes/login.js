const auth = require('../auth');
const db = require('../db');
const express = require('express');
const { Joi } = require('express-validation');
const Mailgun = require('mailgun-js');
const router = express.Router();
const validate = require('../validation').validate;

router.get('/', [
  validate({
    query: Joi.object({
      token: Joi.string().trim().required()
    })
  })
], async (req, res) => {

  const { token } = req.query;
  const user = await auth.authorizeLoginToken(token);

  if (user) {
    await auth.setCookie(res, user);
    return res.redirect(303, '/dashboard');
  } else {
    return res.redirect(303, '/login');
  }
});

router.post('/', [
  validate({
    body: Joi.object({
      email: Joi.string().trim().email().required()
    })
  })
], async (req, res) => {

  const user = await db.findUser({ email: req.body.email });
  if (user) {

    const { email } = user;
    const loginLink = await auth.createLoginLink(email);

    const mailgun = Mailgun({
      apiKey: process.env.MAILGUN_SECRET_KEY,
      domain: process.env.DOMAIN
    });
    const msg = {
      to: email,
      from: process.env.EMAIL,
      subject: 'Food-Tron 9000 login',
      html: `<p>Thanks for logging in. <a href='${loginLink}'>Tap right this way!</a></p>`,
    };
    await mailgun.messages().send(msg);

    return res.redirect(303, '/login/sent');
  } else {
    return res.redirect(303, '/login');
  }
});

module.exports = router;
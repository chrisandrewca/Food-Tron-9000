const db = require('../db');
const express = require('express');
const { Joi } = require('express-validation');
const router = express.Router();
const validate = require('../validation').validate;

router.get('/', [
  validate({
    query: Joi.object({
      handle: Joi.string().trim().required()
    })
  })
], async (req, res) => {

  const { thankYouMessage } = await db.findSetting({ handle: req.query.handle });
  res.json(thankYouMessage);
});

module.exports = router;
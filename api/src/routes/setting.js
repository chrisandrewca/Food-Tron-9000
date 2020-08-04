'use strict';

const auth = require('../auth');
const db = require('../db');
const express = require('express');
const { Joi } = require('express-validation');
const router = express.Router();
const validate = require('../validation').validate;

router.patch('/', [
  auth.authorizeRequest,
  validate({
    body: Joi.object({
      handle: Joi.string().trim().required(),
      setting: Joi.object().required()
    })
  })
], async (req, res) => {
  const { handle, setting } = req.body;
  await db.upsertSetting(handle, setting);
  res.status(200);
});

module.exports = router;
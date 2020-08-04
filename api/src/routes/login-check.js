'use strict';

const auth = require('../auth');
const express = require('express');
const router = express.Router();

router.get(
  '/',
  auth.authorizeRequest,
  async (req, res) => {
    res.status(200).end();
  });

module.exports = router;
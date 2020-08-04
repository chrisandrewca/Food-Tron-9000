// const db = require('../db');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.json({ version: 2 }); // TODO retrieve from database
});

module.exports = router;
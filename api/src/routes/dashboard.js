const express = require('express');
const auth = require ('../auth');

const router = express.Router();

router.get('/', auth.authorizeRequest, async (req, res, next) => {
  res.send('hello world');
});

module.exports = router;
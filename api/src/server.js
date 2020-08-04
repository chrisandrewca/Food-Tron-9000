'use strict';

require('dotenv').config();

const express = require('express');
const app = express();
const { ValidationError } = require('express-validation');

app.use(require('morgan')('dev'));
app.use(express.json({ verify: (req, res, buf) => {
  if (req.originalUrl.endsWith('stripe-hook')) {
    req.rawBody = buf.toString();
  }
}}));

app.use(express.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
// TODO serve w/ signed url to keep images on site? would that disable seo?
// TODO compress/'normalize'!
app.use('/api/photos', express.static(require('path').join(__dirname, '../photos')));

app.use('/api/app-state', require('./routes/app-state'));
app.use('/api/authorize-stripe', require('./routes/authorize-stripe'));
app.use('/api/buy', require('./routes/buy'));
app.use('/api/customization', require('./routes/customization'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/login-check', require('./routes/login-check'));
app.use('/api/login', require('./routes/login'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/promotion', require('./routes/promotion'));
app.use('/api/setting', require('./routes/setting'));
app.use('/api/start', require('./routes/start'));
app.use('/api/stripe-hook', require('./routes/stripe-hook'));
app.use('/api/thanks', require('./routes/thanks'));
app.use('/api/version', require('./routes/version'));

app.use((err, req, res, next) => {
  console.dir({ err, body: req.body }, { depth: null });
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }
  return res.status(500).json(err);
});

module.exports = app;
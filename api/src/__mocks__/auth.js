'use strict';

const db = require('../db');

module.exports.createLoginLink = async (email) => {
  throw new Error('createLoginLink not implemented');
}

module.exports.authorizeLoginToken = async (token) => {
  return await db.findUser({ email: token });
}

module.exports.setCookie = async (res, user) => {
  await db.insertSession({
    created: Date.now(),
    id: 'session-id',
    email: user.email,
    key: 'session-key'
  });
}

module.exports.authorizeRequest = async (req, res, next) => {
  const session = await db.cmd(async db => {
    return (await db.collection('session').find().toArray())[0];
  });

  req.user = await db.findUser({ email: session.email });
  return next();
}
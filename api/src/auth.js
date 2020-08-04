'use strict';

const datefns = require('date-fns');
const db = require('./db');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;

module.exports.createLoginLink = async (email) => {

  const expires = datefns.addMinutes(Date.now(), 10).valueOf();
  const token = jwt.sign({ email }, uuid());

  try {
    await db.deleteAllLoginLinks({ email });
    await db.insertLoginLink({ email, expires, token });
  }
  catch (err) {
    console.log({ err });
  }

  return `https://${process.env.DOMAIN}/api/login?token=${token}`;
}

module.exports.authorizeLoginToken = async (token) => {

  const link = await db.findLoginLink({ token });
  if (link) {
    await db.deleteAllLoginLinks({ token });
    if (Date.now() <= link.expires) {
      return await db.findUser({ email: link.email });
    }
  }

  return null;
}

/*
 * side-effect: resets localStorage/app-state in frontend
 */
module.exports.setCookie = async (res, user) => {

  const { email } = user;
  await db.deleteSession({ email });

  const id = uuid();
  const key = uuid(); // TODO bcrypt?

  await db.insertSession({
    created: Date.now(),
    id,
    email,
    key
  });

  const opts = {
    maxAge: 86400000, // 24 hours
    signed: false, // TODO true
    path: '/',
    secure: true,
    httpOnly: true, // TODO does this break local storage refresh mechanism? cookie no longer available in document.cookie
    //sameSite: 'lax' // broken in iOS
  };
  res.cookie('id', id,  { ...opts });

  // TODO expire 24 hours
  const token = jwt.sign({ email }, key);
  res.cookie('token', token, opts);
}

module.exports.authorizeRequest = async (req, res, next) => {

  if (req.cookies) {
    const { id, token } = req.cookies;
    const session = await db.findSession({ id });

    if (session) {
      let payload;
      try {
        payload = jwt.verify(token, session.key);
      } catch (err) {
        console.log({ err });
      }

      if (payload
        && payload.email === session.email) {
        req.user = await db.findUser({ email: session.email });
        return next();
      }
    }
  }

  return res.status(401).send('Unauthorized');
}
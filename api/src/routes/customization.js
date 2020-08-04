const auth = require('../auth');
const Customization = require('../business/customization').api;
const db = require('../db');
const express = require('express');
const { Joi } = require('express-validation');
const multer = require('multer')({ dest: 'photos' });
const photo = require('../photo');
const router = express.Router();
const uuid = require('uuid').v4;
const validation = require('../validation');
const validate = validation.validate;

router.post('/', [
  auth.authorizeRequest,
  multer.fields([{ name: 'photos', maxCount: 8 }])
], async (req, res) => {

  const { handle } = req.user;

  let result = await Customization.add(
    handle,
    req.body.name,
    req.files.photos,
    req.body);

  if (req.files.photos) {
    photo.cleanTempFiles(req.files.photos);
  }

  if (result.err) {
    console.dir({ err: result.err }, { depth: null });
    return res.status(400).end();
  }

  result = await Customization.findById(handle, result.id);
  if (result.err) {
    return res.status(400).end();
  }

  return res.json({ customization: result.customization });
});

router.patch('/', [
  auth.authorizeRequest,
  multer.fields([{ name: 'photos', maxCount: 8 }])
], async (req, res) => {

  const { handle } = req.user;

  let result = await Customization.update(
    handle,
    req.body.id,
    req.files.photos,
    req.body);

  if (req.files.photos) {
    photo.cleanTempFiles(req.files.photos);
  }

  if (result.err) {
    console.dir({ err: result.err }, { depth: null });
    return res.status(400).end();
  }

  result = await Customization.findById(handle, req.body.id);
  if (result.err) {
    return res.status(400).end();
  }

  return res.json({ customization: result.customization });
});

router.delete('/', [
  auth.authorizeRequest
], async (req, res) => {

  const { handle } = req.user;
  const { err } = await Customization.remove(handle, req.body.id);
  if (err) {
    return res.status(400).end();
  }

  return res.status(200).end();
});

router.delete('/photo', [
  auth.authorizeRequest
], async (req, res) => {

  const { handle } = req.user;
  let result = await Customization.removePhoto(handle, req.body.id, req.body.src);

  if (req.files) {
    photo.cleanTempFiles(req.files.photos);
  }

  if (result.err) {
    return res.status(400).end();
  }

  result = await Customization.findById(handle, req.body.id);
  if (result.err) {
    return res.status(400).end();
  }

  return res.json({ customization: result.customization });
});


router.get('/', [
  auth.authorizeRequest
], async (req, res) => {

  const { handle } = req.user;
  const { err, customizations } = await Customization.listByHandle(handle);
  if (err) {
    console.dir({ err }, { depth: null });
    return res.status(400).end();
  }

  return res.json({ customizations });
});

router.get('/:id', [
  auth.authorizeRequest
], async (req, res) => {

  const { handle } = req.user;
  const { err, customization } = await Customization.findById(handle, req.params.id);
  if (err) {
    return res.status(400).end();
  }

  return res.json({ customization });
});

module.exports = router;
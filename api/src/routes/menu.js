const auth = require('../auth');
const express = require('express');
const MenuItem = require('../business/menu-item');
const multer = require('multer')({ dest: 'photos' });
const router = express.Router();

router.post('/build', [
  auth.authorizeRequest,
  multer.fields([
    { name: 'menuItemPhotos', maxCount: 8 },
    { name: 'customizationPhotos', maxCount: 8 }
  ])
], async (req, res) => {

  const files = req.files || {};
  if (req.body.customization) {
    req.body.customization = JSON.parse(req.body.customization);
  }

  // TODO build is returning internal structures
  // i.e. photos[i].originalName
  // think about API transformations (for data) in/out later
  const { err, build } = await MenuItem.api.build(
    req.user.handle,
    req.body,
    files);

  if (err) {
    console.dir({ err }, { depth: null });
    return res.status(400).end();
  }

  return res.json({ build });
});

router.post('/', [
  auth.authorizeRequest,
], async (req, res) => {

  // TODO recency - Show me an example, every n days, etc
  const { err, menuItem } = await MenuItem.api.set(req.user.handle, req.body);
  if (err) {
    return res.status(400).end();
  }

  return res.json({ menuItem });
});

router.get('/', [
  auth.authorizeRequest
], async (req, res) => {

  const { err, menuItems } = await MenuItem.api.listByHandle(
    req.user.handle,
    MenuItem.api.shapes.profile);

  if (err) {
    return res.status(400).end();
  }

  return res.json({ menuItems });
});

router.get('/:id', [
  auth.authorizeRequest
], async (req, res) => {

  const { err, menuItem } = await MenuItem.api.findById(
    req.user.handle,
    req.params.id,
    MenuItem.api.shapes.dashboard);

  if (err) {
    return res.status(400).end();
  }

  return res.json({ menuItem });
});

router.delete('/:id', [
  auth.authorizeRequest,
], async (req, res) => {

  const { err } = await MenuItem.api.remove(req.user.handle, req.params.id);
  if (err) {
    return res.status(400).end();
  }

  return res.status(200).end();
});

module.exports = router;
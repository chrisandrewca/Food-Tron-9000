const express = require('express');
const MenuItem = require('../business/menu-item');
const router = express.Router();

router.get('/', async (req, res) => {
  const { handle } = req.query;

  const { err, menuItems } = await MenuItem.api.listByHandle(
    handle,
    MenuItem.api.shapes.profile);

  if (err) {
    return res.status(400).end();
  }

  return res.json({ menuItems });
});

router.get('/:handle/:id', async (req, res) => {
  const { handle, id } = req.params;

  const { err, menuItem } = await MenuItem.api.findById(
    handle,
    id,
    MenuItem.api.shapes.profile);

  if (err) {
    return res.status(400).end();
  }

  return res.json({ menuItem });
});

module.exports = router;
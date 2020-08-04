// const express = require('express');
// const Order = require('../business/order');
// const router = express.Router();

// router.post('/build', async (req, res) => {

//   const { err, order } = await Order.api.build(req.body);

//   if (err) {
//     console.dir({ err }, { depth: null });
//     return res.status(400).end();
//   }

//   return res.json({ order });
// });
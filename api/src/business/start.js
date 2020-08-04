const db = require('../db');
const MenuItem = require('./menu-item');

const start = async (props, files) => {

  const { handle } = props;
  const user = {
    handle,
    email: props.email
  };

  await db.insertUser(user);

  const build = await MenuItem.api.build(
    handle,
    {},
    { menuItemPhotos: files });
  console.log('build', { err: build.er });
  console.dir({ build }, { depth: null });

  console.log('setting menu iteme via api.set');
  const { err } = await MenuItem.api.set(
    handle,
    {
      name: props.item,
      photos: build.build.menuItemPhotos,
      price: props.price
    });
  console.log('errrr', { err });

  /*
   * TODO Make Stripe optional - grow with users ground zero business.
   * - Offer receiving orders by SMS, Email, VOICE - super cool (pair with auto accept call app), Fax
   * - Level them up to Stripe
   * - Take off
   * - Routes ....
   * TODO Make sure the Stripe account supports the chosen currency. Maybe via auth hook? + email if changed?
   */
  if (props.currency !== 'usd' && props.currency !== 'cad') {
    props.currency = 'usd';
  }

  await db.upsertSetting(handle, {
    currency: props.currency,
    showStripeEmailWarning: 'Customer emails are not sent by default. Turn them on in your Stripe dashboard.',
    thankYouMessage: {
      header: 'Thanks for your purchase',
      content: 'Please come back soon!'
    }
  });

  await db.upsertStats(handle, {
    dollarSales: 0,
    menuItemCount: 1,
    orderCount: 0
  });

  await db.upsertPromotion(handle, {
    adCampaignStatus: 'Pending',
    claimedAds: false,
    claimedFreeOrders: false,
    claimedReducedRate: false
  });

  return user;
};

module.exports = {
  api: {
    start
  }
};
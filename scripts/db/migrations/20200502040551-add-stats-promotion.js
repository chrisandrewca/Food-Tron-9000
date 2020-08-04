const collections = [
  'promotion',
  'stat'
];

module.exports = {
  async up(db, client) {

    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);

    for (const collection of collections) {
      if (!existingCollections.find(c => c === collection)) {
        await db.createCollection(collection);
      }
    }

    const users = await db.collection('user').find().toArray();
    for (const user of users) {
      await db.collection('promotion').updateOne(
        { handle: user.handle },
        {
          $set: {
            adCampaignStatus: 'Pending',
            claimedAds: false,
            claimedFreeOrders: false,
            claimedReducedRate: false
          }
        },
        { upsert: true }
      );

      await db.collection('stat').updateOne(
        { handle: user.handle },
        {
          $set: {
            dollarSales: 0,
            menuItemCount: 1,
            orderCount: 0
          }
        },
        { upsert: true }
      );
    }
  },

  async down(db, client) {
    for (const collection of collections) {
      await db.collection(collection).drop();
    }
  }
};

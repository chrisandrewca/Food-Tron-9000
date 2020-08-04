const collections = [
  'loginLink',
  'product',
  'session',
  'setting',
  'stripeInfo',
  'user'
];

module.exports = {
  async up(db, client) {
    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);

    for (const collection of collections) {
      if (!existingCollections.find(c => c === collection)) {
        await db.createCollection(collection);
      }
    }
  },

  async down(db, client) {
    for (const collection of collections) {
      await db.collection(collection).drop();
    }
  }
};

module.exports = {
  async up(db, client) {
    const users = await db.collection('user').find().toArray();
    for (const user of users) {
      await db.collection('setting').updateOne(
        { handle: user.handle },
        { $set: { rate: 0.11 } }
      );
    }
  },

  async down(db, client) {
    const users = await db.collection('user').find().toArray();
    for (const user of users) {
      await db.collection('setting').updateOne(
        { handle: user.handle },
        { $unset: { rate: "" } }
      );
    }
  }
};

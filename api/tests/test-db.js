const db = require('../src/db');

db.seed = async () => {
  await db.start(
    'usd',
    { file: '123.png', name: '2 eggs and toast', price: 3.99 },
    { email: 'user1@gmail.com', handle: 'user1' }
  );
}

module.exports = db;
const mms = require('mongodb-memory-server');
const request = require('supertest');
const db = require('./test-db');

describe('API - Promotions', () => {
  let agent, mongod, server;
  beforeEach(async () => {
    jest.resetModules();
    jest.mock('../src/auth');

    mongod = new mms.MongoMemoryServer();
    process.env.MONGODB_CONN_STR = await mongod.getConnectionString();
    await db.seed();

    process.env.PORT = '3002';
    server = require('../scripts/api');
  });

  afterEach(async (done) => {
    server.close(done);
    await mongod.stop();
  });

  const login = async (email) => {
    agent = request.agent(server);
    await agent.get(`/api/login?token=${email}`);
  }

  test('Free orders requires Stripe signup', async () => {
    await login('user1@gmail.com');

    await agent
      .post('/api/promotion')
      .send({ id: 'free-orders' })
      .expect(200, { claimedPromotion: false });
  });

  test('Free orders claimable when user signs up for Stripe', async () => {

    const user = await db.findUser({ email: 'user1@gmail.com' });
    await login(user.email);
    // TODO converge on interface for upserts see product vs setting?
    await db.upsertStripeInfo({ handle: user.handle });

    await agent
      .post('/api/promotion')
      .send({ id: 'free-orders' })
      .expect(200, { claimedPromotion: true });
  });

  test('Free orders claimable once', async () => {

    const user = await db.findUser({ email: 'user1@gmail.com' });
    await login(user.email);
    // TODO converge on interface for upserts see product vs setting?
    await db.upsertStripeInfo({ handle: user.handle });

    await agent
      .post('/api/promotion')
      .send({ id: 'free-orders' })
      .expect(200, { claimedPromotion: true });

    await agent
      .post('/api/promotion')
      .send({ id: 'free-orders' })
      .expect(200, { claimedPromotion: false });
  });

  test('Reduced rate requires $1000 in sales', async () => {
    await login('user1@gmail.com');

    await agent
      .post('/api/promotion')
      .send({ id: 'reduced-rate' })
      .expect(200, { claimedPromotion: false });
  });

  test('Reduced rate claimable when sales are $1000 or more', async () => {
    const user = await db.findUser({ email: 'user1@gmail.com' });
    await login(user.email);
    await db.upsertStats(user.handle, { dollarSales: 1000 });

    await agent
      .post('/api/promotion')
      .send({ id: 'reduced-rate' })
      .expect(200, { claimedPromotion: true });

    await db.upsertPromotion(user.handle, { claimedReducedRate: false });
    await db.upsertStats(user.handle, { dollarSales: 1001 });

    await agent
      .post('/api/promotion')
      .send({ id: 'reduced-rate' })
      .expect(200, { claimedPromotion: true });
  });

  test('Reduced rate claimable once', async () => {
    const user = await db.findUser({ email: 'user1@gmail.com' });
    await login(user.email);
    await db.upsertStats(user.handle, { dollarSales: 1000 });

    await agent
      .post('/api/promotion')
      .send({ id: 'reduced-rate' })
      .expect(200, { claimedPromotion: true });

    await agent
      .post('/api/promotion')
      .send({ id: 'reduced-rate' })
      .expect(200, { claimedPromotion: false });
  });
});
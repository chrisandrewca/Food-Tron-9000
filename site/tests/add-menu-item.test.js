const db = require('../../api/tests/test-db');
const mms = require('mongodb-memory-server');

import Api from '../src/api';
import createStore from 'unistore';
import { h } from 'preact';
import Menu from '../src/routes/menu/index';
import { mount } from 'enzyme';
import { Provider } from 'unistore/preact';

describe('Add menu item', () => {
  let agent, mongod, server, store;

  beforeEach(async () => {
    jest.resetModules();
    jest.mock('../../api/src/auth');

    mongod = new mms.MongoMemoryServer();
    process.env.MONGODB_CONN_STR = await mongod.getConnectionString();
    await db.seed();

    process.env.PORT = '3002';
    server = require('../../api/scripts/api');

    store = createStore();

    process.env.BASE_URL = 'http://localhost:3002';
  });

  afterEach(async (done) => {
    server.close(done);
    await mongod.stop();
  });

  const login = async (email) => {
    await fetch(`http://localhost:3002/api/login?token=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'manual'
    });
  }

  test('Tap "Add menu item"', async () => {
    await login('user1@gmail.com');
    const context = mount(
      <Provider store={store}>
        <Menu />
      </Provider>
    );

    context.find('a[href="/menu/add"]').simulate('click');
    //expect(context.find('a[href="/menu/add"]').text()).toBe('Add menu item');
  });
});
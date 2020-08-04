#!/usr/bin/env node
'use strict';

const mongo = require('mongodb').MongoClient;
let collections = process.argv.slice(2);

const cmd = async (command) => {

  let client;
  try {
    client = await mongo.connect('mongodb://localhost:27017/ft9', { useUnifiedTopology: true });
  } catch (err) {
    console.log({ err });
  }

  if (!client) {
    return null;
  }

  let result = null;
  try {
    // TODO investigate who's catching resolve(result) when using the async api
    // https://github.com/mongodb/node-mongodb-native/blob/master/lib/operations/execute_operation.js#L61
    // because upsert returns an error when using the callback api that doesn't make it to the catch
    // callback api: MongoError: the update operation document must contain atomic operators.
    // async api: [[ dbUpsert ]] {"error":{"driver":true,"name":"MongoError"}}
    const db = client.db();
    result = await command(db);
  } catch (err) {
    console.log({ err });
    result = null;
  } finally {
    await client.close();
    return result;
  }
}

/*
 * Main
 */
cmd(async db => {
  await db.collection('loginLink').deleteMany({ email: { $ne: 'foodtron9000@gmail.com' } });
  await db.collection('menuItem').deleteMany({ handle: { $ne: 'ft9' } });
  await db.collection('promotion').deleteMany({ handle: { $ne: 'ft9' } });
  await db.collection('session').deleteMany({ email: { $ne: 'foodtron9000@gmail.com' } });
  await db.collection('setting').deleteMany({ handle: { $ne: 'ft9' } });
  await db.collection('stat').deleteMany({ handle: { $ne: 'ft9' } });
  await db.collection('ft9').deleteMany({ handle: { $ne: 'ft9' } });
  await db.collection('user').deleteMany({ handle: { $ne: 'ft9' } });
});
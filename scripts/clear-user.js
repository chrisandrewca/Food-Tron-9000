#!/usr/bin/env node
'use strict';

const mongo = require('mongodb').MongoClient;
let handle = process.argv[2];

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

if (!handle) {
  return
}

const collections = [
  'menuItem',
  'product',
  'promotion',
  'session',
  'setting',
  'stat',
  'user' // order ma
];

(async () => {
  await cmd(async db => {

  });

  for (const collection of collections) {
    await cmd(async db => {
      if (collection === 'session') {
        const email = await db.collection('user').findOne({ handle });
        await db.collection('session').deleteOne({ email: 'chris.andrew.ca.us@gmail.com' });
      } else {
        await db.collection(collection).deleteMany({ handle });
      }
    });
  }
})();
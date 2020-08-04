'use strict';

const mongo = require('mongodb').MongoClient;

/*
 * Login link
 */
const deleteAllLoginLinks = async (filter) => {
  await cmd(async db => {
    const links = await db.collection('loginLink');
    await links.deleteMany(filter);
  });
}

const insertLoginLink = async (loginLink) => {
  await cmd(async db => {
    const links = await db.collection('loginLink');
    await links.insertOne(loginLink);
  });
}

const findLoginLink = async (filter) => {
  return await cmd(async db => {
    const links = await db.collection('loginLink');
    return await links.findOne(filter, {
      projection: { _id: 0 }
    });
  });
}

/*
 * Session
 */
const deleteSession = async (filter) => {
  await cmd(async db => {
    await db.collection('session').deleteOne(filter);
  });
}

const findSession = async (filter) => {
  return await cmd(async db => {
    return await db.collection('session').findOne(filter, {
      projection: { _id: 0 }
    });
  });
}

const insertSession = async (session) => {
  await cmd(async db => {
    await db.collection('session').insertOne(session);
  });
}

/*
 * Menu Item
 */
const upsertMenuItem = async (menuItem) => {
  const { handle, id } = menuItem;
  await cmd(async db => {
    await db.collection('menuItem').updateOne(
      { handle, id },
      { $set: menuItem },
      { upsert: true }
    );
  });
};

const deleteMenuItem = async (filter) => {
  await cmd(async db => {
    await db.collection('menuItem').deleteOne(filter);
  });
};

const findMenuItem = async (filter, projection = shapes.default) => {
  return await cmd(async db => {
    return await db.collection('menuItem').findOne(filter, { projection });
  });
};

const findMenuItems = async (filter, projection = shapes.default) => {
  return await cmd(async db => {
    return await db.collection('menuItem').find(filter, { projection }).toArray();
  });
};

/*
 * Order
 */
const upsertOrder = async (order) => {
  const { handle, id } = order;

  return await cmd(async db => {
    return await db.collection('order').updateOne(
      { handle, id },
      { $set: order },
      { upsert: true });
  });
};

/*
 * User - email for identification, handle for lookups
 */
const insertUser = async (user) => {
  await cmd(async db => {
    await db.collection('user').insertOne(user);
  });
}

const findUser = async (filter) => {
  return await cmd(async db => {
    return await db.collection('user').findOne(filter, {
      projection: { _id: 0 }
    });
  });
}

const getAllUsers = async () => {
  return await cmd(async db => {
    return db.collection('user').find({}, {
      projection: { _id: 0 }
    }).toArray();
  });
}

/*
 * Stripe
 */
const upsertStripeInfo = async (stripeInfo) => {
  const { handle } = stripeInfo;
  await cmd(async db => {
    await db.collection('stripeInfo').updateOne(
      { handle },
      { $set: stripeInfo },
      { upsert: true });
  });
}

const findStripeInfo = async (filter) => {
  return await cmd(async db => {
    return await db.collection('stripeInfo').findOne(filter, {
      projection: { _id: 0 }
    });
  });
}

const hasStripeInfo = async (handle) => {
  return !!(await findStripeInfo({ handle }));
}

/*
 * Setting
 */
const upsertSetting = async (handle, setting) => {
  await cmd(async db => {
    await db.collection('setting').updateOne(
      { handle },
      { $set: setting },
      { upsert: true });
  });
}

const findSetting = async (filter) => {
  return await cmd(async db => {
    return await db.collection('setting').findOne(filter, {
      projection: { _id: 0 }
    });
  });
}

/*
 * Stats
 */
const upsertStats = async (handle, stats) => {
  await cmd(async db => {
    await db.collection('stat').updateOne(
      { handle },
      { $set: stats },
      { upsert: true });
  });
}

const incrementStat = async (handle, field, amount) => {
  await cmd(async db => {
    await db.collection('stat').updateOne(
      { handle },
      { $inc: { [field]: amount } }
    );
  });
}

const findStats = async (filter) => {
  return await cmd(async db => {
    return await db.collection('stat').findOne(filter, {
      projection: { _id: 0 }
    });
  });
}

/*
 * Promotions
 */
const upsertPromotion = async (handle, promotion) => {
  await cmd(async db => {
    await db.collection('promotion').updateOne(
      { handle },
      { $set: promotion },
      { upsert: true });
  });
}

const findPromotion = async (filter) => {
  return await cmd(async db => {
    return await db.collection('promotion').findOne(filter, {
      projection: { _id: 0 }
    });
  });
}

const insertFreeAdCampaign = async (campaign) => {
  await cmd(async db => {
    await db.collection('freeAdCampaign').insertOne(campaign);
  });
}

const shapes = {
  api: {
    /*customization: {
      _id: 0,
      'photos.originalName': 0,
      'photos.path': 0
    },*/
    menuItem: {
      _id: 0,
      'photos.originalName': 0,
      //'photos.path': 0,
      'customizations.photos.originalName': 0,
      //'customizations.photos.path': 0
    }
  },
  default: { _id: 0 }
};

/*
 * Base
 */
const cmd = async (command) => {

  let client;
  try {
    const connStr = `${process.env.MONGODB_CONN_STR}`;
    client = await mongo.connect(connStr, { useUnifiedTopology: true });
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

module.exports = {
  shapes,
	deleteAllLoginLinks,
	insertLoginLink,
	findLoginLink,
	deleteSession,
	findSession,
  insertSession,
  upsertMenuItem,
	deleteMenuItem,
	findMenuItem,
  findMenuItems,
  upsertOrder,
	insertUser,
	findUser,
	getAllUsers,
	upsertStripeInfo,
	findStripeInfo,
	hasStripeInfo,
	upsertSetting,
	findSetting,
	upsertStats,
	incrementStat,
	findStats,
	upsertPromotion,
	findPromotion,
	insertFreeAdCampaign,
  cmd
};
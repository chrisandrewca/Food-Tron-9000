/*
const db = require('../db.js');
const { JoiCustomization, JoiHandle, JoiMulterPhotos } = require('../validation.js');
const money = require('../money.js');
const photo = require('../photo.js');

const set = async ({ handle, files, props }) => {
  let customization;
  try {
    props = await transform(handle, files, props);
    customization = await JoiCustomization(handle)
      .validateAsync(props, { abortEarly: false, convert: true});
  } catch (err) {
    return { err };
  }

  await db.upsertCustomization(customization);

  return { customization };
};

const remove = async (handle, id) => {
  const { err, key } = await makeKey(handle, id);
  if (err) {
    return { err };
  }

  await db.deleteCustomization(key);

  return {};
};

const findById = async (handle, id) => {
  const { err, key } = await makeKey(handle, id);
  if (err) {
    return { err };
  }

  const customization = await db.findCustomization(key, db.shapes.api.customization);
  if (!customization) {
    return { err: `Customization not found ${JSON.stringify(key)}` };
  }

  return { customization };
};

const listByHandle = async (handle) => {
  try {
    await JoiHandle().validateAsync(handle);
  } catch (err) {
    return { err };
  }

  const customizations = await db.findCustomizations({ handle }, db.shapes.api.customization);

  return { customizations };
};

export default {
  api: {
    set,
    remove,
    findById,
    listByHandle
  }
};

const transform = async (handle, files, props) => {
  if (files) {
    try {
      await JoiMulterPhotos().min(1).validateAsync(files);
    } catch (err) {
      return { err };
    }

    // TODO cleanup on fail
    const photos = await photo.savePhotos(handle, files);
    if (props.photos) {
      props.photos = [...props.photos, ...photos];
    } else {
      props.photos = photos;
    }
  }

  const { price } = props;
  if (price) {
    props.price = money.toMoney(price);
  }

  return { ...props, handle };
};
*/

// const add = async (handle, files, props = {}) => {
//   let customization;
//   try {
//     props = await transform(handle, files, props);
//     customization = await JoiCustomization(handle)
//       .validateAsync(props, { convert: true });
//   } catch (err) {
//     return { err };
//   }

//   await db.insertCustomization(customization);

//   return { customization };
// };

// const update = async (handle, id, files, props = {}) => {
//   const { key, err } = await makeKey(handle, id);
//   if (err) {
//     return { err };
//   }

//   let customization = await db.findCustomization(key);
//   if (!customization) {
//     return { err: `Customization not found ${JSON.stringify(key)}` };
//   }

//   try {
//     customization = await transform(handle, files, { ...customization, ...props });
//     customization = await JoiCustomization(handle)
//       .validateAsync(customization);
//   } catch (err) {
//     return { err };
//   }

//   await db.updateCustomization(key, customization);

//   return { customization };
// };

// const removePhoto = async (handle, id, src) => {
//   const key = { handle, id };
//   const path = `photos/${handle}/${src.split('/').pop()}`;

//   try {
//     // TODO try synnchronous api?
//     await JoiCustomizationKey().validateAsync(key);
//     await JoiPhotoPath(handle).validateAsync(path);
//   } catch (err) {
//     return { err };
//   }

//   await photo.deletePhoto(path);
//   await db.removeCustomizationPhoto(key, path);
//   return {};
// };
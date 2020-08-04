const db = require('../db.js');
const { Joi, JoiCustomization, JoiDbPhotos, JoiMenuItem, JoiHandle, JoiId, JoiMulterPhotos, makeKey } = require('../validation.js');
const photo = require('../photo.js');

// Build for multi page xp
// Transform for single page xp
const build = async (handle, props, { menuItemPhotos, customizationPhotos }) => {

  let cleanBuild;
  try {
    try {
      if (customizationPhotos) {
        await JoiMulterPhotos()
          .validateAsync(customizationPhotos);

        // TODO cleanup on error
        props.customizationPhotos = await photo
          .savePhotos(handle, customizationPhotos);
      }

      if (menuItemPhotos) {
        await JoiMulterPhotos()
          .validateAsync(menuItemPhotos);

        props.menuItemPhotos = await photo
          .savePhotos(handle, menuItemPhotos);
      }
      // don't expose non Joi errors
    } catch { }

    if (props.customization) {
      props.customization.handle = handle;
    }

    props.handle = handle;
    props = await Joi.object({
      cleanBuild: Joi.bool(),
      customization: JoiCustomization(handle),
      handle: JoiHandle().required(),
      menuItemPhotos: JoiDbPhotos(handle),
      customizationPhotos: JoiDbPhotos(handle),
      sectionId: JoiId()
    }).validateAsync(props, { abortEarly: false, convert: true });

    cleanBuild = props.cleanBuild;
    delete props.cleanBuild;

  } catch (err) {
    return { err };
  }

  if (cleanBuild) {
    // remove files on disk
  }

  return { build: props };
};

const set = async (handle, props) => {

  let menuItem;
  try {
    props.handle = handle;
    menuItem = await JoiMenuItem(handle)
      .validateAsync(props, { abortEarly: false, convert: true });
  } catch (err) {
    return { err };
  }

  console.log('setting menu item');
  await db.upsertMenuItem(menuItem);
  console.log({ menuItem });

  return { menuItem };
};

const remove = async (handle, id) => {
  const { err, key } = await makeKey(handle, id);
  if (err) {
    return { err };
  }

  await db.deleteMenuItem(key);

  return {};
};

const findById = async (handle, id, shape) => {
  const { err, key } = await makeKey(handle, id);
  if (err) {
    return { err };
  }

  const menuItem = await db.findMenuItem(key, shape);
  if (!menuItem) {
    return { err: `MenuItem not found ${JSON.stringify(key)}` };
  }

  return { menuItem };
};

const listByHandle = async (handle, shape) => {
  try {
    await JoiHandle().validateAsync(handle);
  } catch (err) {
    return { err };
  }

  const menuItems = await db.findMenuItems({ handle }, shape);

  return { menuItems };
};

module.exports = {
  api: {
    build,
    set,
    remove,
    findById,
    listByHandle,
    shapes: {
      dashboard: db.shapes.default,
      profile: db.shapes.api.menuItem
    }
  }
};
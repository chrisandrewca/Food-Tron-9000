// todo remove dep on express-validation, no longer tied to API
// dep on Joi
// create err middleware if desired
const { Joi, validate } = require('express-validation');
const { toMoney } = require('./money');
const uuid = require('uuid').v4;

const makeKey = async (handle, id) => {
  const key = { handle, id };
  try {
    await JoiKey().validateAsync(key);
  } catch (err) {
    return { err };
  }
  return { key };
};

/*
 * Joi Helpers
 */
const JoiRequiredString = () => Joi.string().trim().required();
const JoiHandle = () => Joi.string().trim(); // TODO update
const JoiName = () => Joi.string().trim(); // TODO update
const JoiId = () => Joi.string().uuid({ version: 'uuidv4' });
const JoiPrice = () => Joi.number().precision(2).greater(0); // TODO cents ??
// const JoiPhotoPath = (handle) => Joi.string().trim().regex(new RegExp(`photos\/${handle}\/[a-zA-Z0-9]+\.jpeg`));
const JoiPhotoSrcPath = (handle) => Joi.string().trim().regex(new RegExp(`\/api\/photos\/${handle}\/[a-zA-Z0-9]+\.jpeg`));
const JoiCSVs = () => myJoi.formArray().items(Joi.string().trim());
const JoiMulterPhotos = () => Joi.array(); // TODO update

const JoiDbPhoto = (handle) => Joi.object({
  originalName: JoiRequiredString(),
  src: JoiPhotoSrcPath(handle).required()
});
const JoiDbPhotos = (handle) => Joi.array().items(JoiDbPhoto(handle));

const JoiKey = () => Joi.object({
  handle: JoiHandle().required(),
  id: JoiId().required()
});

const myJoi = Joi.extend(joi => ({
  base: joi.array(),
  type: 'formArray',
  coerce: (value) => {
    if (!Array.isArray(value)) {
      return { value: [] };
    }

    if (value.length && !value[0]) {
      // for empty arrays passed via FormData
      return { value: [] };
    }

    // FormData array passes in a comma separated string
    return { value: value[0].split(',') };
  }
})).extend(joi => ({
  base: joi.number(),
  type: 'price',
  messages: {
    'price.empty': '"{{#label}}" is empty.',
    'price.nan': '"{{#label}}" is not a number.',
    'price.minimum': '"{{#label}}" must be greater than 0.'
  },
  coerce(value, helpers) {
    if (!value) {
      helpers.error('price.empty');
    }

    const price = toMoney(value);
    if (isNaN(price)) {
      helpers.error('price.nan')
    }

    return { value: price };
  },
  validate(value, helpers) {
    if (value <= 0) {
      return { value, errors: helpers.error('price.minimum') };
    }
  }
}));

/*
 * Pristine definitions
 */
const JoiMenuItem = (handle) => Joi.object({
  id: JoiId().default(uuid()),
  handle: JoiHandle().required(),
  photos: JoiDbPhotos(handle).required(),
  name: JoiName().required(),
  description: Joi.string().allow(''),
  price: myJoi.price(),
  customizations: Joi.array().items(JoiCustomization(handle)).default([]),
  sectionId: JoiId()//.required()
});

const JoiCustomization = (handle) => Joi.object({
  id: JoiId().default(uuid()),
  handle: JoiHandle().required(),
  photos: JoiDbPhotos(handle).required(),
  name: JoiName().required(),
  description: Joi.string().allow(''),
  price: myJoi.price(),
  options: Joi.array().items(JoiOptions()),
  canChooseManyOptions: Joi.bool(),
  canSkip: Joi.bool(),
  multipleLimit: Joi.number().min(1).max(Number.MAX_SAFE_INTEGER),
  // TODO reject freeLimit when no price, UI needs fix
  freeLimit: Joi.number().min(1).max(Number.MAX_SAFE_INTEGER)
});

const JoiOptions = () => Joi.object({
  id: JoiId().default(uuid()),
  name: JoiName().required(),
  price: myJoi.price(),
  options: Joi.array().items(Joi.link('...'))
});

const JoiProfileOption = () => Joi.object({
  id: JoiId(),
  name: JoiName(),
  price: JoiPrice(),
  options: Joi.array().items(Joi.link('...'))
});

const JoiProfileCustomization = () => Joi.object({
  id: JoiId(),
  options: Joi.array().items(JoiProfileOption()) // TODO .allow([]) // TODO default?
});

const JoiProfileMenuItem = () => Joi.object({
  id: JoiId(),
  customizations: Joi.array().items(JoiProfileCustomization()) // TODO.allow([]) // TODO default?
});

const JoiProfileOrder = () => Joi.object({
  id: JoiId().default(uuid()),
  handle: JoiHandle().required(),
  menuItems: Joi.array().items(JoiProfileMenuItem()).required()
});

const JoiSystemLineItem = () => Joi.object({
  name: JoiName().required(),
  description: Joi.string(),
  images: Joi.array().items(Joi.string()), // TODO
  menuItemPrice: JoiPrice(),
  quantity: Joi.number().min(1).required(),
  totalPrice: JoiPrice().required()
});

const JoiSystemOrder = () => Joi.object({
  id: JoiId().required(), // default from JoiProfileOrder
  handle: JoiHandle().required(),
  menuItems: Joi.array().items(JoiProfileMenuItem()).required(),
  lineItems: Joi.array().items(JoiSystemLineItem()).required(),
  price: JoiPrice().required(),
  status: Joi.string().default('new'),
  time: Joi.date().default(Date.now())
});

module.exports = {
  makeKey,
  Joi: myJoi,
  JoiHandle,
  JoiId,
  JoiName,
  JoiPrice,
  JoiCSVs,
  //JoiPhotoPath,
  JoiPhotoSrcPath,
  JoiMulterPhotos,
  JoiDbPhoto,
  JoiDbPhotos,
  JoiKey,
  JoiRequiredString,
  JoiMenuItem,
  JoiCustomization,
  JoiProfileOption,
  JoiProfileCustomization,
  JoiProfileMenuItem,
  JoiProfileOrder,
  JoiSystemOrder,
  validate: (joi) => validate(joi, {}, { abortEarly: false }),
  formData: () => { }
};
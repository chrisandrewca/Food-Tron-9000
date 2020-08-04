import Api from '../api';
import { isEmpty, toCurrencyString } from '../forms';

const load = async (action, id) => {

  // TODO probably move back into actions.js
  if (!action || action.type != 'MenuItem') {
    action = {
      menuItem: {}
    };
  }

  const { menuItem } = action;
  const data = menuItem.data
    ? { ...menuItem.data }
    : id
      ? (await Api.getMenuItem(id)) // TODO error handling for deleted item thats been bookmarked/linked
      : Api.getMenuItemPlaceholder();

  const prices = data.customizations
    .filter(c => c.adjustment === 'replace');

  const fields = menuItem.fields
    ? { ...menuItem.fields }
    : {
      name: { errClass: '' },
      description: { errClass: '' },
      photos: { errClass: '' },
      price: { errClass: '' }
    };

  const {
    name,
    description,
    price
  } = data;

  if (name) fields.name.value = name;
  if (description) fields.description.value = description;
  if (price) fields.price.value = `$${price}`;

  return {
    data,
    fields,
    prices,
    type: 'MenuItem'
  };
};

const addPhotos = async (action, files) => {

  const { data } = action.menuItem;
  const photos = data.photos[0].placeholder ? [] : [...data.photos];

  const { menuItemPhotos } = await Api.buildMenuItem({}, { menuItemPhotos: files });
  photos.push(...menuItemPhotos);

  return {
    photos,
    fields: {
      ...action.menuItem.fields,
      photos: {
        ...action.menuItem.fields.photos,
        errClass: '',
        err: ''
      }
    }
  };
};

const removePhoto = async (action, src) => {
  const { menuItem } = action;
  const { data } = menuItem;

  const photos = data.photos.filter(p => p.src !== src);
  if (!photos.length) {
    photos.push(...Api.getMenuItemPlaceholder().photos);
  }

  return photos;
};

const save = async (action) => {

  const { menuItem } = action;
  const { prices } = menuItem;
  const fields = { ...menuItem.fields };

  if (prices.length) {
    delete fields.price.value;
  }

  // remove $
  // TODO don't remove dollar sign from UI
  if (fields.price.value
    && fields.price.value[0] === '$') {
    fields.price.value = fields.price.value.slice(1);
  }

  let data = { ...menuItem.data };
  for (const key of Object.keys(fields)) {
    data[key] = fields[key].value;
  }

  // overwrite fields.photos from data[key] = fields[key].value;
  data.photos = menuItem.data.photos;

  if (data.customizations[0].placeholder) {
    delete data.customizations;
  }

  // TODO fix me
  data.sectionId = 'c9645e87-e915-4fad-a3fd-51547136b3a4';

  data = await Api.saveMenuItem(data);
  Api.applyMenuItemDefaults(data);

  return data;
};

const remove = async (action) => {
  const { id } = action.menuItem.data;
  await Api.removeMenuItem(id);
};

const onChange = (action, name, value) => {
  let err = '', errClass = '';

  if (name === 'name' && isEmpty(value)) {
    // TODO updated error when checking against name charset
    err = 'Your menu item needs a name.';
    errClass = 'input-error';
  }
  else if (name === 'description') {
    // TODO
  }
  else if (name === 'price') {

    if (value && value[0] === '$') {
      // TODO localize/currency
      value = value.slice(1);
    }

    const price = Number(value);
    if (!isNaN(price) && price > 0) {
      value = toCurrencyString(price);
    } else {
      err = 'Your price needs to be like "$9.99".';
      errClass = 'input-error';
    }
  }

  return {
    ...action.menuItem.fields,
    [name]: {
      ...action.menuItem.fields[name],
      err,
      errClass,
      value
    }
  };
};

const onSubmit = async (action, onComplete) => {
  const { menuItem } = action;
  const { data: { photos }, prices } = menuItem;

  const fields = { ...menuItem.fields }
  let hasError = false;
  if (photos[0].placeholder) {
    fields.photos.err = 'Your menu item needs a photo.';
    fields.photos.errClass = 'input-error';
    hasError = true;
  }

  if (fields.name.err || isEmpty(fields.name.value)) {
    fields.name.err = 'Your menu item needs a name.';
    fields.name.errClass = 'input-error';
    hasError = true;
  }

  if (!prices.length
    && (fields.price.err || isEmpty(fields.price.value))) {
      fields.price.err = 'Your menu item needs a price.';
      fields.price.errClass ='input-error';
    hasError = true;
  }

  await onComplete({ hasError });
  return fields;
};

export default {
  load,
  addPhotos,
  removePhoto,
  save,
  remove,
  onChange,
  onSubmit
};
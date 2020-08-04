import Api from '../api';
import { isEmpty, toCurrencyString } from '../forms';
import { makeAction } from './business';
import OptionTree from './option-tree';

const load = makeAction(async (action, id) => {

  const { menuItem } = action;
  const { customizations } = menuItem.data;

  const data = id
    ? customizations.find(c => c.id === id)
    : Api.getCustomizationPlaceholder();

  const fields = {
    photos: { errClass: '' },
    name: { errClass: '' },
    description: { errClass: '' },
    price: { errClass: '' },
    // Warning: options.value.id changes here
    options: { errClass: '', value: OptionTree.initialize() },
    canChooseManyOptions: { errClass: '' },
    canSkip: { errClass: '' },
    hasMultiple: { errClass: '' },
    // we have now arrived to object oriented programming
    // multipleLimit could be defined as a a setter/getter - yeah yeah sure, it localizes stuff, avoid global variables, duplication.... NO!
    // BECAUSE...
    // 1. MUTATIONS! Whoever mutates the value is responsible for re-running all side effect state to be in alignment with its new value, in a non oop env
    // 2. Objects with functions define the ownership of these transforms
    // 3. 
    multipleLimit: { errClass: '' },
    freeLimit: { errClass: '' }, // TODO business logic to only exist when priced
  };

  let hasPrice = false;
  if (data.id) {
    // TODO double check data, some stuff nullable? might need guards?
    fields.id = { value: id };
    fields.name.value = data.name;
    fields.description.value = data.description;
    fields.canChooseManyOptions.value = data.canChooseManyOptions;
    fields.canSkip.value = data.canSkip;

    if (data.multipleLimit) {
      fields.hasMultiple.value = true;
      fields.multipleLimit.value = data.multipleLimit;
      fields.freeLimit.value = data.freeLimit;
    }

    if (data.options) {
      const tree = OptionTree.fromJsonable({ items: data.options });
      fields.options.value.hasOptions = tree.hasOptions;
      fields.options.value.items = tree.items;
      hasPrice = tree.hasPrice;
    }

    if (data.price) {
      fields.price.value = `$${data.price}`;
      hasPrice = true;
    }
  }

  return {
    fields,
    data,
    hasPrice
  };
});

const addPhotos = makeAction(async (action, files) => {

  const { data } = action.customization;
  const photos = data.photos[0].placeholder ? [] : [...data.photos];

  const { customizationPhotos } = await Api.buildMenuItem(
    {},
    { customizationPhotos: files });
  photos.push(...customizationPhotos);

  return {
    photos,
    fields: {
      ...action.customization.fields,
      photos: { errClass: '', err: '' }
    }
  };
});

const removePhoto = makeAction((action, src) => {

  const { customization } = action;
  const { data } = customization;

  const photos = data.photos.filter(p => p.src !== src);

  if (!photos.length) {
    photos.push(...Api.getCustomizationPlaceholder().photos);
  }

  return { photos };
});

const save = makeAction(async (action) => {

  const fields = { ...action.customization.fields };

  const build = {
    photos: action.customization.data.photos,
    name: fields.name.value,
    canChooseManyOptions: fields.canChooseManyOptions.value,
    canSkip: fields.canSkip.value
  };

  if (fields.description.value && !isEmpty(fields.description.value)) {
    build.description = fields.description.value;
  }

  if (fields.price.value && !isEmpty(String(fields.price.value))) {
    let price = fields.price.value;
    if (price[0] === '$') {
      // slice doesn't mutate the original, fields OK
      price = price.slice(1);
    }
    build.price = price;
  }

  if (fields.hasMultiple.value) {
    build.multipleLimit = fields.multipleLimit.value
      ? fields.multipleLimit.value
      : Number.MAX_SAFE_INTEGER;

    // TODO logic for only when has price
    if (fields.freeLimit.value) {
      build.freeLimit = fields.freeLimit.value;
    }
  }

  const optionTree = fields.options.value;
  if (optionTree.hasOptions) {
    build.options = OptionTree.toJsonable(optionTree);
    if (!build.options.length) {
      delete build.canChooseManyOptions;
    }
  }

  const customizationData = (await Api.buildMenuItem({
    // buildMenuItem accepts fields, so we use 'value' prop
    customization: { value: JSON.stringify(build) }
  })).customization;


  const menuItemData = { ...action.menuItem.data };
  menuItemData.customizations =
    menuItemData.customizations[0].placeholder
      ? []
      : [...menuItemData.customizations];

  if (action.customization.data.id) {
    const i = menuItemData.customizations.findIndex(c => c.id === action.customization.data.id);
    menuItemData.customizations[i] = customizationData;
  } else {
    menuItemData.customizations.push(customizationData);
  }

  return {
    menuItemData,
    customizationData,
    result: { save: { hasError: false } } // TODO error handling
  };
});

// TODO this code belongs to MenuItem
const remove = makeAction((action) => {

  return {
    customizations: [
      ...action.menuItem.data.customizations
        .filter(c => c.id !== action.customization.data.id)
    ]
  };
});

const onOptionTreeMenuClick = makeAction((action, payload, tier) => {

  const optionTree = OptionTree.onMenuClick(
    action.customization.fields.options.value,
    payload,
    tier);

  const canChooseManyOptions = { ...action.customization.fields.canChooseManyOptions };
  if (!optionTree.hasOptions) {
    canChooseManyOptions.value = undefined;
  }

  return {
    fields: {
      ...action.customization.fields,
      canChooseManyOptions,
      options: {
        ...action.customization.fields.options,
        value: optionTree
      }
    }
  };
});

const onOptionTreeOptionChange = makeAction((action, payload, tier) => {

  const optionTree = OptionTree.onOptionChange(
    action.customization.fields.options.value,
    payload,
    tier);

  const options = { ...action.customization.fields.options };
  // TODO augment option tree to hold a top level error?
  options.err = optionTree.errors ? 'Your options are incomplete.' : '';
  options.value = optionTree;

  let { hasPrice } = action.customization;
  for (const option of tier.options) {
    if (!option.fields.price.err && option.fields.price.value) {
      hasPrice = true;
    }
  }

  return {
    fields: {
      ...action.customization.fields,
      options
    },
    hasPrice
  };
});

const onChange = makeAction((action, name, value, checked) => {

  const fields = { ...action.customization.fields };
  let { hasPrice } = action.customization;

  // empty strings and spaces for class appends
  let err = '', errClass = '';
  if (name === 'name'
    // TODO test script injection, validate on server too
    && isEmpty(value)) {
    err = 'Your customization needs a name.';
    errClass = 'input-error';
  }
  else if (name === 'description') {
    // TODO
  }
  else if (name === 'price') {

    if (value[0] === '$') {
      // TODO localize/currency
      value = value.slice(1);
    }

    const price = Number(value);
    if (!isNaN(price) && price > 0) {
      value = toCurrencyString(price);
      hasPrice = true;
    } else if (value.length) {
      err = 'Your price must be like "$3.99" or empty.';
      errClass = 'input-error';
    }
  }
  else if (name === 'canChooseManyOptions') {
    value = checked;
  }
  else if (name === 'canSkip') {
    value = checked;
  }
  else if (name === 'hasMultiple') {
    value = checked;
    // there's checks, unsetting, setting, adding, editing, state, and action
    // ultimately the user should 1) know the state changed 2) commit it
    // TODO better state machines / understanding possible states / browser states / opportunities to invoke actions (back/save/bar)
    if (!checked) {
      fields.multipleLimit.value = undefined;
      fields.multipleLimit.err = '';
      fields.multipleLimit.errClass = '';
      fields.freeLimit.value = undefined;
      fields.freeLimit.err = '';
      fields.freeLimit.errClass = '';
    }
  }
  else if (name === 'multipleLimit') {
    const limit = parseInt(value);

    let freeLimit;
    if (!fields.freeLimit.value) {
      freeLimit = 0;
    } else {
      freeLimit = parseInt(fields.freeLimit.value);
    }

    if (value !== '') {
      if (isNaN(limit) || limit <= 0) {

        err = "Must be a number like '3' or empty for Unlimited.";
        errClass = 'input-error';
      }
      else if (!isNaN(freeLimit)) {

        if (freeLimit > limit) {
          err = `Must be at least ${freeLimit}.`;
          errClass = 'input-error';
        }

        if (freeLimit > 0) {
          fields.freeLimit.err = '';
          fields.freeLimit.errClass = '';
        }
      }
    }
  }
  else if (name === 'freeLimit') {
    const limit = parseInt(value);

    let multipleLimit;
    if (!fields.multipleLimit.value) {
      multipleLimit = Number.MAX_SAFE_INTEGER;
    } else {
      multipleLimit = parseInt(fields.multipleLimit.value);
    }

    if (value !== '') {
      if (isNaN(limit) || limit <= 0) {

        err = "Must be a number like '3' or empty for None.";
        errClass = 'input-error';
      }
      else if (!isNaN(multipleLimit)) {

        if (multipleLimit < limit) {
          err = `Must be ${multipleLimit} or less.`;
          errClass = 'input-error';
        }

        if (multipleLimit > 0) {
          // TODO error states [clearable/not] since we're revalidating here
          // capturing specialized knowledge of another field
          fields.multipleLimit.err = '';
          fields.multipleLimit.errClass = '';
        }
      }
    }
  }

  // some state has side effects
  // which run other state machines
  // like change -> clear error -> change display value
  // all which run on their own state or make their own decisions

  return {
    fields: {
      ...fields,
      [name]: {
        ...fields[name],
        err,
        errClass,
        value
      }
    },
    hasPrice
  };
});

const onSubmit = makeAction(async (action) => {

  const { customization } = action;
  const { data: { photos } } = customization;

  const fields = { ...customization.fields };

  let hasError = false;
  for (const key in fields) {
    if (fields[key].err) {
      hasError = true;
    }
  }

  if (photos.length && photos[0].placeholder) {
    fields.photos.err = 'Your customization needs a photo.';
    fields.photos.errClass = 'input-error';
    hasError = true;
  }

  if (isEmpty(fields.name.value)) {
    fields.name.err = 'Your customization needs a name.';
    fields.name.errClass = 'input-error';
    hasError = true;
  }

  return {
    fields,
    result: { onSubmit: { hasError } }
  };
});

export default {
  load,
  addPhotos,
  removePhoto,
  save,
  remove,
  onOptionTreeMenuClick,
  onOptionTreeOptionChange,
  onChange,
  onSubmit
};
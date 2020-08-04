import { isEmpty, toCurrencyString } from '../forms';
import { v4 as uuid } from 'uuid';

const initialize = () => ({
  id: uuid(), // client side id
  errors: null,
  hasOptions: false,
  items: [
    Option({ menuState: 'add' })
  ]
});

const onMenuClick = (
  optionTree, {
    menuState: {
      state,
      item
    }
  }, {
    option,
    options,
    root
  }) => {

  optionTree = mergeTree(optionTree, options, root);

  // handle menu flow: add -> choose [remove > choose/add choice], messy state lol
  if (state === 'add') {

    option.menuState = 'choose';
    options.push(Option({ menuState: 'add', parent: option.parent }));

  } else if (item === 'remove') {

    options.splice(options.findIndex(o => o.id === option.id), 1);
    // if there's only one option remaining
    if (options.length === 1
      // and its the add button
      && options[0].menuState === 'add'
      // and its not the last add button
      && (optionTree.items.length > 1
        || optionTree.items[0].options.length)) {
      // remove the tier
      options.splice(0, 1);
    }

  } else if (state === 'choose') {

    if (!option.options.length) {
      option.options = [
        Option({ menuState: 'choose', parent: option }),
        Option({ menuState: 'add', parent: option })
      ];
    }
  }

  optionTree.id = uuid(); // tell React to refresh the list of components
  optionTree.hasOptions = optionTree.items.length > 1;
  return optionTree
};

const onOptionChange = (
  optionTree, {
    checked,
    name,
    value
  }, {
    option,
    options,
    root
  }) => {

  optionTree = mergeTree(optionTree, options, root);

  let err = '', errClass = '';
  if (name === 'name') {
    // TODO define char set for valid option Pepsi -_ 2L
    // TODO is alphaNumericNamePolicyThing

    if (isEmpty(value)
      && option.fields.price.value) {
      err = 'Your option needs a name.';
      errClass = 'input-error';
    }
  } else if (name === 'price') {
    if (value[0] === '$') {
      // TODO localize/currency
      value = value.slice(1);
    }

    const price = Number(value);
    if (!isNaN(price) && price > 0) {
      value = toCurrencyString(price);
    } else if (value) {
      err = 'Your price must be like "$0.99" or empty.';
      errClass = 'input-error';
    }

    // and also
    if (!value
      && option.fields.name.err
      && isEmpty(option.fields.name.value)) {
      option.fields.name.err = '';
      option.fields.name.errClass = '';
    }
  } else if (name === 'checked') {
    value = checked;
  }

  option.fields[name] = {
    ...option.fields[name],
    err,
    errClass,
    value
  };

  if (err) {
    optionTree.errors = { ...(optionTree.errors || {}) };
    optionTree.errors[option.id] = true;
  } else if (optionTree.errors) {
    delete optionTree.errors[option.id];
    if (!Object.keys(optionTree.errors).length) {
      optionTree.errors = null;
    }
  }

  return optionTree;
};

const onSubOptionsCheck = (optionTree, { checked, selectChildren, tier }) => {

  const checkDown = (options) => {
    options = [...options];

    for (let i = 0; i < options.length; i++) {
      const option = { ...options[i] };
      options[i] = option;

      option.fields.checked.value = checked;
      option.options = checkDown(option.options);
    }
    return options;
  };

  // TODO may not be able to assume parent
  // assumes options has a parent
  const checkUp = (optionTree, options) => {
    options = [...options];

    for (let i = 0; i < options.length; i++) {
      const option = { ...options[i] };
      options[i] = option;
    }

    // assumes option has parent
    // all the options in a tier have the same parent
    const parent = { ...options[0].parent };
    parent.options = options;
    parent.fields.checked.value = checked;

    if (parent.parent) {
      // we're climbing by ref assignment to parent.options
      checkUp(optionTree, parent.parent.options);
    } else {
      optionTree.items = [...optionTree.items];
      const i = optionTree.items.findIndex(o => o.id === parent.id);
      optionTree.items[i] = parent;
    }
  };

  const option = { ...tier.option };

  if ((checked && selectChildren) || !checked) {
    option.options = checkDown(option.options);
  }

  option.options = selectChildren
    ? checkDown(option.options, true)
    : checkDown(option.options, false);

  const options = [...tier.options];
  const i = options.findIndex(o => o.id === option.id);
  options[i] = option;
  // warning: option/options may be copied after here by checkUp, ref no longer valid for updates

  optionTree = { ...optionTree };

  let hasSelectedSibling;
  for (const option of options) {
    if (option.fields.checked.value) {
      hasSelectedSibling = true;
      break;
    }
  }

  if (option.parent) {
    // if others checked and we're unchecking dont checkup
    if (hasSelectedSibling && !checked) {
    } else {
      // if no others checked and we're unchecking checkup
      checkUp(optionTree, options);
    }
  } else {
    optionTree.items = options;
  }

  return optionTree;
};

const fromJsonable = ({ items, hasPrice = false, hasOptions = false, withAddButtons = true }, parent) => {

  const options = [];
  for (const ref of items) {
    const option = { ...ref };

    if (parent) {
      option.parent = parent;
    }

    const jsonable = option.options
      ? fromJsonable({ items: option.options, hasPrice, hasOptions, withAddButtons }, option)
      : { items: [] };

    option.options = jsonable.items;
    hasPrice = jsonable.hasPrice;

    option.fields = OptionFields({ name: option.name });

    if (option.price) {
      hasPrice = true;
      option.fields.price.value = `$${option.price}`;
    }

    delete option.name;
    delete option.price;

    option.menuState = 'choose'; // TODO
    options.push(option);
    hasOptions = true;
  }

  if (parent) {
    parent.options = options; // parent by ref
  }

  if (withAddButtons) {
    const addOption = Option({ menuState: 'add' });
    addOption.parent = parent;
    options.push(addOption);
  }

  return { items: options, hasPrice, hasOptions, withAddButtons };
};

const toJsonable = (optionTree) => {

  const { items } = optionTree;

  const options = [];
  for (const ref of items) {

    if (ref.menuState === 'add'
      || isEmpty(ref.fields.name.value)) {
      continue;
    }

    const option = { ...ref };
    option.name = option.fields.name.value;

    if (!isEmpty(option.fields.price.value)) {
      // TODO repeating this code a lot, and will need internationalization
      let price = option.fields.price.value;
      if (price[0] === '$') {
        price = price.slice(1);
      }
      option.price = price;
    }

    if (option.parent) {
      delete option.parent;
    }

    if (option.options.length) {
      option.options = toJsonable({ items: option.options });
    } else {
      delete option.options;
    }

    delete option.fields;
    delete option.menuState;
    options.push(option);
  }

  return options;
};

export default {
  initialize,
  fromJsonable,
  onMenuClick,
  onOptionChange,
  onSubOptionsCheck,
  toJsonable
};

const mergeTree = (optionTree, options, root) => {
  optionTree = { ...optionTree };

  let { items } = optionTree;
  if (options.findIndex(o => o.id === root.id) >= 0) {
    // options is the root set && option a ref to an ele in that set
    items = options;
  } else {
    // options is a node somewhere in the copied branch root.options
    items = [...items];
    // needs to happen before 'Add option' cause option.options mutation on top level []
    items[items.findIndex(o => o.id === root.id)] = root;
  }

  optionTree.items = items;
  return optionTree;
};

const Option = ({ menuState, parent }) => ({
  id: uuid(),
  fields: OptionFields(),
  menuState,
  options: [],
  parent
});

const OptionFields = ({ name, price } = {}) => ({
  name: { errClass: '', value: name },
  price: { errClass: '', value: price },
  checked: { errClass: '', value: false }
});

// function refReplacer() {
//   let m = new Map();
//   let v = new Map();
//   let replacer = (field, value) => value;

//   return function (field, value) {
//     let p = m.get(this) + (Array.isArray(this) ? `[${field}]` : '.' + field);
//     let isComplex = value === Object(value)

//     if (isComplex) m.set(value, p);

//     let pp = v.get(value) || '';
//     let path = p.replace(/undefined\.\.?/, '');
//     let val = pp ? `#REF:${pp[0] == '[' ? '$' : '$.'}${pp}` : value;

//     if (!pp && isComplex) v.set(value, path);

//     return replacer.call(this, field, val)
//   }
// }
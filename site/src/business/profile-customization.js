import { makeAction } from './business';
import OptionTree from './option-tree';

const load = makeAction(async (action, id) => {
  // TODO may be new or may be ALREADY added - handle it!

  // warning: not a copy
  const customization = action.menuItem.src.customizations.find(c => c.id === id);

  const fields = {
    options: { errClass: '', value: OptionTree.initialize() }
  };

  const { hasOptions, items } = OptionTree.fromJsonable({ items: customization.options, withAddButtons: false });
  fields.options.value.hasOptions = hasOptions;
  fields.options.value.items = items;

  return {
    customization,
    fields
  };
});


const save = makeAction((action) => {

  const { fields } = action.customization;
  // TODO
  // options.hasFields
  // options.hasSelection
  // move these checks into onSubmit

  const build = {};
  build.id = action.customization.src.id
  build.options = OptionTree.toJsonable(fields.options.value);

  const customizations = [...action.menuItem.data.customizations, build];

  return {
    menuItem: {
      ...action.menuItem,
      data: {
        ...action.menuItem.data,
        customizations
      }
    },
    result: {
      save: {
        hasError: false // TODO error handling
      }
    }
  };
});

const onOptionTreeOptionChange = makeAction((action, payload, tier) => {

  const optionTree = OptionTree.onOptionChange(
    action.customization.fields.options.value,
    payload,
    tier);

  return {
    fields: {
      ...action.customization.fields,
      options: {
        ...action.customization.fields.options,
        value: optionTree
      }
    },
    result: {
      onOptionTreeOptionChange: {
        checked: tier.option.fields.checked.value,
        hasSubOptions: !!tier.option.options.length,
        tier
      }
    }
  };
});

const onOptionTreeSubOptionsCheck = makeAction((action, check) => {

  const optionTree = OptionTree.onSubOptionsCheck(
    action.customization.fields.options.value,
    check);

  return {
    fields: {
      ...action.customization.fields,
      options: {
        ...action.customization.fields.options,
        value: optionTree
      }
    }
  };
});

const onSubmit = makeAction((action) => {
  const { fields } = action.customization;

  // TODO
  // options.hasFields
  // options.hasSelection
  // move these checks into onSubmit

  let hasError;
  if (fields.options.value.errors) {
    result.onSubmit.hasError = true;
  }

  return {
    result: {
      onSubmit: {
        hasError
      }
    }
  };
});

export default {
  load,
  onOptionTreeOptionChange,
  onOptionTreeSubOptionsCheck,
  onSubmit,
  save
};
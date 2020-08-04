import Api from '../api';
import { makeAction } from './business';

const load = makeAction(async (action, handle, id) => {

  let data, src;

  if (action.menuItem
    && action.menuItem.src
    && action.menuItem.src.id === id) {

    // an update
    src = { ...action.menuItem.src };
    data = { ...action.menuItem.data };
  } else {

    // an add
    src = await Api.getProfileMenuItem(handle, id);
    data = { customizations: [] };
  }

  return {
    data,
    src
  };
});

const save = makeAction((action, order) => {

  const menuItem = {
    id: action.menuItem.src.id,
    ...action.menuItem.data
  };

  const menuItems = [...order.menuItems, menuItem];

  return {
    menuItems,
    result: {
      save: {
        hasError: false
      }
    }
  };
});

const onSubmit = makeAction((action) => {
  // TODO validate

  return {
    result: {
      onSubmit: {
        hasError: false
      }
    }
  };
});

export default {
  load,
  onSubmit,
  save
};
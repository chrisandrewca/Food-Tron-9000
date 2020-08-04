import Api from '../api';

const initialize = async () => {
  const menuItems = await Api.listMenuItems();
  return {
    menuItems,
    type: 'Menu'
  };
};

export default {
  initialize
};
import Api from '../api';

const load = async (handle) => {
  const menuItems = await Api.getProfile(handle);
  return { menuItems };
};

export default {
  load
};
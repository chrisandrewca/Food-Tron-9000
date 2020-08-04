const load = (state, handle) => {

  const { order = {} } = state;

  console.log('order', { order, handle });
  if (order.handle !== handle) {
    console.log('resetting');
    order.handle = handle;
    order.menuItems = [];
  }

  return {
    order
  };
};

export default {
  load
};
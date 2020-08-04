import Order from '../../../business/order';

export default () => ({
  load(state, handle) {
    // we choose to use order rather than action/order because
    // 1) order is a tight scope allowing us to keep Local Storage kb usage low by resetting action @ entry points
    //    if we did not do this, things like Profile would hang around while operating on actions through various stages
    // maybe there are other options
    // TODO paginate for MenuItems, etc

    const { order } = Order.load(state, handle);

    return {
      order
    };
  }
});
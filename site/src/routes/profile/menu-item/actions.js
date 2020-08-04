import ProfileMenuItem from '../../../business/profile-menu-item';

// RULE: Entry points need to fetch
// !!!!!!!!!! otherwise owners can delete stuff, refresh to check site, see stale items

// TODO all loaders should fetch
export default () => ({
  async load({ action }, handle, id) {

    if (!action || action.type !== 'ProfileMenuItem') {
      action = { type: 'ProfileMenuItem' };
    }

    // TODO error handling for when menu item does not exist
    const { data, result, src } = await ProfileMenuItem.load(action, handle, id);

    return {
      action: {
        ...action,
        menuItem: {
          data,
          result,
          src
        }
      }
    };
  },
  save({ action, order }) {

    const { menuItems, result } = ProfileMenuItem.save(action, order);

    return {
      action: {
        ...action,
        menuItem: {
          ...action.menuItem,
          result
        }
      },
      order: {
        ...order,
        menuItems
      }
    };
  },
  onSubmit({ action }) {

    const { result } = ProfileMenuItem.onSubmit(action);
    console.log('onSubmit', { result });

    return {
      action: {
        ...action,
        menuItem: {
          ...action.menuItem,
          result
        }
      }
    };
  }
});
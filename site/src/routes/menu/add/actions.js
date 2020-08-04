import MenuItem from '../../../business/menu-item';

export default () => ({
  // Think about flow from page to page, component needs, access to URLs
  // We're going to ignore menu's state, reset it, and retrieve the menu item if need be
  // Drive simply, rather than handling the multidude of cases for one less API call
  async load({ action }, id) {

    const { type, ...menuItem } = await MenuItem.load(action, id);
    return {
      action: {
        ...action,
        menuItem: {
          ...action.menuItem,
          ...menuItem
        },
        type
      }
    };
  },
  async addPhotos({ action }, files) {
    const { photos, fields } = await MenuItem.addPhotos(action, files);
    return {
      action: {
        ...action,
        menuItem: {
          ...action.menuItem,
          data: {
            ...action.menuItem.data,
            photos
          },
          fields
        }
      }
    };
  },
  async removePhoto({ action }, src) {
    const photos = await MenuItem.removePhoto(action, src);
    return {
      action: {
        ...action,
        menuItem: {
          ...action.menuItem,
          data: {
            ...action.menuItem.data,
            photos
          }
        }
      }
    };
  },
  async save({ action }) {
    const data = await MenuItem.save(action);
    return {
      action: {
        ...action,
        menuItem: {
          ...action.menuItem,
          data
        }
      }
    };
  },
  async remove({ action }) {
    await MenuItem.remove(action);
  },
  onChange({ action }, name, value) {
    const fields = MenuItem.onChange(action, name, value);
    return {
      action: {
        ...action,
        menuItem: {
          ...action.menuItem,
          fields
        }
      }
    };
  },
  async onSubmit({ action }, onComplete) {
    const fields = await MenuItem.onSubmit(action, onComplete);
    return {
      action: {
        ...action,
        menuItem: {
          ...action.menuItem,
          fields
        }
      }
    };
  }
});
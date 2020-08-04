import Customization from '../../../../business/customization';

export default () => ({
  // Think about flow from page to page, component needs, access to URLs, favourites, links
  // // human readable ....
  // We're going to ignore menu's state, reset it, and retrieve the menu item if need be
  // Drive simply, rather than handling the multidude of cases for one less API call
  // This is really a customization in the context of a menu item, or however action needs
  // to be defined in accordance tso the component - that's why action.js beside index.js is a good fit
  async load({ action }, id) {

    if (!action || !action.type === 'MenuItem') {
      // TODO global app error handling, programmer error tho
      return { action: null };
    }

    const { fields, data, hasPrice, result } =
      await Customization.load(action, id);

    return {
      action: {
        ...action,
        customization: {
          data,
          fields,
          hasPrice,
          result
        }
      }
    };
  },
  async addPhotos({ action }, files) {

    const { fields, photos, result } =
      await Customization.addPhotos(action, files);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          data: {
            ...action.customization.data,
            photos
          },
          fields,
          result
        }
      }
    };
  },
  removePhoto({ action }, src) {

    const { photos, result } =
      Customization.removePhoto(action, src);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          data: {
            ...action.customization.data,
            photos
          },
          result
        }
      }
    };
  },
  async save({ action }, photos) {

    const { customizationData, menuItemData, result } =
      await Customization.save(action, photos);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          data: customizationData,
          result
        },
        menuItem: {
          ...action.menuItem,
          data: menuItemData
        }
      }
    };
  },
  async remove({ action }) {

    // TODO this code belongs to MenuItem
    const { customizations, result } =
      Customization.remove(action);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          result
        },
        menuItem: {
          ...action.menuItem,
          data: {
            ...action.menuItem.data,
            customizations
          }
        }
      }
    }
  },
  onOptionTreeCanChooseMany({ action }, value) {

    const { fields, result } =
      Customization.onOptionTreeCanChooseMany(action, value);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          fields,
          result
        }
      }
    };
  },
  onOptionTreeMenuClick({ action }, payload, tier) {

    const { fields, hasPrice, result } =
      Customization.onOptionTreeMenuClick(action, payload, tier);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          fields,
          hasPrice,
          result
        }
      }
    };
  },
  onOptionTreeOptionChange({ action }, payload, tier) {

    const { fields, result } =
      Customization.onOptionTreeOptionChange(action, payload, tier);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          fields,
          result
        }
      }
    };
  },
  onChange({ action }, name, value, checked) {

    const { fields, hasPrice, result } =
      Customization.onChange(action, name, value, checked);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          fields,
          hasPrice,
          result
        }
      }
    };
  },
  async onSubmit({ action }, onComplete) {

    const { fields, result } =
      await Customization.onSubmit(action, onComplete);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          fields,
          result
        }
      }
    };
  }
});
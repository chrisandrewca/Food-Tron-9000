import ProfileCustomization from '../../../../business/profile-customization';

export default () => ({
  async load({ action }, id) {

    if (!action || action.type !== 'ProfileMenuItem') {
      return { action: null }; // TODO global error handling
    }

    const { customization, fields, result } =
      await ProfileCustomization.load(action, id);
    
    console.log({ result });

    return {
      action: {
        ...action,
        customization: {
          fields,
          result,
          src: customization
        }
      }
    };
  },
  save({ action }) {

    const { menuItem, result } = ProfileCustomization.save(action);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          result
        },
        menuItem
      }
    };
  },
  onOptionTreeOptionChange({ action }, payload, tier) {

    const { fields, result } =
      ProfileCustomization.onOptionTreeOptionChange(action, payload, tier);

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
  onOptionTreeSubOptionsCheck({ action }, check) {

    const { fields, result } =
      ProfileCustomization.onOptionTreeSubOptionsCheck(action, check);

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
  onSubmit({ action }) {

    const { result } = ProfileCustomization.onSubmit(action);

    return {
      action: {
        ...action,
        customization: {
          ...action.customization,
          result
        }
      }
    };
  }
});
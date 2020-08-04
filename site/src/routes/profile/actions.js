import Profile from '../../business/profile';

export default () => ({
  async load({ action }, handle) {

    console.log('Profile', { handle });
    if (!action || action.type !== 'Profile') {
      action = { type: 'Profile' };
    }

    const { menuItems } = await Profile.load(handle);

    return {
      action: {
        ...action,
        profile: {
          menuItems
        }
      }
    };
  }
});
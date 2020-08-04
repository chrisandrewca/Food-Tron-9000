import Menu from '../../business/menu';

export default () => ({
  async initialize() {
    const action = await Menu.initialize();
    return {
      action
    };
  }
});
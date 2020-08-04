// import { h } from 'preact';
// import Header from '../src/components/header';
// // See: https://github.com/preactjs/enzyme-adapter-preact-pure
// import { shallow } from 'enzyme';

// describe('Initial Test of the Header', () => {
// 	test('Header renders 3 nav items', () => {
// 		const context = shallow(<Header />);
// 		expect(context.find('h1').text()).toBe('Preact App');
// 		expect(context.find('Link').length).toBe(3);
// 	});
// });

import createStore from 'unistore';
import { h } from 'preact';
import PromotionAds from '../src/components/promotion-ads';
import PromotionFreeOrders from '../src/components/promotion-free-orders';
import { Provider } from 'unistore/preact';
import { mount } from 'enzyme';
import PromotionReducedRate from '../src/components/promotion-reduced-rate';

/*
 * Promotion: 25 free orders
 * - Displays start button until user has signed up for stripe
 * - Displays claim button until user has claimed 25 free orders
 * - Displays claimed
 */
describe('Promotion: 25 free orders', () => {
  const store = createStore();

  test('Display start when user not signed up for stripe', () => {
    store.setState({ claimedFreeOrders: false, hasStripeInfo: false, orderCount: 0 });

    const context = mount(
      <Provider store={store}>
        <PromotionFreeOrders />
      </Provider>);
    expect(context.find('button').text()).toBe('Start');
  });

  test('Display claim when user has signed up for stripe', () => {
    store.setState({ claimedFreeOrders: false, hasStripeInfo: true, orderCount: 0 });

    const context = mount(
      <Provider store={store}>
        <PromotionFreeOrders />
      </Provider>);
    expect(context.find('button').text()).toBe('Claim');
  });

  test('Display free orders count when user has claimed free orders', () => {
    store.setState({ claimedFreeOrders: true, hasStripeInfo: true, orderCount: 0 });

    const context = mount(
      <Provider store={store}>
        <PromotionFreeOrders />
      </Provider>);
    expect(context.find('h2').text()).toBe('0/25');
  });
});

/*
 * Promotion: $5 in Ads
 * - Displays create button until user has created their first menu item
 * - Displays n/5 count until user has created all 5 menu items
 * - Displays claim button until user has claimed $5 in ads and submitted form
 * - Displays claimed
 */
describe('Promotion: $5 in ads', () => {
  const store = createStore();

  test('Display create when user has no menu items', () => {
    store.setState({ adCampaignStatus: 'Pending', claimedAds: false, menuItemCount: 0 });

    const context = mount(
      <Provider store={store}>
        <PromotionAds />
      </Provider>);
    expect(context.find('button').text()).toBe('Create');
  });

  test('Display 3/5 when user has 3 menu items', () => {
    store.setState({ adCampaignStatus: 'Pending', claimedAds: false, menuItemCount: 3 });

    const context = mount(
      <Provider store={store}>
        <PromotionAds />
      </Provider>);
    expect(context.find('h2').last().text()).toBe('3/5');
  });

  test('Display claim when users has 5 or more menu items', () => {
    store.setState({ adCampaignStatus: 'Pending', claimedAds: false, menuItemCount: 5 });

    const context = mount(
      <Provider store={store}>
        <PromotionAds />
      </Provider>);
    expect(context.find('button').text()).toBe('Claim');

    store.setState({ adCampaignStatus: 'Pending', claimedAds: false, menuItemCount: 6 });
    context.mount();
    expect(context.find('button').text()).toBe('Claim');
  });

  test('Display pending ad campaign when user has claimed ads', () => {
    store.setState({ adCampaignStatus: 'In-Progress', claimedAds: true, menuItemCount: 5 });

    const context = mount(
      <Provider store={store}>
        <PromotionAds />
      </Provider>);
    expect(context.find('p').text()).toBe("We're creating your ad campaign now. You'll receive an update within a day or so.");
  });

  test('Display in-progress ad campaign when adCampaignStatus is not Pending', () => {
    store.setState({ adCampaignStatus: 'Running', claimedAds: true, menuItemCount: 5 });

    const context = mount(
      <Provider store={store}>
        <PromotionAds />
      </Provider>);
    expect(context.find('p').text()).toBe('Your ad campaign is running.');
  });
});

/*
 * Promotion: Reduced rate
 * - Displays share menu button until user has their first sale
 * - Displays n/$1000 until user has had $1000 in sales
 * - Displays claim button until user has claimed
 * (+ send personal email)
 * - Displays claimed
 */
describe('Promotion: Reduced Rate', () => {
  const store = createStore();

  test('Display share menu when user has no sales', () => {
    store.setState({ claimedReducedRate: false, dollarSales: 0, handle: 'ft9' });

    const context = mount(
      <Provider store={store}>
        <PromotionReducedRate />
      </Provider>);
    expect(context.find('button').text()).toBe('Share menu');
  });

  test('Display $45/$1000 when user has $45 in sales', () => {
    store.setState({ claimedReducedRate: false, dollarSales: 45, handle: 'ft9' });

    const context = mount(
      <Provider store={store}>
        <PromotionReducedRate />
      </Provider>);
    expect(context.find('p').last().text()).toBe('$45 / $1000');
  });

  test('Display claim when users has $1000 or more in sales', () => {
    store.setState({ claimedReducedRate: false, dollarSales: 1000, handle: 'ft9' });

    const context = mount(
      <Provider store={store}>
        <PromotionReducedRate />
      </Provider>);
    expect(context.find('button').text()).toBe('Claim');

    store.setState({ claimedReducedRate: false, dollarSales: 1001, handle: 'ft9' });
    context.mount();
    expect(context.find('button').text()).toBe('Claim');
  });

  test('Display reduced rate when user has claimed reduced rate', () => {
    store.setState({ claimedReducedRate: true, dollarSales: 1000, handle: 'ft9' });

    const context = mount(
      <Provider store={store}>
        <PromotionReducedRate />
      </Provider>);
    expect(context.find('p').text()).toBe('Your rate is now 0.08%');
  });
});

/* TODO: Display something when all claimed + personal email */
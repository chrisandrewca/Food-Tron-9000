import Api from '../api';
import { Component, h } from 'preact';
import { connect, Provider } from 'unistore/preact';
import createStore from 'unistore';
import devtools from 'unistore/devtools';
import { Route, Switch } from 'wouter-preact';
import { useEffect, useState } from 'preact/hooks';

import Home from '../routes/home';
import Pricing from '../routes/pricing';
import Start from '../routes/start';
import Share from '../routes/share';
import Dashboard from '../routes/dashboard';
import Profile from '../routes/profile';
import ProfileMenuItem from '../routes/profile/menu-item';
import ProfileCustomization from '../routes/profile/menu-item/customization';
import Order from '../routes/profile/order';
import Login from '../routes/login';
import Menu from '../routes/menu';
import MenuAdd from '../routes/menu/add';
import FreeAdsPromotion from '../routes/promotion/free-ads';
import FreeAdsThankYou from '../routes/promotion/free-ads/thank-you';
import Customization from '../routes/menu/add/customization';
import CustomizationPool from '../routes/menu/add/customization-pool';

import MenuActions from '../routes/menu/actions';
import MenuAddActions from '../routes/menu/add/actions';
import CustomizationActions from '../routes/menu/add/customization/actions';
import ProfileActions from '../routes/profile/actions';
import ProfileMenuItemActions from '../routes/profile/menu-item/actions';
import ProfileCustomizationActions from '../routes/profile/menu-item/customization/actions';
import OrderActions from '../routes/profile/order/actions';

const appActions = (store) => ({
	load() {
		devtools(store);
	}
});

const connected = (Component, loadState = async () => ({}), { authenticate = true } = {}) => {

	const connectedActions = (store) => ({
		async setComponentState(_, params) {

			const state = store.getState();
			const componentState = await loadState({ params, state });

			return componentState;
		},
		async setUserAppState() {

			// TODO this is all messed up!
			// Goals:
			// Only update state if user app state is somehow stale
			// Or we need to kick the user out

			const state = store.getState();
			const userAppState = await Api.getUserAppState();

			if (state
				&& state.version === userAppState.version) {

				return userAppState;
			} else {

				// Clear the store via load when the app version has changed
				store.action(appActions(store).load)();
				store.setState(userAppState);
			}
		}
	});

	const Connected = connect('', connectedActions)(({ params, setComponentState, setUserAppState }) => {

		const [authenticated, setAuthenticated] = useState(false);
		const [loading, setLoading] = useState(true);

		useEffect(() => {
			if (authenticate) {
				if (!authenticated) {
					Api.checkUserAuthenticated()
						.then(authenticated => {
							if (authenticated) {
								setAuthenticated(true);
							} else {
								// TODO router?
								window.location.href = '/login';
							}
						});
				} else {
					setUserAppState()
						.then(() => setComponentState(params))
						.then(() => setLoading(false));
				}
			}
		}, [authenticate, authenticated]);

		useEffect(() => {
			if (!authenticate) {
				setComponentState(params)
					.then(() => setLoading(false));
			}
		}, [authenticate]);

		return (
			loading
				? <p>Loading...</p>
				: <Component params={params} /> // TODO change to routeParams?
		);
	});

	return Connected;
};

class App extends Component {

	constructor() {
		super();
		this.state = {
			loading: true,
			store: createStore()
		};
	}

	componentDidMount() {

		/**
		 * Taking on a 2nd render here
		 * Goals:
		 * 1. Edit resources over multiple pages/urls
		 * 2. Avoid managing state of in-progress resource on server leading to simple 'set' API and easy validation
		 * 3. Support rare use cases where UI
		 *		a.) Cannot navigate using the history API
		 *		b.) Needs to maintain state during said navigation
		 * Assuming 3. holds true...(I may have just been using things wrong)
		 * We need to retrieve the state from local storage here which will issue a setState causing a second render
		 * TODO A mechanism to clear local storage when app is upgraded -- version?
		 */

		const { store } = this.state;

		Api.getAppVersion()
			.then(version => {
				devtools(store);

				this.storeUnsubscribe = store.subscribe((state) => {
					persistState(state);
				});

				retrieveState(version, state => {
					store.setState({
						...(state || {}),
						version
					});

					this.setState({ loading: false });
				}); // does this like uh not get run before paint?
			});
	}

	componentWillUnmount() {
		this.storeUnsubscribe();
	}

	render() {

		const { loading, store } = this.state;

		// TODO Goal: Render single newspaper loader while both App.js and Auth HoC manage some loading state
		// loading state from store... but then App.js needs to be a connected component
		if (loading) {
			return <p>Loading...</p>;
		}

		return (
			<Provider store={store}>
				<div id='app'>
					<Route path='/' component={Home} />
					<Route path='/pricing' component={Pricing} />

					<Route path='/start' component={Start} />
					<Route path='/share' component={connected(Share)} />
					<Route path='/dashboard' component={connected(Dashboard)} />

					<Route path='/menu' component={connected(
						connect('action', MenuActions)(Menu),
						async () => await MenuActions().initialize()
					)} />

					<Switch>
						<Route path='/menu/add' component={connected(
							connect('action', MenuAddActions)(MenuAdd),
							async ({ state }) => await MenuAddActions().load(state)
						)} />

						<Route path='/menu/:id' component={connected(
							connect('action', MenuAddActions)(MenuAdd),
							async ({ params, state }) => await MenuAddActions().load(state, params.id)
						)} />
					</Switch>

					<Route path='/menu/add/customization' component={connected(
						connect(['action', 'handle'], CustomizationActions)(Customization),
						async ({ state }) => await CustomizationActions().load(state)
					)} />

					<Route path='/menu/add/customization/:id' component={connected(
						connect(['action', 'handle'], CustomizationActions)(Customization),
						async ({ params, state }) => await CustomizationActions().load(state, params.id)
					)} />

					{/* <Route path='/menu/add/customizations' component={connected(CustomizationPool)} /> */}

					<Route path='/@:handle' component={connected(
						connect('action, order', ProfileActions)(Profile),
						async ({ params, state }) => ({
							...(OrderActions().load(state, params.handle)),
							...(await ProfileActions().load(state, params.handle))
						}),
						{ authenticate: false }
					)} />

					<Switch>
						<Route path='/@:handle/thanks'>
							{params => <Profile params={{ ...params, thanks: true }} />}
						</Route>

						<Route path='/@:handle/order' component={connected(
							connect('action, order', OrderActions)(Order),
							async ({ params, state }) => ({
								// do nothing for now
							}),
							{ authenticate: false }
						)} />

						{/* warning: route used in /profile/menu-item/customization */}
						<Route path='/@:handle/:menuItemId/customize/:customizationId' component={connected(
							connect('action', ProfileCustomizationActions)(ProfileCustomization),
							async ({ params, state }) => ({
								...(OrderActions().load(state, params.handle)),
								...(await ProfileCustomizationActions().load(state, params.customizationId))
							}),
							{ authenticate: false }
						)} />

						<Route path='/@:handle/:id' component={connected(
							connect('action', ProfileMenuItemActions)(ProfileMenuItem),
							async ({ params, state }) => ({
								...(OrderActions().load(state, params.handle)),
								...(await ProfileMenuItemActions().load(state, params.handle, params.id))
							}),
							{ authenticate: false }
						)} />
					</Switch>

					<Route path='/login/:sent?'>
						{params => <Login {...params} />}
					</Route>

					<Route path='/promotion/free-ads' component={connected(FreeAdsPromotion)} />
					<Route path='/promotion/free-ads/thank-you' component={connected(FreeAdsThankYou)} />
				</div>
			</Provider>
		);
	}
}

export default App;

// TODO error handling if indexedDB does not exist
const dbName = 'ft9';
const stateTableName = 'state';

const persistState = (state) => {
	const request = window.indexedDB.open(dbName, 1);
	request.onerror = (event) => {
		console.log('indexedDB', { event });
	};

	request.onupgradeneeded = (event) => {
		const db = event.target.result;
		db.createObjectStore(stateTableName, { keyPath: 'version' });
	};

	request.onsuccess = (event) => {
		const db = event.target.result;
		const transaction = db.transaction(stateTableName, 'readwrite');
		const table = transaction.objectStore(stateTableName);

		console.log('putting', state);
		table.put(state);

		transaction.oncomplete = () => {
			db.close();
		};
	};
};

// TODO error handling if table does not exist?
const retrieveState = (version, callback) => {
	const request = window.indexedDB.open(dbName, 1);
	request.onerror = (event) => {
		console.log('indexedDB', { event });
	};

	// TODO important code duped
	request.onupgradeneeded = (event) => {
		const db = event.target.result;
		db.createObjectStore(stateTableName, { keyPath: 'version' });
	};

	request.onsuccess = (event) => {
		const db = event.target.result;
		const transaction = db.transaction(stateTableName);
		const table = transaction.objectStore(stateTableName);

		const retrieval = table.get(version);
		retrieval.onerror = (event) => {
			console.log('indexedDB', { event });
		};

		retrieval.onsuccess = (event) => {
			const state = event.target.result;
			callback(state);
		};

		transaction.oncomplete = () => {
			db.close();
		};
	};
};
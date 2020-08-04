import { connect } from 'unistore/preact';
import DashboardHeader from '../../components/dashboard-header';
import { Fragment } from 'preact';
import Notice from '../../components/notice';
import StripeButton from '../../components/stripe-button';
import GameBar from '../../components/game-bar';

const Dashboard = connect('hasStripeInfo')(({ hasStripeInfo }) => {

	let paymentsLink = <p><a href='https://dashboard.stripe.com/payments' target='_blank' class='button'>Payments</a></p>;

	let emailLink =
		<Fragment>
			<Notice setting='showStripeEmailWarning' />
			<a href='https://dashboard.stripe.com/settings/emails' target='_blank' class='button'>Customer emails</a>
		</Fragment>;

	if (!hasStripeInfo) {
		paymentsLink =
			<Fragment>
				<p>The Food-Tron 9000 uses <i>Stripe</i> to collect payments and deposit them into your accounts.</p>
				<p><StripeButton /></p>
			</Fragment>;
		emailLink = null;
	}

	return (
		<main>
			<DashboardHeader />
			<GameBar />
			<h2>Dashboard</h2>
			{paymentsLink}
			{emailLink}
		</main>
	);
});

export default Dashboard;
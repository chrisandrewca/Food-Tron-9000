import { Link } from 'wouter-preact';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'preact/hooks';

const BuyButton = ({ handle, order }) => {

	const [pending, setPending] = useState(false);

	const handleBuy = async (e) => {
		e.preventDefault();

		const result = await fetch('/api/buy', {
			method: 'post',
			headers: {
				'content-type': 'application/json',
				'accept': 'application/json'
			},
			body: JSON.stringify({ ...order, handle }) // TODO nested or not
		});

		const checkout = await result.json();
		console.log(JSON.stringify(checkout, null, 2));

		if (checkout.isUserAccount) {
			const stripe = await loadStripe(
				process.env.STRIPE_PUBLIC_KEY,
				{ stripeAccount: checkout.stripeAccount }
			);
			const { error } = await stripe.redirectToCheckout({
				sessionId: checkout.sessionId
			});
			// If `redirectToCheckout` fails due to a browser or network
			// error, display the localized error message to your customer
			// using `error.message`.
		} else {
			if (pending) {
				const stripe = await loadStripe(
					process.env.STRIPE_PUBLIC_KEY,
					{ stripeAccount: checkout.stripeAccount }
				);
				const { error } = await stripe.redirectToCheckout({
					sessionId: checkout.sessionId
				});
			} else {
				setPending(true);
			}
		}
	};

	return (
		<Fragment>
			{pending ?
				<p><a href='#'>@{handle}</a> has yet to begin collecting payments. We'll let them know you're hungry! Tap buy again to experience a test checkout.</p> : null}
			<Link className='button-inverse' href='#' onClick={handleBuy}>Buy now!</Link>
		</Fragment>
	);
};

export default BuyButton;
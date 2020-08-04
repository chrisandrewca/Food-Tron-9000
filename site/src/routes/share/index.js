import { connect } from 'unistore/preact';
import { Link } from 'wouter-preact';
import style from './style';
import { useEffect, useState } from 'preact/hooks';
import Api from '../../api';

const Share = connect('handle')(({ handle }) => {

	const [product, setProduct] = useState({});

	useEffect(() => {
		Api.getProfile(handle)
			.then(menuItems => setProduct(menuItems[0]));
	}, []);

	return (
		<main>
			<header>
				<h1>Food-Tron 9000</h1>
			</header>

			<p>Time to fire it up! Share this link to get selling.</p>

			<div class={style.share}>
				{product.name ?
					<a href={`/@${handle}`} target='_blank'>@{handle}/{product.name}</a> : null}
			</div>

			<p>You'll receive an email when a customer places an order.</p>

			<p>Add account details to <Link href='/dashboard' preload={true}>begin collecting payments.</Link></p>
		</main>
	);
});

export default Share;
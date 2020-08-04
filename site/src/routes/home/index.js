import GameBar from '../../components/game-bar';
import { Link } from 'wouter-preact';
import Nav from '../../components/nav';
import style from './style';

const Home = () => (
	<main class={style.main}>
		<Nav />

		<header>
			<h1>Food-Tron 9000</h1>
		</header>

		<h2>The easiest way to share your food online</h2>
		<ol>
			<li>Snap a picture of your menu item</li>
			<li>Get a link to share</li>
			<li>Begin receiving orders and collecting payments</li>
		</ol>

		<div class={style.buttons} style={{ marginBottom: '2rem' }}>
			<Link className='button-inverse' href='/start' preload>Start now</Link>
			<a className='button' href={`mailto:${process.env.EMAIL}?subject=Hey%20FT9...`}>Contact</a>
		</div>

		<GameBar defaultCursor={0} />
	</main>
);

export default Home;
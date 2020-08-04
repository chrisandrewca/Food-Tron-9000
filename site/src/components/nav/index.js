import { h } from 'preact';
import { Link } from 'wouter-preact';
import style from './style.css';

const Nav = () => (
	<nav class={style.nav}>
		<Link activeClassName={style.active} href='/'>Home</Link>&nbsp;
		<Link activeClassName={style.active} href='/pricing'>Pricing</Link>&nbsp;
		<Link activeClassName={style.active} href='/dashboard'>Dashboard</Link>
	</nav>
);

export default Nav;
import { h } from 'preact';
import { connect } from 'unistore/preact';
import { Link } from 'wouter-preact';
import style from './style.css';

const DashboardNav = connect('handle')(({ handle }) => (
	<nav class={style.nav}>
		{/* <Link activeClassName={style.active} href='/orders'>Orders</Link>&nbsp; */}
		<Link activeClassName={style.active} href='/menu'>Menu</Link>&nbsp;
		{/* <Link activeClassName={style.active} href='/settings'>Settings</Link> */}
		<a href={`/@${handle}`} target='_blank'>&#64;{handle}</a>&nbsp;
		<a href={`mailto:${process.env.EMAIL}?subject=Hey%20FT9...`}>Support</a>
		<Link activeClassName={style.active} href='/dashboard'>Dashboard</Link>
	</nav>
));

export default DashboardNav;
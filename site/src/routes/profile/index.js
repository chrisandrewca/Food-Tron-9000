import BuyButton from '../../components/buy-button';
import cx from 'classnames';
import { Link } from 'wouter-preact';
import MenuItemPreview from '../../components/menu-item-preview';
import style from './style';
import Thanks from '../../components/thanks';

const Profile = ({ action, order, params }) => {

	const { menuItems } = action.profile;
	const { handle, thanks } = params;

	let page = (
		<main class={style.profile}>
			<header>
				<h1>@{handle}</h1>
				{!!order.menuItems.length && <BuyButton handle={handle} order={order} />}
			</header>
			<ul>
				{menuItems.map(menuItem => (
					<li>
						<MenuItemPreview item={menuItem}>
							<Link
								class={cx('button')}
								href={`/@${handle}/${menuItem.id}`} // TODO menu item name
							>
								Order
								</Link>
						</MenuItemPreview>
					</li>
				))}
			</ul>
		</main>
	);

	if (thanks) {
		page = (
			<main class={style.profile}>
				<header>
					<h1>@{handle}</h1>
				</header>
				<Thanks handle={handle} />
			</main>
		);
	}

	return page;
}

export default Profile;
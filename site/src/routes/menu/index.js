import cx from 'classnames';
import DashboardHeader from '../../components/dashboard-header';
import { h } from 'preact';
import MenuItemPreview from '../../components/menu-item-preview';
import { Link, useLocation } from 'wouter-preact';
import style from './style';
import '../../style/signup-form';
import { useCallback } from 'preact/hooks';

const Menu = ({ action }) => {
	const [, setLocation] = useLocation();

	const handleEdit = useCallback(async (e) => {
		e.preventDefault();
		setLocation(`/menu/${e.currentTarget.id}`);
	}, []);

	const { menuItems } = action;

	return (
		<main class={style.menu}>
			<DashboardHeader />
			<h2>Menu</h2>
			<Link className='button' href='/menu/add' preload>Add menu item</Link>
			<section class={style.menuItems}>
				{menuItems.map(menuItem => (
					<a
						id={menuItem.id}
						class={cx('button')}
						href={`/menu/${menuItem.id}`}
						onClick={handleEdit}
					>
						<MenuItemPreview item={menuItem} />
					</a>
				))}
			</section>
		</main>
	);
};

export default Menu;
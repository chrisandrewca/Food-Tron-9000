import CustomizationThumbnail from '../../../../components/customization-thumbnail';
import { connect } from 'unistore/preact';
import cx from 'classnames';
import DashboardHeader from '../../../../components/dashboard-header';
import { Link } from 'wouter-preact';
import style from './style';
import styleSignupForm from '../../../../style/signup-form';
import { useLocation } from 'wouter-preact';

const CustomizationPool = connect('menuAction')(({ menuAction }) => {
  const { customizations } = menuAction;
  const [, setLocation] = useLocation();

  const handleClick = (customization) => {
    setLocation(`/menu/add/customization/${customization.id}`);
  };

  return (
    <main>
      <DashboardHeader />
      <section>
        <h2 style={{ textAlign: 'center' }}>Customizations</h2>
        <div class={style.customizations}>
          {customizations.map(customization => <CustomizationThumbnail customization={customization} onClick={handleClick} />)}
          <Link class={cx('button', style.add)} href='/menu/add/customization' preload>&#65291;</Link>
        </div>
      </section>
    </main>
  );
});

export default CustomizationPool;
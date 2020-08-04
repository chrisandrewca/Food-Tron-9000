import cx from 'classnames';
import style from './style';

const CustomizationThumbnail = ({ customization, onClick }) => {

  const handleClick = () => {
    onClick(customization);
  };

  return (
    <div class={cx('button', style.customization)} onClick={handleClick}>
      <img class={style.background} src={customization.photos[0].src} />
      <span>{customization.name}</span>
    </div>
  );
}

export default CustomizationThumbnail;
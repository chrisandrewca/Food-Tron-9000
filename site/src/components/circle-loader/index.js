import cx from 'classnames';
import style from './style';

const CircleLoader = (props) => {
  return (
    <div class={cx(style.loader, props.class)}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

export default CircleLoader;
import CircleLoader from '../circle-loader';
import cx from 'classnames';
import style from './style';

const SaveButton = (props) => {
  const {
    loading: {
      loading,
      saveLoading
    },
    children,
    ...buttonProps
  } = props;

  return (
    <button
      disabled={loading}
      {...buttonProps}
      class={cx('button-inverse', { 'button-loading': loading }, buttonProps.class)}
    >
      {loading && saveLoading
        ?
        <Fragment>
          <CircleLoader class={style.loaderButton} />
          <span>{children}</span>
        </Fragment>
        : children}
    </button >
  );
};

export default SaveButton;
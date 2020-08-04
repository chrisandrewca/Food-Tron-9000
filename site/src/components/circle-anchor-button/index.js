import CircleLoader from '../circle-loader';
import cx from 'classnames';
import { Fragment } from 'preact';
import style from './style';
import { useLocation } from 'wouter-preact';

const CircleAnchorButton = ({
  href,
  icon,
  loading: {
    loading,
    actionLoading
  },
  ...anchorProps
}) => {

  anchorProps.class = cx(style.add, anchorProps.class);

  const _onClick = anchorProps.onClick
    ? anchorProps.onClick
    : () => { };

  const [, setLocation] = useLocation();

  const onClick = loading ?
    (e) => {
      e.preventDefault();
      _onClick(e);
    } :
    (e) => {
      if (href) {
        setLocation(href);
      }
      _onClick(e);
    };

  delete anchorProps.onClick;

  icon =
    <div style={{ fontSize: '1.8rem', textAlign: 'center' }}>
      {icon}
    </div>;

  const content = loading && actionLoading
    ?
    <Fragment>
      <CircleLoader class={style.loaderLink} />
      <span style={{ visibility: 'hidden' }}>
        {icon}
      </span>
    </Fragment>
    :
    <Fragment>
      {icon}
    </Fragment>;

  return (
    <a
      {...anchorProps}
      onClick={onClick}
    >
      {content}
    </a>
  );
};

export default CircleAnchorButton;
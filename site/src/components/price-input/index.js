import cx from 'classnames';
import style from './style';
import { useCallback, useState } from 'preact/hooks';

const PriceInput = ({ children, onChange, ...inputProps }) => {

  const [focus, setFocus] = useState(false);
  const handleFocus = useCallback((e) => {
    setFocus(focus => {
      if (!focus === false) {
        onChange(e);
      }
      return !focus;
    });
  }, [onChange]);

  const _class = cx(
    style.price,
    inputProps.class,
    { 'focus-outline': focus });
  const _style = inputProps.style;
  delete inputProps.class;
  delete inputProps.className;
  delete inputProps.style;

  return (
    <div
      id='price'
      class={_class}
      style={_style}
    >
      <input
        className='without-focus'
        type='text'
        pattern='\$?\d{1,6}.\d\d'
        inputmode='decimal'
        onBlur={handleFocus}
        onFocus={handleFocus}
        {...inputProps} />
      {children}
    </div>
  );
}

export default PriceInput;
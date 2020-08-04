import cx from 'classnames';
import { h } from 'preact';
import FieldError from '../field-error';
import style from './style';
import { useCallback, useState } from 'preact/hooks';
import useOuterClick from '../use-outer-click';
import PriceInput from '../price-input';

const OptionMenu = ({ state, onClick }) => {

  const [showMenu, setShowMenu] = useState(false);
  const [buttonRef, menuRef] = useOuterClick((e) => {
    setShowMenu(false);
  });

  const handleClick = useCallback(() => {
    if (state === 'add') {
      onClick({ state });
    } else {
      setShowMenu(show => !show);
    }
  }, [state]);

  const handleMenuClick = useCallback((e) => {
    const { dataset } = e.target;
    if (!dataset || !dataset.item) {
      // spamming will sometimes click through to <ul>
      // so ignore the click and force the user to tap again
      return;
    }
    onClick({ state, item: dataset.item });
    setShowMenu(false);
  }, [state]);

  const icon = state === 'add'
    ? String.fromCharCode(0xFF0B)
    : String.fromCharCode(0x2630);

  return (
    <div class={style.menuContainer}>
      <button
        class={cx('button', 'button-small', style.addOption)}
        onClick={handleClick}
        ref={buttonRef}
      >
        {icon}
      </button>
      <ul
        class={cx(style.menu, {
          [style.menuShow]: showMenu
        })}
        onClick={handleMenuClick}
        ref={menuRef}
      >
        <li data-item='remove'>Remove</li>
        <li data-item='add'>Add choice</li>
      </ul>
    </div>
  );
};

const OptionField = ({ option, onMenuClick, onOptionChange }) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    onOptionChange(name, value);
  }, []);

  const { fields: { name = {}, price = {} } } = option;
  const form = option.menuState === 'choose'
    ?
    <>
      <input
        name='name'
        class={cx(style.optionValue, name.errClass)}
        type='text'
        placeholder='Name'
        value={name.value}
        onChange={handleChange}
      />
      <PriceInput
        name='price'
        class={cx(style.optionPrice, price.errClass)}
        type='text'
        placeholder='Price'
        value={price.value}
        onChange={handleChange}
      />
    </>
    : null;

  return (
    <>
      <div class={style.optionField}>
        <OptionMenu
          state={option.menuState}
          onClick={onMenuClick}
        />
        {form}
      </div>
      <FieldError
        style={{ marginLeft: '57px' }}
        err={form && (name.err || price.err)}
      />
    </>
  );
};

const Option = ({ children, ...props }) =>
  <div class={style.option}>
    <OptionField {...props} />
    {children}
  </div>;

const OptionTree = ({ options, onMenuClick, onOptionChange }) => {

  const copyAndClimb = useCallback((payload, { option, options, activeOption, activeOptions }, handler) => {
    // copy the tier
    option = { ...option };
    options = [...options];
    options[
      options.findIndex(
        o => o.id === option.id)] = option;

    // save refs to the active tier
    if (!activeOption) {
      activeOption = option;
      activeOptions = options;
    }

    if (!option.parent) {
      return handler(payload, {
        option: activeOption,
        options: activeOptions,
        root: option
      });
    }

    // reference the next tier up
    // 1. when option.parent is null climbTier isn't called since were at the root []
    // 2. when option.parent.parent is null, options is copied by copyTier
    // but not merged into to this tree we're building because ... 1. / substituting parent for the option
    const tier = option.parent.parent
      ? option.parent.parent.options
      : []; // options is later copied but not merged

    // step up a tier by substituting our parent as the option in the handler
    option = option.parent;
    option.options = options;

    // call the recursive handler set in the inner OptionTree onMenuClick below
    handler(payload, {
      option,
      options: tier,
      activeOption,
      activeOptions
    }, handler);
  }, []);

  const handleMenuClick = useCallback((payload, tier) => {
    copyAndClimb(payload, tier, onMenuClick);
  }, []);

  const handleOptionChange = useCallback((payload, tier) => {
    copyAndClimb(payload, tier, onOptionChange);
  }, []);

  return (
    <>
      {options.map(option =>
        <Option
          key={option.id}
          option={option}
          onMenuClick={(menuState) => handleMenuClick({ menuState }, { option, options })}
          onOptionChange={(name, value) => handleOptionChange({ name, value }, { option, options })}
        >
          {option.options.length > 0 &&
            <OptionTree
              options={option.options}
              onMenuClick={handleMenuClick}
              onOptionChange={handleOptionChange}
            />}
        </Option>
      )}
    </>
  );
};

export default OptionTree;
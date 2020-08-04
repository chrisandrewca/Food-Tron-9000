import style from './style';

const CurrencySelect = ({ onChange }) => (
  <span class={style.currency}>
    <select name='currency' onChange={onChange}>
      <option value='usd'>USD</option>
      <option value='cad'>CAD</option>
    </select>
  </span>
);

export default CurrencySelect;
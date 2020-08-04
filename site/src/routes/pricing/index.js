import { Link } from 'wouter-preact';
import Nav from '../../components/nav';
import formStyle from '../../style/signup-form'
import style from './style';
import { toCurrencyString } from '../../forms';
import { useState } from 'preact/hooks';

const Pricing = () => {

  const [itemPrice, setItemPrice] = useState(toCurrencyString(15));
  const [profit, setProfit] = useState(toCurrencyString(calcProfit(15)));

  const [ticks] = useState([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]);
  const [tickDex, setTickDex] = useState(2);

  const handleProfitInput = (e) => {
    const tickDex = parseInt(e.target.value);
    const itemPrice = ticks[tickDex];
    setItemPrice(toCurrencyString(itemPrice));
    setProfit(toCurrencyString(calcProfit(itemPrice)));
    setTickDex(tickDex);
  };

  return (
    <main style={{ textAlign: 'center' }}>
      <Nav />

      <header>
        <h1>Food-Tron 9000</h1>
      </header>
      <article style={{ textAlign: 'center' }}>
        <h2>We get paid when you get paid</h2>
        <p>The Food-Tron 9000 has no up front cost.</p>
        <p>We collect 11% of each sale. Our payment provider, <i>Stripe</i>, collects 2.9% + 0.30c.</p>

        <div class={style.calculator}>
          {/* TODO later textbox so customer can evaluate a rice or use to create pricing*/}
          <label>
            Profit calculator
            <span>Your sale: <span>{itemPrice}</span></span>
            <span>Your profit: <span>{profit}</span></span>
            <input
              type='range'
              min='0'
              max='19'
              step='1'
              list='ticks'
              value={tickDex}
              onInput={handleProfitInput} />
            <datalist id='ticks'>
              <option>0</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
              <option>11</option>
              <option>12</option>
              <option>13</option>
              <option>14</option>
              <option>15</option>
              <option>16</option>
              <option>17</option>
              <option>18</option>
              <option>19</option>
            </datalist>
          </label>
        </div>

        <Link
          href='/start'
          className='button-inverse'
          preload>
          Start Now
        </Link>
      </article>
    </main>
  );
}

const calcProfit = (price) => {
  const stripeAmt = (price * 0.029) + 0.3;
  const ft9Amt = (price * 0.11);
  const profit = price - stripeAmt - ft9Amt;
  return profit;
}

export default Pricing;
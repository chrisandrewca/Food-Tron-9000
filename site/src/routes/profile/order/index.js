import BuyButton from '../../../components/buy-button';
import { h } from 'preact';

const Order = ({ action, order, params: { handle } }) => {
  return (
    <div>
      <pre>{handle} {JSON.stringify(order, null, 2)}</pre>
      <BuyButton handle={handle} order={order} />
    </div>
  );
};

export default Order;
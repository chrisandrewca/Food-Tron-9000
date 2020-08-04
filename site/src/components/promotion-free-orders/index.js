import { connect } from 'unistore/preact';
import { Fragment, h } from 'preact';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Reward from 'react-rewards';
import StripeButton from '../stripe-button';
import { useEffect, useRef, useState } from 'preact/hooks';

const actions = (store) => ({
  async claimFreeOrders(state) {
    const result = await fetch('/api/promotion', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        id: 'free-orders'
      })
    });

    const { claimedPromotion } = await result.json();
    store.setState({ ...state, claimedFreeOrders: claimedPromotion });
  }
});

const PromotionFreeOrders = connect('claimedFreeOrders, hasStripeInfo, id, orderCount', actions)(({ claimedFreeOrders, claimFreeOrders, hasStripeInfo, id, orderCount }) => {

  const [claiming, setClaiming] = useState(false);
  const [showLoader, setLoader] = useState(false);
  const loaderTimeout = 1200;
  const reward = useRef(null);
  const onClaim = () => {
    setLoader(true);
    setTimeout(() => {
      setClaiming(true);
      setLoader(false);
    }, loaderTimeout);
  };

  useEffect(() => {
    if (claiming) {
      claimFreeOrders()
        .then(() => {
          // TODO path for claimFreeOrders === false
          reward.current.rewardMe();
          setClaiming(false);
        });
    }
  }, [claiming]);

  return (
    <div className='carousel-card-inner'>
      <div className='carousel-title'>25 Free Orders</div>
      <div className='carousel-text'>
        {
          claimedFreeOrders
            ?
            <Reward
              ref={reward}
              type='confetti'
            >
              <h2 style={{ color: 'green' }}>{orderCount}/25</h2>
              <p>free orders used</p>
            </Reward>
            : hasStripeInfo
              ?
              <Fragment>
                <p>Thanks for signing up!</p>
                <button style={{ width: '5.5rem', height: '2.2rem' }} className='button-claim button-small' onClick={onClaim}>
                  {showLoader ? <Loader type='TailSpin' color='#673AB7' height='25' width='25' timeout={loaderTimeout} /> : 'Claim'}
                </button>
              </Fragment>
              :
              <Fragment>
                <p>When you signup for Stripe to get paid</p>
                <StripeButton promotion userId={id} />
              </Fragment>
        }
      </div>
    </div>
  );
});

export default PromotionFreeOrders;
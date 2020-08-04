import { connect } from 'unistore/preact';
import { Fragment, h } from 'preact';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Reward from 'react-rewards';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useLocation } from 'wouter-preact';
import useWebShare from 'react-use-web-share';

const actions = (store) => ({
  async claimReducedRate(state) {
    const result = await fetch('/api/promotion', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        id: 'reduced-rate'
      })
    });

    const { claimedPromotion } = await result.json();
    store.setState({ ...state, claimedReducedRate: claimedPromotion });
  }
});

const PromotionReducedRate = connect('claimedReducedRate, dollarSales, handle, id', actions)(({ claimedReducedRate, claimReducedRate, dollarSales, handle, id }) => {

  const [, setLocation] = useLocation();

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
      claimReducedRate()
        .then(() => {
          // TODO path for claimReducedRate === false
          reward.current.rewardMe();
          setClaiming(false);
        });
    }
  }, [claiming]);

  const { loading, isSupported, share } = useWebShare();

  const handleShare = () => {
    if (!id) {
      try {
        share({
          title: `@${handle}`,
          text: 'Place an order',
          url: `https://foodtron9000.com/@${handle}`
        });
      } catch { }
    } else {
      setLocation('/start');
    }
  };

  return (
    <div className='carousel-card-inner'>
      <div className='carousel-title'>Reduced rate</div>
      <div className='carousel-text'>
        {
          claimedReducedRate
            ?
            <Reward
              ref={reward}
              type='confetti'
            >
              <p style={{ color: 'green' }}>Your rate is now 0.08%</p>
            </Reward>
            : dollarSales >= 1000
              ?
              <Fragment>
                <p>Congratulations! You've surpassed $1000 in sales.</p>
                <button style={{ width: '5.5rem', height: '2.2rem' }} className='button-claim button-small' onClick={onClaim}>
                  {showLoader ? <Loader type='TailSpin' color='#673AB7' height='25' width='25' timeout={loaderTimeout} /> : 'Claim'}
                </button>
              </Fragment>
              :
              <Fragment>
                <p>0.08% after $1000 in sales</p>
                {dollarSales > 0
                  ? <p style={{ color: 'green' }}>${dollarSales} / $1000</p>
                  :
                  <button className='button button-small' onClick={handleShare}>Share menu</button>}
              </Fragment>
        }
      </div>
    </div>
  );
});

export default PromotionReducedRate;
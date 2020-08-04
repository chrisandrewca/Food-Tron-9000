import { connect } from 'unistore/preact';
import { Fragment, h } from 'preact';
import Loader from 'react-loader-spinner';
import Reward from 'react-rewards';
import { useRef, useState } from 'preact/hooks';
import { Link, Redirect, useLocation } from 'wouter-preact';

const PromotionAds = connect('adCampaignStatus, claimedAds, id, menuItemCount')(({ adCampaignStatus, claimedAds, id, menuItemCount }) => {

  const [claimMock, setClaimMock] = useState(claimedAds);
  const [, setLocation] = useLocation();

  const [showLoader, setLoader] = useState(false);
  const loaderTimeout = 2000;
  const reward = useRef(null);
  const onClaim = () => {
    reward.current.rewardMe();
    setLoader(true);
    setTimeout(() => {
      setLoader(false);
      setClaimMock(true);
    }, loaderTimeout);
  };

  const createLoc = !id
    ? '/menu/add'
    : '/start';

  return (
    <div className='carousel-card-inner'>
      <div className='carousel-title'>$5 in Ads</div>
      <div className='carousel-text'>
        {
          claimMock
            ? adCampaignStatus === 'Pending'
              ?
              <Redirect to={'/promotion/free-ads'} />
              :
              adCampaignStatus === 'In-Progress'
                ? <p style={{ color: 'green' }}>We're creating your ad campaign now. You'll receive an update within a day or so.</p>
                : <p style={{ color: 'green' }}>Your ad campaign is running.</p>
            : menuItemCount >= 5
              ?
              <Reward
                ref={reward}
                type='confetti'>
                <p>Your menu is ready! Let's get you promoted.</p>
                <button style={{ width: '5.5rem', height: '2.2rem' }} className='button-claim button-small' onClick={onClaim}>
                  {showLoader ? <Loader type='TailSpin' color='#673AB7' height='25' width='25' timeout={loaderTimeout} /> : 'Claim'}
                </button>
              </Reward>
              :
              menuItemCount > 0
                ?
                <Fragment>
                  <h2 style={{ color: 'green' }}>{menuItemCount}/5</h2>
                  <p>FREE Facebook ads when you create 5 <Link href='/menu' preload>menu</Link> items</p>
                </Fragment>
                :
                <Fragment>
                  <p>FREE Facebook ads when you create 5 menu items</p>
                  <button className='button button-small' onClick={() => setLocation(createLoc)}>Create</button>
                </Fragment>
        }
      </div>
    </div>
  );
});

export default PromotionAds;
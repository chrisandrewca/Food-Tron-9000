import Carousel from '../carousel';
import PromotionAds from '../promotion-ads';
import PromotionFreeOrders from '../promotion-free-orders';
import PromotionReducedRate from '../promotion-reduced-rate';
import styleCarousel from '../../style/carousel';

const GameBar = ({ defaultCursor }) => {

  const promotions = [
    <PromotionFreeOrders />,
    <PromotionReducedRate />
  ];

  return (
    <Carousel
      components={promotions}
      defaultCursor={defaultCursor}
    />
  );
}

export default GameBar;
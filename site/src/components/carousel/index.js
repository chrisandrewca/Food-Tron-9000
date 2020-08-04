import cx from 'classnames';
import NonPassiveTouchTarget from '../non-passive-touch-target';
import TouchCarousel, { clamp } from 'react-touch-carousel';
import touchWithMouseHOC from 'react-touch-carousel/lib/touchWithMouseHOC';
import styleCarousel from '../../style/carousel';

const Carousel = ({ components, cardSize = 200, defaultCursor = 0, handleTapCard = () => { }, modal = null }) => {

  // TODO via props
  //const cardSize = 200;
  const CarouselContainer = (props) => {

    const cardPadCount = 0; // enableLoop ? component.length : 0
    const carouselWidth = clamp(window.innerWidth, 0, 430); // 430 is from index.css
    const { cursor, carouselState: { active, dragging }, ...rest } = props
    let current = -Math.round(cursor) % components.length;
    while (current < 0) {
      current += components.length;
    }
    // Put current card at center
    const translateX = (cursor - cardPadCount) * cardSize + (carouselWidth - cardSize) / 2;
    return (
      <NonPassiveTouchTarget
        className={cx(
          'carousel-container',
          {
            'is-active': active,
            'is-dragging': dragging
          }
        )}
      >
        {modal ?
          <NonPassiveTouchTarget>
            {modal}
          </NonPassiveTouchTarget>
          : null}

        <NonPassiveTouchTarget
          className='carousel-track'
          style={{ transform: `translate3d(${translateX}px, 0, 0)` }}
          {...rest} />

        <div className='carousel-pagination-wrapper'>
          <ol className='carousel-pagination'>
            {components.map((_, index) => (
              <li
                key={index}
                className={current === index ? 'current' : ''}
              />
            ))}
          </ol>
        </div>
      </NonPassiveTouchTarget>
    )
  };

  const Container = touchWithMouseHOC(CarouselContainer);

  const renderCard = (index, modIndex) => {
    const item = components[modIndex];
    return (
      <div
        key={index}
        className='carousel-card'
        onClick={() => handleTapCard(modIndex)}
      >
        {item}
      </div>
    );
  }

  return (
    <TouchCarousel
      component={Container}
      cardSize={cardSize}
      cardCount={components.length}
      cardPadCount={0}
      defaultCursor={defaultCursor}
      loop={false}
      autoplay={false}
      renderCard={renderCard}
    />
  );
}

export default Carousel;
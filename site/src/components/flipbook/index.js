import Carousel from '../carousel';
import { h } from 'preact';
import style from './style';

const Flipbook = () => {

  const thumbnails = [
    { src: '/api/photos/Snap.gif', text: 'Snap a picture of your menu item' },
    { src: '/api/photos/GetLink.png', text: 'Get a link to share' }
  ].map(page =>
    <div style={{
      borderRadius: '4px',
      cursor: 'pointer',
      boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
      objectFit: 'contain',
      //maxHeight: '254px',
      //smaxWidth: '190px'
    }}>
      <img src={page.src} />
      <p>{page.text}</p>
    </div>);

  return (
    <Carousel
      cardSize={300}
      components={thumbnails}
    />
  );
};

export default Flipbook;
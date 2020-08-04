import Carousel from '../carousel';
import { connect } from 'unistore/preact';
import { h } from 'preact';
import Modal from 'react-modal';
import style from './style';
import { useState } from 'preact/hooks';

const PhotoModal = ({ component, onClose }) => {
  return (
    <Modal
      bodyOpenClassName={style.body}
      className={style.content}
      isOpen={true}
      onRequestClose={onClose}
      overlayClassName={style.overlay}>
      {component}
    </Modal>
  );
};

const StoryBoard = ({ onClose, onDelete, photo, handle }) => {

  const handleDelete = () => {
    if (confirm('Are you sure?')) {
      onDelete(photo);
    }
  };

  return (
    <div class={style.storyBoard}>
      <div class={style.toolBar}>
        <button className='button' onClick={onClose}>Close</button>
        {handle && !photo.placeholder && onDelete ? // TODO this should be 'displayDelete' and should be calculated and managed by a business logic / state layer, scoped for this component!
          <button className='button-destroy' onClick={handleDelete}>Delete</button>
          : null}
      </div>
      <img src={photo.src} />
    </div>
  );
};

const PhotoCarousel = connect('handle')(({ handle, onDelete, photos, onBigPictureMode = () => { } }) => {

  const [tappedIndex, setTappedIndex] = useState(-1);
  const [showModal, setShowModal] = useState(false);

  const handleTap = (index) => {
    setTappedIndex(index);
    setShowModal(true);
    onBigPictureMode(true);
  };

  const handleTapClose = () => {
    setTappedIndex(-1);
    setShowModal(false);
    onBigPictureMode(false);
  };

  const handleTapDelete = (path) => {
    handleTapClose();
    onDelete(path);
  };

  const thumbnails = photos.map(photo =>
    <img src={photo.src} style={{
      borderRadius: '4px',
      cursor: 'pointer',
      boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
      objectFit: 'contain',
      maxHeight: '254px',
      maxWidth: '190px'
    }} />);

  const modal = showModal ?
    <PhotoModal
      component={<StoryBoard
        onClose={handleTapClose}
        onDelete={onDelete ? handleTapDelete : null}
        photo={photos[tappedIndex]}
        handle={handle} />}
      handleClose={handleTapClose} />
    : null;

  return (
    <Carousel
      components={thumbnails}
      handleTapCard={handleTap}
      modal={modal}
    />
  );
});

export default PhotoCarousel;
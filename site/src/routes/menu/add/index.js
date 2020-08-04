import CircleAnchorButton from '../../../components/circle-anchor-button';
import cx from 'classnames';
import CustomizationThumbnail from '../../../components/customization-thumbnail';
import DashboardHeader from '../../../components/dashboard-header';
import FieldError from '../../../components/field-error';
import { h } from 'preact';
import htmlIcons from '../../../components/html-icons';
import { Link, useLocation } from 'wouter-preact';
import PhotoCarousel from '../../../components/photo-carousel';
import PriceInput from '../../../components/price-input';
import SaveButton from '../../../components/save-button';
import style from './style';
import { useCallback, useState } from 'preact/hooks';

const MenuAdd = ({
  action,
  menuItemCount,
  addPhotos,
  removePhoto,
  save,
  remove,
  onChange,
  onSubmit
}) => {

  const { menuItem } = action;
  const { data, fields, prices } = menuItem;
  const { customizations } = data;

  const [loading, _setLoading] = useState({
    loading: false,
    photosLoading: false,
    saveLoading: false,
    removeLoading: false
  });

  const setLoading = useCallback((props) => {
    let isLoading = false;
    for (const key of Object.keys(props)) {
      if (props[key] === true) {
        isLoading = true;
      }
    }

    _setLoading(loading => ({
      ...loading,
      loading: isLoading,
      ...props
    }));
  }, []);

  const handleAddPhoto = useCallback(async (e) => {
    setLoading({ photosLoading: true });
    await addPhotos(e.target.files);
    setLoading({ photosLoading: false });
  }, []);

  const handleRemovePhoto = useCallback(async (photo) => {
    await removePhoto(photo.src);
  }, []);

  const handleOnChange = useCallback((e) => {
    const { name, value } = e.target;
    onChange(name, value);
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading({ saveLoading: true });
    await onSubmit(async ({ hasError }) => {
      if (hasError) {
        setLoading({ saveLoading: false });
      } else {
        await save();
        setLocation('/menu');
      }
    });
  }, []);

  const handleDelete = useCallback(async () => {
    setLoading({ removeLoading: true });
    await remove();
    setLocation('/menu');
  }, []);

  const [inBigPicMode, setInBigPicMode] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const handleBigPictureMode = useCallback((inMode) => {
    setInBigPicMode(inMode);
    setShowExamples(false);
  }, []);

  const handleExampleClick = useCallback(() => {
    setShowExamples(showExamples => !showExamples);
  }, []);

  const [, setLocation] = useLocation();
  const handleCustomizationClick = useCallback((customization) => {
    if (!loading.loading) {
      const url = customization.id
        ? `/menu/add/customization/${customization.id}`
        : '/menu/add/customization';
      setLocation(url);
    }
  }, [loading]);

  const handleBack = useCallback(() => {
    setLocation('/menu');
  }, []);

  return (
    <main>
      <DashboardHeader />
      <section>
        <h2 style={{ textAlign: 'center' }}>
          Menu Item
          {menuItemCount < 5 && data.photos[0].placeholder ?
            <span>
              <button
                class={cx('button', 'button-small', style.showExamples, {
                  [style.animateCauldron]: !showExamples,
                  [style.hide]: inBigPicMode
                })}
                onClick={handleExampleClick}
              >
                Show me a sample
              </button>
              <ul class={cx({
                [style.showSelectExample]: showExamples,
                [style.hide]: !showExamples
              })}>
                <li>Pizza</li>
                <li>Burger Combo</li>
              </ul>
            </span>
            : null}
        </h2>
        <div className='form'>
          <div class={style.photoCarousel}>
            <PhotoCarousel
              onBigPictureMode={handleBigPictureMode}
              onDelete={handleRemovePhoto}
              photos={data.photos}
            />
            <label>
              <CircleAnchorButton
                class={cx('button', style.addPhoto, {
                  [style.disabledAdd]: loading.loading && !loading.photosLoading
                })}
                icon={htmlIcons.cameraWithFlash()}
                loading={{
                  ...loading,
                  actionLoading: loading.photosLoading
                }}
                tabIndex='0'
              />
              <span>
                <input
                  disabled={loading.loading}
                  onChange={handleAddPhoto}
                  type='file'
                  name='photo'
                  accept='image/*'
                  tabIndex='-1'
                  multiple
                  value=''
                />
              </span>
            </label>
          </div>
          <div style={{ textAlign: 'center', marginTop: '-0.5rem' }}>
            <FieldError err={fields.photos.err} />
          </div>

          <div>
            <div>
              <label>
                Menu item
                <input
                  class={cx('input-top', fields.name.errClass)}
                  name='name'
                  type='text'
                  placeholder='Name'
                  value={fields.name.value}
                  onChange={handleOnChange} />
              </label>
              <textarea
                class={cx('input-middle', fields.description.errClass)}
                name='description'
                type='text'
                placeholder='Description'
                value={fields.description.value}
                onChange={handleOnChange} />
              {!prices.length ?
                <PriceInput
                  class={cx('input-bottom', fields.price.errClass)}
                  name='price'
                  placeholder='Price'
                  value={fields.price.value}
                  onChange={handleOnChange} />
                :
                <div class={style.priceBar}>
                  <label style={{ marginBottom: '0.6rem' }}>Prices</label>
                  {prices.map(c =>
                    <Link
                      class={cx('button', 'button-small')}
                      href={`/menu/add/customization/${c.id}`}>
                      {c.name} - ${c.price}
                    </Link>)}
                </div>}
              <FieldError err={
                fields.name.err
                || fields.description.err
                || fields.price.err} />
            </div>
          </div>

          <div>
            <label>
              Customize order
            <div class={style.customizations}>
                {customizations.map(customization =>
                  <CustomizationThumbnail
                    customization={customization}
                    onClick={handleCustomizationClick}
                  />)}
                <CircleAnchorButton
                  class={cx('button', style.add, style.addCustomization, {
                    [style.disabledAdd]: loading.loading
                  })}
                  icon={htmlIcons.fullWidthPlus()}
                  loading={loading}
                  href='/menu/add/customization'
                  preload
                />
              </div>
            </label>
          </div>

          <div class={style.saveBar}>
            {data.id ?
              <div>
                <SaveButton
                  class={'button-destroy'}
                  onClick={handleDelete}
                  loading={{
                    ...loading,
                    saveLoading: loading.removeLoading
                  }}
                >
                  Remove
              </SaveButton>
              </div>
              : <div></div>}
            <div>
              <button className='button' onClick={handleBack}>Back</button>
              <SaveButton
                onClick={handleSubmit}
                style={{ marginLeft: '1rem' }}
                loading={loading}
              >
                Save
              </SaveButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MenuAdd;
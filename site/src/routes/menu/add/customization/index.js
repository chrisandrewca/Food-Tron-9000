import CircleAnchorButton from '../../../../components/circle-anchor-button';
import cx from 'classnames';
import DashboardHeader from '../../../../components/dashboard-header';
import FieldError from '../../../../components/field-error';
import { h } from 'preact';
import htmlIcons from '../../../../components/html-icons';
import OptionTree from '../../../../components/option-tree';
import PhotoCarousel from '../../../../components/photo-carousel';
import PriceInput from '../../../../components/price-input';
import SaveButton from '../../../../components/save-button';
import style from './style';
import '../../../../style/tags.css';
import '../../../../style/signup-form';
import { useCallback, useState, useEffect } from 'preact/hooks';
import { useLocation } from 'wouter-preact';

const Customization = ({
  action,
  addPhotos,
  removePhoto,
  save,
  remove,
  onOptionTreeMenuClick,
  onOptionTreeOptionChange,
  onChange,
  onSubmit
}) => {

  const [, setLocation] = useLocation();
  if (!action) {
    setLocation('/menu');
    return null;
  }

  const {
    data,
    fields,
    hasPrice,
    result
  } = action.customization;

  const { photos } = data;

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

  const handleRemovePhoto = useCallback((photo) => {
    removePhoto(photo.src);
  }, []);

  const handleOnChange = useCallback((e) => {
    const { checked, name, value } = e.target;
    onChange(name, value, checked);
  }, []);

  const handleBack = useCallback(() => {
    setLocation('/menu/add');
  }, []);

  const handleRemove = useCallback(async () => {
    setLoading({ removeLoading: true });
    await remove();
    setLocation('/menu/add');
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading({ saveLoading: true });
    await onSubmit();
  }, [onSubmit]);

  useEffect(() => {
    if (result.onSubmit) {
      result.onSubmit.hasError
        ? setLoading({ saveLoading: false })
        : save();
    }
  }, [result.onSubmit]);

  useEffect(() => {
    if (result.save) {
      result.save.hasError
        ? setLoading({ saveLoading: false }) // TODO hookup error state
        : setLocation('/menu/add');
    }
  }, [result.save]);

  return (
    <main>
      <DashboardHeader />
      <section>
        <h2 style={{ textAlign: 'center' }}>Customize order</h2>
        <div className='form'>
          <div class={style.photoCarousel}>
            <PhotoCarousel onDelete={handleRemovePhoto} photos={photos} />
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
                Customization
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
              <PriceInput
                class={cx('input-bottom', fields.price.errClass)}
                name='price'
                placeholder='Price'
                value={fields.price.value}
                onChange={handleOnChange} />
              <FieldError err={fields.name.err || fields.price.err} />
            </div>

            <div>
              <label>Options</label>
              <p style={{ margin: '0.4rem 0' }}>Prices roll up</p>
              <OptionTree
                key={fields.options.value.id}
                options={fields.options.value.items}
                onMenuClick={onOptionTreeMenuClick}
                onOptionChange={onOptionTreeOptionChange}
              />
              {/* <FieldError err={fields.options.err} /> */}
            </div>

            <label style={{ marginBottom: '-0.6rem' }}>
              Ordering
            </label>
            {fields.options.value.hasOptions &&
              <div className='checkbox'>
                <input
                  className={fields.canChooseManyOptions.errClass}
                  id='canChooseManyOptions'
                  type='checkbox'
                  name='canChooseManyOptions'
                  checked={fields.canChooseManyOptions.value}
                  onChange={handleOnChange} />
                <label for='canChooseManyOptions'>Can choose more than one option</label>
              </div>}
            <div className='checkbox'>
              <input
                className={fields.canSkip.errClass}
                id='canSkip'
                type='checkbox'
                name='canSkip'
                checked={fields.canSkip.value}
                onChange={handleOnChange} />
              <label for='canSkip'>Can skip</label>
            </div>

            <div className='checkbox'>
              <input
                className={fields.hasMultiple.errClass}
                id='hasMultiple'
                type='checkbox'
                name='hasMultiple'
                checked={fields.hasMultiple.value}
                onChange={handleOnChange} />
              <label for='hasMultiple'>Can order more than one</label>
            </div>

            {fields.hasMultiple.value ?
              <div style={{
                margin: '0 0 0 1.7rem',
                borderLeft: '1px solid #ddd',
                padding: '0.6rem 0 0.6rem 0.8rem'
              }}>
                <div style={{ marginBottom: '0.8rem' }}>
                  <label style={{ fontWeight: '400' }}>
                    How many?
                    <input
                      className={fields.multipleLimit.errClass}
                      name='multipleLimit'
                      type='text'
                      placeholder='Unlimited'
                      value={fields.multipleLimit.value}
                      onChange={handleOnChange} />
                  </label>
                  <FieldError err={fields.multipleLimit.err} />
                </div>
                {hasPrice &&
                  <div>
                    <label style={{ fontWeight: '400' }}>
                      How many can be ordered for free?
                    <input
                        className={fields.freeLimit.errClass}
                        name='freeLimit'
                        type='text'
                        placeholder='None'
                        value={fields.freeLimit.value}
                        onChange={handleOnChange} />
                    </label>
                    <FieldError err={fields.freeLimit.err} />
                  </div>}
              </div>
              : null}
          </div>

          {/* TODO if tabbed here, highlight */}
          <div class={style.saveBar}>
            {data.id ?
              <div>
                <SaveButton
                  class={'button-destroy'}
                  onClick={handleRemove}
                  loading={{
                    ...loading,
                    saveLoading: loading.removeLoading
                  }}
                >
                  Remove
              </SaveButton>
              </div> : <div></div>}
            <div>
              <button className='button' onClick={handleBack}>Back</button>
              <SaveButton
                onClick={handleSubmit}
                style={{ marginLeft: '1rem' }}
                loading={loading}
              >
                {data.id ? 'Save' : 'Add'}
              </SaveButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Customization;
import cx from 'classnames';
import CustomizationThumbnail from '../../../components/customization-thumbnail';
import FieldError from '../../../components/field-error';
import { h } from 'preact';
import { Link, useLocation } from 'wouter-preact';
import PhotoCarousel from '../../../components/photo-carousel';
import SaveButton from '../../../components/save-button';
import style from './style';
import { useCallback, useState, useEffect } from 'preact/hooks';

const ProfileMenuItem = ({
  action,
  onSubmit,
  save,
  params: { handle } } // warning: all params after params destructure become store
) => {

  const { data, result, src } = action.menuItem;

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

  const handleOnChange = useCallback((e) => {
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading({ saveLoading: true });
    onSubmit();
  }, []);

  const [inBigPicMode, setInBigPicMode] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const handleBigPictureMode = useCallback((inMode) => {
    setInBigPicMode(inMode);
    setShowExamples(false);
  }, []);

  const [, setLocation] = useLocation();
  const handleCustomizationClick = useCallback((customization) => {
    setLocation(`/@${handle}/${src.id}/customize/${customization.id}`);
  }, [src]);

  const handleBack = useCallback(() => {
    setLocation(`/@${handle}`);
  }, []);

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
        ? setLoading({ saveLoading: false })
        : setLocation(`/@${handle}`);
    }
  }, [result.save]);

  return (
    <main>
      <section>
        <h2 style={{ textAlign: 'center' }}>
          Menu Item
        </h2>
        <div className='form'>
          <div class={style.photoCarousel}>
            <PhotoCarousel
              onBigPictureMode={handleBigPictureMode}
              photos={src.photos}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <h2>{src.name}</h2>
            <p>{src.description}</p>
            <p>{src.price}</p>
          </div>

          <div>
            <label>
              Customize order
              <div class={style.customizations}>
                {src.customizations.map(customization =>
                  <CustomizationThumbnail
                    customization={customization}
                    onClick={handleCustomizationClick}
                  />)}
              </div>
            </label>
          </div>

          {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}

          <div class={style.saveBar}>
            <div>{/*empty to move buttons over*/}</div>
            <div>
              <button className='button' onClick={handleBack}>Back</button>
              <SaveButton
                onClick={handleSubmit}
                style={{ marginLeft: '1rem' }}
                loading={loading}
              >
                Add to order
              </SaveButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfileMenuItem;
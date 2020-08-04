import cx from 'classnames';
import { h } from 'preact';
import PhotoCarousel from '../../../../components/photo-carousel';
import ProfileOptionTree from '../../../../components/profile-option-tree';
import SaveButton from '../../../../components/save-button';
import style from './style';
import '../../../../style/tags.css';
import '../../../../style/signup-form';
import { useCallback, useState, useEffect } from 'preact/hooks';
import { useLocation } from 'wouter-preact';

const ProfileCustomization = ({
  action,
  onOptionTreeOptionChange,
  onOptionTreeSubOptionsCheck,
  onSubmit,
  params: { handle, menuItemId, customizationId },
  save
}) => {

  console.log({ action, result: action.customization.result });
  const [, setLocation] = useLocation();
  if (!action) {
    // TODO state machine-ify, 'composed reducers' global -> component
    setLocation(`/@${handle}/${menuItemId}`);
    return null;
  }

  const { fields, result, src } = action.customization;

  // TODO state machine-ify
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
    const { checked, name, value } = e.target;
    //onChange(name, value, checked);
  }, []);

  const handleBack = useCallback(() => {
    // warning: same as route in App.js
    setLocation(`/@${handle}/${menuItemId}`);
  }, []);

  const handleRemove = useCallback(async () => {
    setLoading({ removeLoading: true });
    //await remove();
    setLocation(`/@${handle}/${menuItemId}`);
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading({ saveLoading: true });
    await onSubmit();
  }, [/*onSubmit*/]);

  useEffect(() => {
    if (result.onOptionTreeOptionChange) {

      const check = result.onOptionTreeOptionChange;

      if (check.checked && check.hasSubOptions) {
        check.selectChildren = confirm('Also select sub options?');
      }

      onOptionTreeSubOptionsCheck(check);
    }
  }, [result.onOptionTreeOptionChange]);

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
        : setLocation(`/@${handle}/${menuItemId}`);
    }
  }, [result.save]);

  return (
    <main>
      <section>
        <h2 style={{ textAlign: 'center' }}>Customize order</h2>
        <div className='form'>
          <div class={style.photoCarousel}>
            <PhotoCarousel photos={src.photos} />
          </div>
          <div>
            <div>
              <h2>{src.name}</h2>
              <p>{src.description}</p>
              <p>{src.price}</p>
            </div>

            <div>
              <label>Options</label>
              <ProfileOptionTree
                key={fields.options.value.id}
                options={fields.options.value.items}
                onMenuClick={() => { }}
                onOptionChange={onOptionTreeOptionChange}
              />
            </div>

            {/* <div>
              <pre>canChooseManyOptions, canSkip, hasMultiple, multipleLimit, freeLimit</pre>
            </div> */}
          </div>

          {/* TODO if tabbed here, highlight */}
          <div class={style.saveBar}>
            {src.id ? // TODO show remove when added to menu item
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
              <button className='button' onClick={handleBack}>
                Back
              </button>
              <SaveButton
                onClick={handleSubmit}
                style={{ marginLeft: '1rem' }}
                loading={loading}
              >
                Add
              </SaveButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfileCustomization;
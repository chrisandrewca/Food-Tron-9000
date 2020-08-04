import { isEmpty } from '../../../forms';
import styleForms from '../../../style/signup-form';
import { useState } from 'preact/hooks';

const FreeAdsPromotion = () => {

  const [fields, setFields] = useState({
    name: { errClass: '' },
    role: { errClass: '' },
    establishmentName: { errClass: '' },
    establishmentAddress: { errClass: '' },
    establishmentAge: { errClass: '' },
    establishmentDescription: { errClass: '' },
    customerDescription: { errClass: '' },
    facebookPage: { errClass: '' },
    additionalLinks: { errClass: '' }
  });

  const handleOnChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    // empty strings and spaces for class appends
    let err = '', errClass = '';
    if (name === 'name'
      // TODO test script injection, validate on server too
      && isEmpty(value)) {
      err = 'Your name is incomplete.';
      errClass = ' input-error';
    }
    else if (name === 'role'
      && isEmpty(value)) {
      err = 'Your role is incomplete.';
      errClass = ' input-error';
    }
    else if (name === 'establishmentName'
      && isEmpty(value)) {
      err = 'Your establishment is incomplete.';
      errClass = ' input-error';
    }
    else if (name === 'establishmentAddress'
      && isEmpty(value)) {
      err = 'Your establishment is incomplete.';
      errClass = ' input-error';
    }
    else if (name === 'establishmentAge'
      && isEmpty(value)) {
      err = 'Your establishment\'s age is incomplete.';
      errClass = ' input-error';
    }
    else if (name === 'establishmentDescription'
      && isEmpty(value)) {
      err = 'Hey! We\'re missing the detes on your good cookin\'';
      errClass = ' input-error';
    }
    else if (name === 'customerDescription'
      && isEmpty(value)) {
      err = 'Your customer description is incomplete.';
      errClass = ' input-error';
    }

    setFields(fields => ({ ...fields, [name]: { err, errClass, value } }));
  };

  const handleKeyDown = (e) => {
    const { name, value } = e.target;
    if (!value) {
      setFields(fields => ({ ...fields, [name]: { err: '', errClass: '' } }));
    }
  };

  const handleSubmit = (e) => {
    let hasError = false;

    if (fields.name.err || isEmpty(fields.name.value)) {
      setFields(fields => ({
        ...fields,
        name: {
          err: 'Your name is required.',
          errClass: ' input-error'
        }
      }));
      hasError = true;
    }

    if (fields.role.err || isEmpty(fields.role.value)) {
      setFields(fields => ({
        ...fields,
        role: {
          err: 'Your role is required.',
          errClass: ' input-error'
        }
      }));
      hasError = true;
    }

    if (fields.establishmentName.err || isEmpty(fields.establishmentName.value)) {
      setFields(fields => ({
        ...fields,
        establishmentName: {
          err: 'Your establishment is required.',
          errClass: ' input-error'
        }
      }));
      hasError = true;
    }

    if (fields.establishmentAddress.err || isEmpty(fields.establishmentAddress.value)) {
      setFields(fields => ({
        ...fields,
        establishmentAddress: {
          err: 'Your establishment is required.',
          errClass: ' input-error'
        }
      }));
      hasError = true;
    }

    if (fields.establishmentAge.err || isEmpty(fields.establishmentAge.value)) {
      setFields(fields => ({
        ...fields,
        establishmentAge: {
          err: 'Your establishment\'s age is required.',
          errClass: ' input-error'
        }
      }));
      hasError = true;
    }

    if (fields.establishmentDescription.err || isEmpty(fields.establishmentDescription.value)) {
      setFields(fields => ({
        ...fields,
        establishmentDescription: {
          err: 'Your establishment\'s description is required.',
          errClass: ' input-error'
        }
      }));
      hasError = true;
    }

    if (fields.customerDescription.err || isEmpty(fields.customerDescription.value)) {
      setFields(fields => ({
        ...fields,
        customerDescription: {
          err: 'Your customers\' description is required.',
          errClass: ' input-error'
        }
      }));
      hasError = true;
    }

    if (hasError) {
      e.preventDefault();
    }
  };

  return (
    <main>
      <header>
        <h1>Food-Tron 9000</h1>
      </header>
      <p style={{ textAlign: 'center' }}>Thank you for choosing the Food-Tron 9000. We succeed when you succeed!</p>
      <p style={{ textAlign: 'center' }}>So let's get started on your FREE $5 Facebook ad campaign.</p>
      <form method='POST' action='/api/promotion/free-ads' onSubmit={handleSubmit}>

        <div>
          <label>
            Name
            <input
              className={`${fields.name.errClass}`}
              name='name'
              type='text'
              onChange={handleOnChange}
              onKeyDown={handleKeyDown} />
          </label>
        </div>

        <div>
          <label>
            Role
            <input
              className={`${fields.role.errClass}`}
              name='role'
              type='text'
              placeholder='Owner'
              onChange={handleOnChange}
              onKeyDown={handleKeyDown} />
          </label>
        </div>

        <div>
          <label for='item-fieldset'>Establishment</label>
          <fieldset id='item-fieldset'>
            <input
              className={` input-top${fields.establishmentName.errClass}`}
              name='establishmentName'
              type='text'
              placeholder='Name'
              onChange={handleOnChange}
              onKeyDown={handleKeyDown} />
            <input
              className={` input-bottom${fields.establishmentAddress.errClass}`}
              name='establishmentAddress'
              type='text'
              placeholder='Address'
              onChange={handleOnChange}
              onKeyDown={handleKeyDown} />
          </fieldset>
        </div>

        <div>
          <label>
            How long have you been open for business?
            <input
              className={`${fields.establishmentAge.errClass}`}
              name='establishmentAge'
              type='text'
              placeholder='6 months'
              onChange={handleOnChange}
              onKeyDown={handleKeyDown} />
          </label>
        </div>

        <div>
          <label>
            Tell us about your mouth waterin' grub
            <textarea
              className={`${fields.establishmentDescription.errClass}`}
              name='establishmentDescription'
              type='text'
              onChange={handleOnChange}
              onKeyDown={handleKeyDown} />
          </label>
        </div>

        <div>
          <label>
            Briefly describe your desired or existing customers
            <textarea
              className={`${fields.customerDescription.errClass}`}
              name='customerDescription'
              type='text'
              onChange={handleOnChange}
              onKeyDown={handleKeyDown} />
          </label>
        </div>

        <div>
          <label>
            Facebook page (optional)
            <input
              className={`${fields.facebookPage.errClass}`}
              name='facebookPage'
              type='text'
              placeholder='facebook.com/Food-Tron-9000'
              onChange={handleOnChange}
              onKeyDown={handleKeyDown} />
          </label>
        </div>

        <div>
          <label>
            Additional links and media (optional)
            <textarea
              className={`${fields.additionalLinks.errClass}`}
              name='additionalLinks'
              type='text'
              placeholder='Websites, Google Drive, Dropbox, etc'
              onChange={handleOnChange}
              onKeyDown={handleKeyDown} />
          </label>
        </div>

        {/* TODO if tabbed here, highlight */}
        <input className='button-inverse' type='submit' value='Start free campaign' />
      </form>
    </main>
  );
}

export default FreeAdsPromotion;
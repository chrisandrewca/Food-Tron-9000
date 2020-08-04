import FieldError from '../../components/field-error';
import { Fragment } from 'preact';
import { isDecimal, isEmail, isEmpty, isHandle, toCurrencyString } from '../../forms';
import PriceInput from '../../components/price-input';
import style from './style';
import styleForms from '../../style/signup-form';
import { useState } from 'preact/hooks';
import CurrencySelect from '../../components/currency-select';

const Start = () => {

	const [photo, setPhoto] = useState({ errClass: '' });
	const handlePhoto = (e) => {
		if (e.target.files.length > 0) {
			const file = e.target.files[0];

			let reader = new FileReader();
			reader.onloadend = () => {
				setPhoto({
					name: file.name,
					preview: reader.result,
					size: file.size,
					err: '',
					errClass: ''
				});
			}

			reader.readAsDataURL(file);
		}
	};

	const [fields, setFields] = useState({
		item: { errClass: '' },
		price: { errClass: '' },
		currency: {}, // validated on server since its a drop down
		handle: { errClass: '' },
		email: { errClass: '' }
	});

	const handleOnChange = (e) => {
		const { name } = e.target;
		let { value } = e.target;

		// empty strings and spaces for class appends
		let err = '', errClass = '';
		if (name === 'item'
			// TODO test script injection, validate on server too
			&& isEmpty(value)) {
			err = 'Your menu item is incomplete.';
			errClass = ' input-error';
		}

		if (name === 'price') {
			if (isEmpty(value)) {
				err = 'Your menu item is incomplete.';
				errClass = ' input-error';
			} else {

				if (value[0] === '$') {
					// TODO localize/currency
					value = value.slice(1);
				}

				if (isDecimal(value)) {
					value = toCurrencyString(value);
				} else {
					err = 'Your menu item is incomplete.';
					errClass = ' input-error';
				}
			}
		}

		if (name === 'handle'
			&& !isHandle(value)) {
			err = 'Your profile name is incomplete.'
			errClass = ' input-error';
		}

		if (name === 'email'
			&& !isEmail(value)) {
			err = 'Your email is incomplete.'
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
		if (photo.err || isEmpty(photo.name)) {
			setPhoto(photo => ({
				...photo,
				err: 'Your menu item photo is required.',
				errClass: ' button-error'
			}));
			hasError = true;
		}

		if (fields.item.err || isEmpty(fields.item.value)) {
			setFields(fields => ({
				...fields,
				item: {
					err: 'Your menu item is required.',
					errClass: ' input-error'
				}
			}));
			hasError = true;
		}

		if (fields.price.err || isEmpty(fields.price.value)) {
			setFields(fields => ({
				...fields,
				price: {
					err: 'Your menu item is required.',
					errClass: ' input-error'
				}
			}));
			hasError = true;
		}

		if (fields.handle.err || isEmpty(fields.handle.value)) {
			setFields(fields => ({
				...fields,
				handle: {
					err: 'Your profile name is required.',
					errClass: ' input-error'
				}
			}));
			hasError = true;
		}

		if (fields.email.err || isEmpty(fields.email.value)) {
			setFields(fields => ({
				...fields,
				email: {
					err: 'Your email is required.',
					errClass: ' input-error'
				}
			}));
			hasError = true;
		}

		if (hasError) {
			e.preventDefault();
		} else {

			// remove $ and @
			e.target.elements.price.value = e.target.elements.price.value.slice(1);
			if (e.target.elements.handle.value[0] === '@') {
				e.target.elements.handle.value = e.target.elements.handle.value.slice(1);
			}
		}
	};

	return (
		<main>
			<header style={{ textAlign: 'center' }}>
				<h1>Food-Tron 9000</h1>
			</header>
			<form method='POST' action='/api/start' enctype='multipart/form-data' onSubmit={handleSubmit}>

				<div>
					<label className='file'>
						<span>Lets get selling! Share a menu item.</span>
						<a className={`button${photo.errClass}`} tabIndex='0'>
							{photo.name ?
								<Fragment>
									<img src={photo.preview} />
									{photo.name}
								</Fragment>
								: 'Choose picture'}
						</a>
						<span>
							<input onChange={handlePhoto} type='file' name='photo' accept='image/*' tabIndex='-1' />
						</span>
					</label>
					<FieldError err={photo.err} />
				</div>

				<div>
					<label for='item-fieldset'>Menu item</label>
					<fieldset id='item-fieldset'>
						<input
							className={` input-top${fields.item.errClass}`}
							name='item'
							type='text'
							placeholder='Item'
							onChange={handleOnChange}
							onKeyDown={handleKeyDown} />
						<PriceInput
							styles={{ borderTop: 'none' }}
							className={` input-bottom${fields.price.errClass}`}
							name='price'
							placeholder='Price'
							value={fields.price.value}
							onChange={handleOnChange}
							onKeyDown={handleKeyDown}>
							<CurrencySelect onChange={handleOnChange} />
						</PriceInput>
					</fieldset>
					<FieldError err={fields.item.err || fields.price.err} />
				</div>

				<div>
					<label>
						Profile name
						<input
							className={`${fields.handle.errClass}`}
							name='handle'
							type='text'
							placeholder='@bossbreads'
							onChange={handleOnChange}
							onKeyDown={handleKeyDown} />
					</label>
					<FieldError err={fields.handle.err} />
				</div>

				<div>
					<label>
						Email
						<input
							className={`${fields.email.errClass}`}
							name='email'
							type='text'
							placeholder='ron@bossbreads.com'
							onChange={handleOnChange}
							onKeyDown={handleKeyDown} />
					</label>
					<FieldError err={fields.email.err} />
				</div>

				{/* TODO if tabbed here, highlight */}
				<input className='button-inverse' type='submit' value='Sell now!' />
			</form>
		</main>
	);
};

export default Start;
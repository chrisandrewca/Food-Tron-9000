import { default as _isAlphaNumeric } from 'validator/es/lib/isAlphanumeric';
import { default as _isDecimal } from 'validator/es/lib/isDecimal';
import { default as _isEmail } from 'validator/es/lib/isEmail';
import { default as _isEmpty } from 'validator/es/lib/isEmpty';
import { default as _isNumber } from 'validator/es/lib/isNumeric';
import trim from 'validator/es/lib/trim';

export const getMenuItemPlaceholder = () => ({
  photos: [{ placeholder: true, src: '/api/photos/PlaceholderMenuItem.png' }],
  customizations: [{ name: 'Customize', photos: [{ placeholder: true, src: '/api/photos/PlaceholderCustomization.gif' }] }]
});

export const isAlphaNumeric = (value) => {
  return _isAlphaNumeric(trim(value));
}

export const isDecimal = (value) => {
  return _isDecimal(trim(value));
}

export const isEmail = (value) => {
  return _isEmail(trim(value));
}

export const isEmpty = (value) => {
  // TODO refactor calls like isEmpty(String(x))
  return _isEmpty(trim(String(value || '')));
}

export const isHandle = (value) => {
  return /^@?[a-zA-Z0-9_]+$/i.test(trim(value));
}

export const isNumber = (value) => {
  return _isNumber(trim(value));
}

export const toCurrencyString = (value) => {
  const precision = 2;
  const base = 10 ** precision;
  const _ = Number(value);
  return '$' + (Math.round(_ * base) / base).toFixed(precision);
}

export const createForm = (fields, photos = {}) => {
  const form = new FormData();

  for (const key of Object.keys(fields)) {

    const field = fields[key];
    const value = field.value;

    if (value !== undefined) {
      form.append(key, value);
    }
  }

  for (const key of Object.keys(photos)) {
    for (const file of photos[key]) {
      form.append(key, file, file.name);
    }
  }

  return form;
};
import { createForm } from './forms';

/*
 * Version, Auth, User App State
 */
const getAppVersion = async () => {
  const result = await fetch(maybeAbsolute('/api/version'), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });
  const { version } = await result.json();
  return version;
};

const checkUserAuthenticated = async () => {
  try {
    const result = await fetch('/api/login-check', {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        credentials: 'same-origin'
      }
    });
    return result.ok;
  } catch (err) {
    return false;
  }
};

const getUserAppState = async () => {
  const result = await fetch(maybeAbsolute('/api/app-state'), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });
  const state = await result.json();
  return state;
};

/*
 * MenuItem
 */
const listMenuItems = async () => {
  const result = await fetch(maybeAbsolute('/api/menu'), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });
  const { menuItems } = await result.json();
  return menuItems;
};

const getMenuItem = async (id) => {
  const result = await fetch(maybeAbsolute(`/api/menu/${id}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });
  const { menuItem } = await result.json();
  applyMenuItemDefaults(menuItem);
  return menuItem;
};

const buildMenuItem = async (fields, files) => {
  const body = createForm(fields, files);
  const result = await fetch(maybeAbsolute('/api/menu/build'), {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body
  });
  const { build } = await result.json();
  return build;
};

const saveMenuItem = async (menuItem) => {
  const result = await fetch(maybeAbsolute('/api/menu'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(menuItem)
  });
  menuItem = await result.json();
  return menuItem;
};

const removeMenuItem = async (id) => {
  await fetch(maybeAbsolute(`/api/menu/${id}`), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });
};

/*
 * Customization
 */
const addCustomization = async (body) => {
  const result = await fetch(maybeAbsolute('/api/customization'), {
    method: 'POST',
    headers: {
      // multipart FormData
      Accept: 'application/json'
    },
    body
  });

  const { customization } = await result.json();
  return customization;
};

const updateCustomization = async (body) => {
  const result = await fetch(maybeAbsolute('/api/customization'), {
    method: 'PATCH',
    headers: {
      // multipart FormData
      Accept: 'application/json'
    },
    body
  });

  const { customization } = await result.json();
  return customization;
};

const listCustomizations = async () => {
  const result = await fetch(maybeAbsolute('/api/customization'), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  const { customizations } = await result.json();
  return customizations;
};

/*
 * Profile
 */
const getProfile = async (handle) => {
  const result = await fetch(maybeAbsolute(`/api/profile?handle=${handle}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  const { menuItems } = await result.json();
  return menuItems;
};

const getProfileMenuItem = async (handle, id) => {
  const result = await fetch(maybeAbsolute(`/api/profile/${handle}/${id}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  const { menuItem } = await result.json();
  return menuItem;
};

const getMenuItemPlaceholder = () => applyMenuItemDefaults({});
const getCustomizationPlaceholder = () => applyCustomizationDefaults({ placeholder: true });

const applyMenuItemDefaults = (menuItem) => {
  const { customizations, photos } = menuItem;

  if (!photos || !photos.length) {
    menuItem.photos = [{
      placeholder: true,
      src: '/api/photos/PlaceholderMenuItem.png'
    }];
  }

  if (!customizations || !customizations.length) {
    menuItem.customizations = [getCustomizationPlaceholder()];
  }

  return menuItem;
};

const applyCustomizationDefaults = (customization) => {
  const { name, photos } = customization;

  if (!name) {
    customization.name = 'Customize';
  }

  if (!photos || !photos.length) {
    customization.photos = [{
      placeholder: true,
      src: '/api/photos/PlaceholderCustomization.gif'
    }];
  }

  return customization;
};

export default {
  getAppVersion,
  checkUserAuthenticated,
  getUserAppState,
  listMenuItems,
  getMenuItem,
  getProfile,
  getProfileMenuItem,
  buildMenuItem,
  saveMenuItem,
  removeMenuItem,
  addCustomization,
  updateCustomization,
  listCustomizations,
  getMenuItemPlaceholder,
  getCustomizationPlaceholder,
  applyMenuItemDefaults,
  applyCustomizationDefaults
};

const maybeAbsolute = (path) => {
  return typeof process !== 'undefined' ?
    process.env.BASE_URL
      ? `${process.env.BASE_URL}${path}`
      : path
    : path;
};
const { JoiProfileOrder, JoiSystemOrder } = require('../validation');
const db = require('../db');

const build = async (order) => {

  // TODO get customers info

  try {
    order = await JoiProfileOrder().validateAsync(order, {
      abortEarly: false,
      convert: true
    });
  } catch (err) {
    return { err };
  }

  return { order };
};

const set = async (order) => {

  console.dir({ order }, { depth: null });
  // TODO get customers info

  // TODO sum, create aux order data

  // TODO who is responsible for < 0.50
  // TODO may not be relevant anymore? https://stripe.com/docs/api/prices/create
  // options:
  // 1. a single menu item cannot be < 0.5
  // includes required options roll up
  order.price = 0;
  order.lineItems = [];

  console.log('START', order.menuItems);
  for (let m = 0; m < order.menuItems.length; m++) {

    console.log('LOOP', { menuItem: order.menuItems[m] });
    const menuItem = await db.findMenuItem({
      handle: order.handle,
      id: order.menuItems[m].id
    });

    const lineItem = {
      name: menuItem.name,
      description: menuItem.description,
      menuItemPrice: menuItem.price,
      quantity: 1, // TODO
      totalPrice: menuItem.price ? menuItem.price : 0
    };

    console.log({ lineItem });

    lineItem.images = (() => {
      const getImgUrl = (path) => `https://${process.env.DOMAIN}${path}`;

      // stripe allows 8 images, we init with one from menuItem
      let allotment = 7, images = [getImgUrl(menuItem.photos[0].src)];

      const customizationCount = menuItem.customizations.length;
      const remaining = Math.max([allotment - customizationCount, 0]);

      if (remaining > 0) {
        for (let i = 1; i < menuItem.photos.length; i++) {
          if (i <= remaining) {
            images.push(getImgUrl(menuItem.photos[i]));
          } else {
            break;
          }
        }
      }

      allotment -= remaining;
      if (allotment > 0) {
        for (let i = 0; i < menuItem.customizations.length; i++) {
          if (i <= allotment) {
            images.push(getImgUrl(menuItem.customizations[i].photos[0].src));
          } else {
            break; // TODO if menuItem only has 2, and cust has 2 with 8 each, fill images from those customizations
          }
        }
      }

      return images;
    })();

    const description = ['\n' + '<ul>'];
    for (let c = 0; c < order.menuItems[m].customizations.length; c++) {
      const customization = menuItem.customizations.find(
        _c => _c.id === order.menuItems[m].customizations[c].id
      );

      if (customization.price) {
        lineItem.totalPrice += customization.price;
      }

      const optionDescription = [];
      for (const option of order.menuItems[m].customizations[c].options) {
        optionDescription.push(`<li>${option.name}</li>`);
        if (option.price) {
          lineItem.totalPrice += option.price;
        }
      }

      // may or may not be a cust description
      // may or may not be options
      let customizationDescription = '';
      if (customization.description) {
        customizationDescription +=
          '<li>'
          + customization.description;
      }

      if (customizationDescription && optionDescription.length) {
        customizationDescription +=
          '<ul>'
          + optionDescription.join('\n')
          + '</ul>';
      }

      if (customizationDescription) {
        customizationDescription += '</li>';
        description.push(customizationDescription);
      }
    }
    description.push('</ul>');

    if (description.length > 2) {
      lineItem.description = description.join('\n');
    }

    order.price += lineItem.totalPrice;
    order.lineItems.push(lineItem);
  }
  console.log('END');

  // TODO
  try {
    order = await JoiSystemOrder().validateAsync(order, {
      abortEarly: false,
      convert: true
    });
  } catch (err) {
    return { err };
  }

  await db.upsertOrder(order);

  return { systemOrder: order };
};

module.exports = {
  api: {
    build,
    set
  }
};
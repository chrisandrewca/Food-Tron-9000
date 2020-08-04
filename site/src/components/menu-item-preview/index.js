import style from './style';

const MenuItemPreview = ({ children, item }) => {
  let price = item.price;
  // if (!price) {
  //   const prices = item.customizations
  //     .filter(c => c.adjustment === 'adjustmentReplace')
  //     .sort((a, b) => a.price - b.price);

  //   if (prices.length) {
  //     price = prices[0].price;
  //   }
  // }

  const {
    name,
    photos
  } = item;
  const { src } = photos[0];

  return (
    <div class={style.item}>
      <img src={src} />
      <p><span>{name}</span> - ${price}</p>
      {children}
    </div>
  );
};

export default MenuItemPreview;
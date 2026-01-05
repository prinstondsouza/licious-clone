export const getProductQuantity = (cart, productId) => {
  if (!cart?.items) return 0;

  const cartItem = cart.items.find(
    (item) => item.vendorProduct._id === productId
  );

  return cartItem ? cartItem.quantity : 0;
};

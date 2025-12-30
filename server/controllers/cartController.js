import Cart from "../models/cartModel.js";
import VendorProduct from "../models/vendorProductModel.js";

// Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items.vendorProduct",
        populate: {
          path: "baseProduct",
          select: "name category description images",
        },
      })
      .populate("items.vendorProduct.vendor", "storeName ownerName");

    if (!cart) {
      return res.json({ cart: null, message: "Cart is empty" });
    }

    res.json({ cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add vendor product to cart
export const addToCart = async (req, res) => {
  try {
    const { vendorProductId, quantity } = req.body;

    if (!vendorProductId || !quantity) {
      return res.status(400).json({ message: "vendorProductId and quantity required" });
    }

    const vendorProduct = await VendorProduct.findById(vendorProductId)
      .populate("baseProduct")
      .populate("vendor");

    if (!vendorProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (vendorProduct.status !== "active" || vendorProduct.stock < quantity) {
      return res.status(400).json({ message: "Product not available or insufficient stock" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ vendorProduct: vendorProductId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.vendorProduct.toString() === vendorProductId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ vendorProduct: vendorProductId, quantity });
      }
      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.vendorProduct",
        populate: {
          path: "baseProduct",
          select: "name category description images",
        },
      })
      .populate("items.vendorProduct.vendor", "storeName ownerName");

    res.json({ message: "Product added to cart", cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove product from cart (decrement quantity)
export const removeFromCart = async (req, res) => {
  try {
    const { vendorProductId } = req.body;

    if (!vendorProductId) {
      return res.status(400).json({ message: "vendorProductId is required" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.vendorProduct.toString() === vendorProductId
    );

    if (itemIndex > -1) {
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      } else {
        cart.items.splice(itemIndex, 1);
      }

      await cart.save();

      const populatedCart = await Cart.findById(cart._id)
        .populate({
          path: "items.vendorProduct",
          populate: {
            path: "baseProduct",
            select: "name category description images",
          },
        })
        .populate("items.vendorProduct.vendor", "storeName ownerName");

      res.json({ message: "Cart updated", cart: populatedCart });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart after order
export const clearCart = async (userId) => {
  try {
    await Cart.findOneAndDelete({ user: userId });
  } catch (error) {
    console.log("Error clearing cart:", error.message);
  }
};

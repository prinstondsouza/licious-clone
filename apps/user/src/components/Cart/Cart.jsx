import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Cart.module.css";
import QuantityButton from "../Product/QuantityButton";
import { X } from "lucide-react";
import { useCart } from "../../context/CartContext";

const Cart = ({ isSidebar = false }) => {
  const { cart, addToCart, removeFromCart, removeProductFromCart, fetchCart } =
    useCart();
  let navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleCheckout = async () => {
    if (!token) {
      toast.info("Please log in to continue", { position: "top-center" });
      navigate("/");
      return;
    }

    await fetchCart();

    if (!cart || cart.items.length === 0) {
      toast.info("Your cart is empty.", { position: "top-center" });
      return;
    }

    navigate("/checkout");
  };

  if (!cart || cart.items.length === 0) {
    return <h2 className={styles.container}>Your cart is empty 🛒</h2>;
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.vendorProduct.price * item.quantity,
    0,
  );

  return (
    <div className={isSidebar ? styles.sidebarContainer : styles.container}>
      {cart.items.map((item) => (
        <div key={item.vendorProduct._id} className={styles.cartItem}>
          <div className={styles.itemInfo}>
            <h3>{item.vendorProduct.name}</h3>
            <p>Vendor: {item.vendorProduct.vendor?.storeName}</p>
            <p>Price: ₹{item.vendorProduct.price}</p>
            <p>Quantity: {item.quantity}</p>
          </div>
          <div>
            <button
              onClick={() => removeProductFromCart(item.vendorProduct._id)}
              className={styles.removeBtn}
            >
              <X size={20} />
            </button>
            <div className={styles.buttons}>
              <QuantityButton
                qty={item.quantity}
                onAdd={(qty) => addToCart(item.vendorProduct._id)}
                onRemove={(qty) => removeFromCart(item.vendorProduct._id)}
              />
            </div>
          </div>
        </div>
      ))}

      <hr className={styles.divider} />
      <div className={styles.checkout}>
        <h2>Total: ₹{totalAmount}</h2>

        <button onClick={handleCheckout} className={styles.checkoutBtn}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;

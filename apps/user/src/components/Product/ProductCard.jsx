import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import QuantityButton from "./QuantityButton";
import { useCart } from "../../context/CartContext";

const ProductCard = ({ product, quantity }) => {
  const { addToCart, removeFromCart, loading } = useCart();

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Link
          to={`/product/${product._id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className={styles.image}
            />
          )}
        </Link>
        <div className={styles.quantityBtn}>
          <QuantityButton
            qty={quantity}
            loading={loading}
            onAdd={(qty) => addToCart(product._id)}
            onRemove={(qty) => removeFromCart(product._id)}
          />
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.price}>₹{product.price || "N/A"}</div>
      </div>
    </div>
  );
};

export default ProductCard;

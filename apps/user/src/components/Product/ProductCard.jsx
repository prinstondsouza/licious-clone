import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import QuantityButton from "./QuantityButton";
import { useCart } from "../../context/CartContext";
import { useRef, useState } from "react";

const ProductCard = ({ product, quantity }) => {
  const { addToCart, removeFromCart } = useCart();
  const images = product.images || [];

  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);

  const startSlide = () => {
    if (images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 1200);
  };

  const stopSlide = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActiveIndex(0);
  };

  return (
    <div className={styles.card}>
      <div
        className={styles.imageWrapper}
        onMouseEnter={startSlide}
        onMouseLeave={stopSlide}
      >
        <Link to={`/product/${product._id}`}>
          <div
            className={styles.slider}
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {images.map((img, idx) => (
              <img key={idx} src={img} className={styles.image} />
            ))}
          </div>
        </Link>

        <div className={styles.quantityBtn}>
          <QuantityButton
            qty={quantity}
            onAdd={() => addToCart(product._id)}
            onRemove={() => removeFromCart(product._id)}
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

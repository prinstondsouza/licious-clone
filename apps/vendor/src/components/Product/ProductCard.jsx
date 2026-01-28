import { Link, useNavigate } from "react-router-dom";
import { Pencil, AlertTriangle, CheckCircle2 } from "lucide-react";
import styles from "./ProductCard.module.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const image = product?.images?.[0] || product?.image || "";

  const price = product?.price ?? product?.basePrice ?? "";
  const stock = Number(product?.stock ?? 0);
  const status = String(product?.status || "inactive").toLowerCase();

  const isOut = stock === 0;
  const isLow = stock > 0 && stock <= 5;

  const badgeText = isOut
    ? "Out of Stock"
    : isLow
      ? `Low Stock • ${stock}`
      : `Stock • ${stock}`;

  const badgeTone = isOut ? "danger" : isLow ? "warn" : "good";

  return (
    <div className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        <Link
          to={`/product/${product._id}`}
          className={styles.imageLink}
          title="Open product"
        >
          {image ? (
            <img src={image} alt={product?.name} className={styles.image} />
          ) : (
            <div className={styles.fallback}>
              {(product?.name?.[0] || "P").toUpperCase()}
            </div>
          )}
        </Link>

        {/* Stock Badge */}
        <div className={`${styles.badge} ${styles[`badge_${badgeTone}`]}`}>
          {badgeText}
        </div>

        {/* Status pill */}
        <div
          className={`${styles.statusPill} ${
            status === "active" ? styles.active : styles.inactive
          }`}
        >
          {status === "active" ? (
            <>
              <CheckCircle2 size={14} /> Active
            </>
          ) : (
            <>
              <AlertTriangle size={14} /> Inactive
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <p className={styles.name}>{product?.name || "Unnamed Product"}</p>
        <p className={styles.description}>
          {product?.description || "No description available."}
        </p>

        <div className={styles.bottomRow}>
          <div className={styles.priceBlock}>
            <p className={styles.priceLabel}>Price</p>
            <p className={styles.priceValue}>{price ? `₹${price}` : "—"}</p>
          </div>

          <button
            className={styles.editBtn}
            onClick={() => navigate(`/inventory`)}
            title="Go to inventory to edit"
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

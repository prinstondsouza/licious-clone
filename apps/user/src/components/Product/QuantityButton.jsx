import { useEffect, useState } from "react";
import { Plus, Minus, LoaderCircle } from "lucide-react";
import styles from "./QuantityButton.module.css";

const QuantityButton = ({ qty, loading, onAdd, onRemove }) => {
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    setQuantity(qty ?? 0);
  }, [qty]);

  // Default state → only plus
  if (quantity === 0) {
    return (
      <button
        className={styles.addBtn}
        onClick={() => onAdd(quantity + 1)}
        disabled={loading}
      >
        <Plus size={20} />
      </button>
    );
  }

  // Quantity selector state
  return (
    <div className={styles.counter}>
      <button
        onClick={() => onRemove(quantity - 1)}
        className={styles.iconBtn}
        disabled={loading}
      >
        <Minus size={20} />
      </button>

      <span className={styles.count}>
        {loading ? <LoaderCircle size={18} /> : quantity}
      </span>

      <button
        onClick={() => onAdd(quantity + 1)}
        className={styles.iconBtn}
        disabled={loading}
      >
        <Plus size={20} />
      </button>
    </div>
  );
};

export default QuantityButton;

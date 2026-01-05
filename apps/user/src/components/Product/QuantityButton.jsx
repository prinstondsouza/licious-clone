import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import styles from "./QuantityButton.module.css";

const QuantityButton = ({ qty, onAdd, onRemove }) => {
  const [quantity, setQuantity] = useState(0);

  const handleAdd = () => {
  onAdd(quantity + 1);
};

const handleRemove = () => {
  onRemove(quantity - 1);
};

  useEffect(() => {
    setQuantity(qty ?? 0);
  }, [qty]);

  // Default state → only plus
  if (quantity === 0) {
    return (
        <button className={styles.addBtn} onClick={handleAdd}>
          <Plus size={20} />
        </button>
    );
  }

  // Quantity selector state
  return (
    <div className={styles.counter}>
      <button onClick={handleRemove} className={styles.iconBtn}>
        <Minus size={20} />
      </button>

      <span className={styles.count}>{quantity}</span>

      <button onClick={handleAdd} className={styles.iconBtn}>
        <Plus size={20} />
      </button>
    </div>
  );
};

export default QuantityButton;

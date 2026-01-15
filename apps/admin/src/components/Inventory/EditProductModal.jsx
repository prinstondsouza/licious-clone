import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./EditProductModal.module.css";

const EditProductModal = ({ product, onClose, onUpdated }) => {
  const token = localStorage.getItem("token");

  const [price, setPrice] = useState(product.basePrice);
  const [status, setStatus] = useState(product.status || "undefined");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrice(product.basePrice);
    setStatus(product.status || "undefined");
  }, [product]);

  const handleUpdate = async () => {
    try {
      setSaving(true);

      const payload = {
        basePrice: Number(price),
        status,
      };

      await axios.put(`/api/products/base/${product._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onUpdated();
      onClose();
    } catch (error) {
      console.log(
        "Error updateProduct:",
        error.response?.data || error.message
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.heading}>Edit Product</h2>
        <p className={styles.productName}>{product.name}</p>

        <div className={styles.field}>
          <label>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>

          <button
            className={styles.saveBtn}
            onClick={handleUpdate}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;

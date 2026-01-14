import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import EditProductModal from "./EditProductModal";
import styles from "./InventoryList.module.css";

const InventoryList = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/products/vendor/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(res.data.vendorProducts || []);
    } catch (error) {
      console.log("Error fetchInventory:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleUpdated = () => {
    fetchInventory();
  };

  if (loading) return <p className={styles.loading}>Loading inventory...</p>;

  return (
    <div className={styles.container}>
      <div>
      <h2 className={styles.title}>My Inventory</h2>
      <Link to="/add-from-catalog">Add Products</Link>
      </div>

      {items.length === 0 ? (
        <p className={styles.emptyText}>No products found</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item._id} className={styles.card}>
              <div>
                <h3 className={styles.productName}>{item.name}</h3>

                <p className={styles.meta}>
                  <b>Price:</b> ₹{item.price} | <b>Stock:</b> {item.stock} |{" "}
                  <b>Status:</b>{" "}
                  <span
                    className={
                      item.status === "active"
                        ? styles.activeStatus
                        : styles.inactiveStatus
                    }
                  >
                    {item.status}
                  </span>
                </p>
              </div>

              <button
                className={styles.editBtn}
                onClick={() => handleEditClick(item)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
};

export default InventoryList;

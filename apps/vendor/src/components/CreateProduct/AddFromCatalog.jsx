import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AddFromCatalog.module.css";

const AddFromCatalog = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [baseProducts, setBaseProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBaseProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/products/base", {
        headers: {Authorization: `Bearer ${token}`},
      });
      setBaseProducts(res.data.baseProducts || res.data.products || []);
    } catch (error) {
      console.log("Error fetchBaseProducts:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaseProducts();
  }, []);

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setPrice("");
    setStock("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) return alert("Select a product first");
    if (!price || !stock) return alert("Enter price and stock");

    try {
      setSaving(true);

      const payload = {
        baseProduct: selectedProduct._id,
        price: Number(price),
        stock: Number(stock),
      };

      await axios.post("/api/products/vendor/inventory", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product added to your inventory ✅");
      setSelectedProduct(null);
      setPrice("");
      setStock("");
    } catch (error) {
      console.log("Error addFromCatalog:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add Product from Catalog</h2>

      {loading ? (
        <p className={styles.loading}>Loading base products...</p>
      ) : (
        <div className={styles.layout}>
          {/* Left: Catalog List */}
          <div className={styles.catalog}>
            <h3 className={styles.subTitle}>Base Products</h3>

            {baseProducts.length === 0 ? (
              <p className={styles.emptyText}>No base products found</p>
            ) : (
              <div className={styles.list}>
                {baseProducts.map((p) => (
                  <button
                    key={p._id}
                    className={`${styles.itemBtn} ${
                      selectedProduct?._id === p._id ? styles.activeItem : ""
                    }`}
                    onClick={() => handleSelect(p)}
                  >
                    <span className={styles.itemName}>{p.name}</span>
                    <span className={styles.itemCategory}>{p.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className={styles.formBox}>
            <h3 className={styles.subTitle}>Add Details</h3>

            {!selectedProduct ? (
              <p className={styles.helperText}>Select a product from the left</p>
            ) : (
              <>
                <div className={styles.selectedInfo}>
                  <p className={styles.selectedName}>{selectedProduct.name}</p>
                  <p className={styles.selectedMeta}>
                    Category: {selectedProduct.category}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.field}>
                    <label>Price</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Stock</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="Enter stock"
                    />
                  </div>

                  <button className={styles.submitBtn} disabled={saving}>
                    {saving ? "Adding..." : "Add to Inventory"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFromCatalog;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import styles from "./AddFromCatalog.module.css";

const AddFromCatalog = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [baseProducts, setBaseProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ Search state
  const [search, setSearch] = useState("");

  const fetchBaseProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/products/base", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBaseProducts(res.data.baseProducts || res.data.products || []);
    } catch (error) {
      console.log(
        "Error fetchBaseProducts:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaseProducts();
  }, []);

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setPrice(product.basePrice || "");
    setStock("");
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setPrice("");
    setStock("");
  };

  // ✅ Filtered catalog list
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return baseProducts;

    const s = search.toLowerCase();
    return baseProducts.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(s) ||
        (p.category || "").toLowerCase().includes(s),
    );
  }, [baseProducts, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) return toast.error("Select a product first");
    if (!price || !stock) return toast.error("Enter price and stock");

    try {
      setSaving(true);

      const payload = {
        baseProductId: selectedProduct._id,
        vendorBasePrice: Number(selectedProduct.basePrice),
        price: Number(price),
        stock: Number(stock),
      };

      await axios.post("/api/products/vendor/inventory", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Product added to your inventory");
      handleReset();
    } catch (error) {
      console.log(
        "Error addFromCatalog:",
        error.response?.data || error.message,
      );
      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        {/* ✅ Header */}
        <div className={styles.topBar}>
          <div>
            <h2 className={styles.title}>Add Product from Catalog</h2>
            <p className={styles.subText}>
              Select a base product and set your selling price + stock.
            </p>
          </div>

          <Link to="/create-product" className={styles.backBtn}>
            ← Create New
          </Link>
        </div>

        {loading ? (
          <p className={styles.loading}>Loading base products...</p>
        ) : (
          <div className={styles.layout}>
            {/* Left: Catalog List */}
            <div className={styles.catalog}>
              <div className={styles.catalogHead}>
                <h3 className={styles.subTitle}>Base Products</h3>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className={styles.searchInput}
                />
              </div>

              {filteredProducts.length === 0 ? (
                <p className={styles.emptyText}>No matching products</p>
              ) : (
                <div className={styles.list}>
                  {filteredProducts.map((p) => (
                    <button
                      type="button"
                      key={p._id}
                      className={`${styles.itemBtn} ${
                        selectedProduct?._id === p._id ? styles.activeItem : ""
                      }`}
                      onClick={() => handleSelect(p)}
                    >
                      <div className={styles.itemLeft}>
                        <span className={styles.itemName}>{p.name}</span>
                        <span className={styles.itemCategory}>
                          {p.category}
                        </span>
                      </div>

                      <span className={styles.basePrice}>
                        ₹{p.basePrice || 0}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Form */}
            <div className={styles.formBox}>
              <h3 className={styles.subTitle}>Add Details</h3>

              {!selectedProduct ? (
                <p className={styles.helperText}>
                  👈 Select a product from the left to continue
                </p>
              ) : (
                <>
                  <div className={styles.selectedInfo}>
                    <div className={styles.selectedTop}>
                      <div>
                        <p className={styles.selectedName}>
                          {selectedProduct.name}
                        </p>
                        <p className={styles.selectedMeta}>
                          Category: {selectedProduct.category}
                        </p>
                      </div>

                      <button
                        type="button"
                        className={styles.resetBtn}
                        onClick={handleReset}
                      >
                        Reset
                      </button>
                    </div>

                    {/* ✅ show base product image if exists */}
                    {selectedProduct.images?.length > 0 && (
                      <img
                        src={selectedProduct.images[0]}
                        alt="product"
                        className={styles.selectedImg}
                      />
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                      <label>Your Selling Price</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter price"
                      />
                      <p className={styles.hint}>
                        Base price: ₹{selectedProduct.basePrice || 0}
                      </p>
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
    </div>
  );
};

export default AddFromCatalog;

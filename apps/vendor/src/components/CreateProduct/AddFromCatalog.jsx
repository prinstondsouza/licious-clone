import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./AddFromCatalog.module.css";
import CustomizeProductModal from "./CustomizeProductModal";

const AddFromCatalog = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [baseProducts, setBaseProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search state
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Filtered catalog list
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return baseProducts;

    const s = search.toLowerCase();
    return baseProducts.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(s) ||
        (p.category || "").toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s),
    );
  }, [baseProducts, search]);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.topBar}>
          <div>
            <h2 className={styles.title}>Add Product from Catalog</h2>
            <p className={styles.subText}>
              Select a base product and customize it for your inventory.
            </p>
          </div>

          <Link to="/create-product" className={styles.backBtn}>
            ← Create New
          </Link>
        </div>

        {loading ? (
          <p className={styles.loading}>Loading base products...</p>
        ) : (
          <div>
            {/* Catalog List */}
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
                      className={styles.itemBtn}
                      onClick={() => handleSelect(p)}
                    >
                      <div className={styles.itemLeft}>
                        <span className={styles.itemName}>{p.name}</span>
                        <span className={styles.itemCategory}>
                          {p.category}
                        </span>
                      </div>

                      <div className={styles.itemRight}>
                        {p.images?.length > 0 && (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className={styles.itemThumb}
                          />
                        )}
                        <span className={styles.basePrice}>
                          ₹{p.basePrice || 0}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <CustomizeProductModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedProduct={selectedProduct}
          onSuccess={fetchBaseProducts}
        />
      </div>
    </div>
  );
};

export default AddFromCatalog;

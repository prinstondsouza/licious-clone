import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import EditProductModal from "./EditProductModal";
import styles from "./InventoryList.module.css";
import { Search } from "lucide-react";

const getImageSrc = (item) => {
  const raw =
    item?.image ||
    item?.images?.[0] ||
    item?.baseProduct?.image ||
    item?.baseProduct?.images?.[0];

  if (!raw) return "";

  if (
    typeof raw === "string" &&
    (raw.startsWith("http") || raw.startsWith("blob:"))
  )
    return raw;

  return raw;
};

const formatStatus = (status) =>
  status ? String(status).toLowerCase() : "inactive";

const InventoryList = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [search, setSearch] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/products/vendor/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(res.data.vendorProducts || []);
    } catch (error) {
      console.log(
        "Error fetchInventory:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const name = (item?.name || item?.baseProduct?.name || "").toLowerCase();
      return name.includes(q);
    });
  }, [items, search]);

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
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>My Inventory</h2>
          <p className={styles.subtitle}>
            Manage your products, stock and pricing.
          </p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className={styles.searchIcon}>
              <Search />
            </span>
          </div>

          <Link to="/create-product" className={styles.addBtn}>
            + Add Products
          </Link>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total</p>
          <p className={styles.statValue}>{items.length}</p>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Active</p>
          <p className={styles.statValue}>
            {items.filter((i) => formatStatus(i.status) === "active").length}
          </p>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Out of Stock</p>
          <p className={styles.statValue}>
            {items.filter((i) => Number(i.stock) === 0).length}
          </p>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyTitle}>No products found</p>
          <p className={styles.emptyText}>
            Try searching with a different name or add a new product.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredItems.map((item) => {
            const status = formatStatus(item.status);
            const imageSrc = getImageSrc(item);
            const isOut = Number(item.stock) === 0;

            return (
              <div key={item._id} className={styles.card}>
                <div className={styles.left}>
                  <div className={styles.thumbWrap}>
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item?.name || "Product"}
                        className={styles.thumb}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className={styles.thumbFallback}>📦</div>
                    )}

                    {isOut ? (
                      <span className={styles.badgeOut}>Out of stock</span>
                    ) : (
                      <span className={styles.badgeStock}>
                        Stock: {Number(item.stock)}
                      </span>
                    )}
                  </div>

                  <div className={styles.info}>
                    <div className={styles.topRow}>
                      <h3 className={styles.productName}>{item.name}</h3>

                      <span
                        className={`${styles.statusPill} ${
                          status === "active" ? styles.active : styles.inactive
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className={styles.metaRow}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Price</span>
                        <span className={styles.metaValue}>₹{item.price}</span>
                      </div>

                      <div className={styles.divider} />

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Stock</span>
                        <span className={styles.metaValue}>{item.stock}</span>
                      </div>

                      <div className={styles.divider} />

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>SKU</span>
                        <span className={styles.metaValue}>
                          {item.sku || item._id?.slice(-6) || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditClick(item)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
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

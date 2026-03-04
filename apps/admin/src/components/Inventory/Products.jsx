import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, RefreshCw, ArrowLeft, ShoppingBag } from "lucide-react";
import styles from "./Products.module.css";

const Products = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);

  const [query, setQuery] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/products/base", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data =
        res.data?.products || res.data?.baseProducts || res.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Products Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load products");
      toast.error("Failed to load products", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => {
      const name = String(p?.name || "").toLowerCase();
      const brand = String(p?.brand || "").toLowerCase();
      const category = String(p?.category || "").toLowerCase();
      return name.includes(q) || brand.includes(q) || category.includes(q);
    });
  }, [products, query]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonGrid} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorBox}>
            <p className={styles.errorTitle}>Couldn’t load products</p>
            <p className={styles.errorText}>{error}</p>

            <div className={styles.actions}>
              <button className={styles.backBtn} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
              </button>

              <button className={styles.primaryBtn} onClick={fetchProducts}>
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.topBar}>
          <div className={styles.leftTop}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              Back
            </button>

            <div>
              <h2 className={styles.title}>Products</h2>
              <p className={styles.subtitle}>
                Base catalog • {products.length} items
              </p>
            </div>
          </div>

          <button
            className={styles.createBtn}
            onClick={() => navigate("/create-product")}
          >
            + Create Product
          </button>

          <button className={styles.primaryBtn} onClick={fetchProducts}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              className={styles.searchInput}
              placeholder="Search products by name, brand, category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.countPill}>
            <ShoppingBag size={16} />
            Showing <b>{filtered.length}</b>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className={styles.emptyBox}>
            <p className={styles.emptyTitle}>No products found</p>
            <p className={styles.emptyText}>Try searching something else.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((p) => (
              <button
                key={p._id}
                className={styles.card}
                onClick={() => navigate(`/products/${p._id}`)}
              >
                <div className={styles.cardTop}>
                  <div className={styles.thumb}>
                    {p?.image || p?.images?.[0] ? (
                      <img
                        src={p.image || p.images?.[0]}
                        alt={p.name}
                        className={styles.thumbImg}
                      />
                    ) : (
                      <div className={styles.thumbFallback}>
                        {(p?.name?.[0] || "P").toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardMeta}>
                    <p className={styles.name}>
                      {p?.name || "Unnamed Product"}
                    </p>
                    <p className={styles.muted}>
                      {p?.brand || "Brand"} • {p?.category || "Category"}
                    </p>
                  </div>
                </div>

                <div className={styles.cardBottom}>
                  <span className={styles.pill}>
                    {p?.basePrice ? `₹${p.basePrice}` : "—"}
                  </span>
                  <span className={styles.viewHint}>View →</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className={styles.bottomSpace} />
      </div>
    </div>
  );
};

export default Products;

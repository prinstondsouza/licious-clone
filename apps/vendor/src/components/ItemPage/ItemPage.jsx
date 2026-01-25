import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  RefreshCw,
  Pencil,
  Package,
  Tag,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import EditProductModal from "../Inventory/EditProductModal";
import styles from "./ItemPage.module.css";

const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  const [activeImg, setActiveImg] = useState("");
  const [openEdit, setOpenEdit] = useState(false);

  const normalize = (v = "") => String(v).trim().toLowerCase();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ Try vendor product first
      try {
        const vendorRes = await axios.get(`/api/products/vendor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(vendorRes.data.vendorProduct);

        const vendorProduct = vendorRes.data?.vendorProduct || null;

        if (vendorProduct) {
          setProduct(vendorProduct);
          const first =
            vendorProduct?.images?.[0] || vendorProduct?.image || "";
          setActiveImg(first);
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore and try base route
      }

      // ✅ Fallback: base product
      const baseRes = await axios.get(`/api/products/base/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const baseProduct =
        baseRes.data?.baseProduct ||
        baseRes.data?.product ||
        baseRes.data ||
        null;

      setProduct(baseProduct);
      const first = baseProduct?.images?.[0] || baseProduct?.image || "";
      setActiveImg(first);
    } catch (err) {
      console.error("ItemPage Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load product");
      toast.error("Failed to load product", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const images = useMemo(() => {
    const list = product?.images || [];
    if (Array.isArray(list) && list.length > 0) return list;
    if (product?.image) return [product.image];
    return [];
  }, [product]);

  const price = useMemo(() => {
    return product?.price ?? product?.basePrice ?? null;
  }, [product]);

  const stock = useMemo(() => Number(product?.stock ?? 0), [product]);

  const status = useMemo(
    () => normalize(product?.status || "inactive"),
    [product],
  );

  const isOut = stock === 0;
  const isLow = stock > 0 && stock <= 5;

  const stockText = isOut
    ? "Out of Stock"
    : isLow
      ? `Low Stock • ${stock}`
      : `Stock • ${stock}`;

  const stockTone = isOut ? "danger" : isLow ? "warn" : "good";

  const onProductUpdated = (updatedProduct) => {
    if (updatedProduct) {
      setProduct(updatedProduct);
      const first = updatedProduct?.images?.[0] || updatedProduct?.image || "";
      if (first) setActiveImg(first);
    } else {
      fetchProduct();
    }
    setOpenEdit(false);
  };

  // ---- UI states ----
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonMain} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorBox}>
            <p className={styles.errorTitle}>Couldn’t load product</p>
            <p className={styles.errorText}>{error}</p>

            <div className={styles.actions}>
              <button className={styles.backBtn} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
              </button>

              <button className={styles.primaryBtn} onClick={fetchProduct}>
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyBox}>
            <p className={styles.emptyTitle}>Product not found</p>
            <p className={styles.emptyText}>
              It might be deleted or you don’t have access.
            </p>

            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Topbar */}
        <div className={styles.topBar}>
          <div className={styles.leftTop}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              Back
            </button>

            <div>
              <h2 className={styles.title}>Item</h2>
              <p className={styles.subtitle}>Product preview & details</p>
            </div>
          </div>

          <div className={styles.rightTop}>
            <button
              className={styles.secondaryBtn}
              onClick={() => setOpenEdit(true)}
            >
              <Pencil size={16} />
              Edit
            </button>

            <button className={styles.primaryBtn} onClick={fetchProduct}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Main */}
        <div className={styles.mainCard}>
          {/* Left */}
          <div className={styles.left}>
            <div className={styles.imageBox}>
              {activeImg ? (
                <img
                  src={activeImg}
                  alt={product?.name}
                  className={styles.image}
                />
              ) : (
                <div className={styles.fallback}>
                  {(product?.name || "P").toUpperCase()}
                </div>
              )}

              <div
                className={`${styles.badge} ${styles[`badge_${stockTone}`]}`}
              >
                {stockText}
              </div>

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

            {images.length > 1 && (
              <div className={styles.thumbRow}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`${styles.thumbBtn} ${
                      activeImg === img ? styles.thumbActive : ""
                    }`}
                    onClick={() => setActiveImg(img)}
                    type="button"
                  >
                    <img src={img} alt="thumb" className={styles.thumbImg} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right */}
          <div className={styles.right}>
            <div className={styles.headerMeta}>
              <p className={styles.name}>
                {product?.name || "Unnamed Product"}
              </p>

              <div className={styles.pills}>
                <span className={styles.pill}>
                  <Tag size={14} />
                  {product?.category || "Category"}
                </span>

                <span className={styles.pillMuted}>
                  <Layers size={14} />
                  {product?.brand || "Brand"}
                </span>
              </div>
            </div>

            <p className={styles.desc}>
              {product?.description || "No description available."}
            </p>

            <div className={styles.infoGrid}>
              <div className={styles.infoBox}>
                <p className={styles.infoLabel}>Price</p>
                <p className={styles.infoValue}>
                  {price !== null ? `₹${price}` : "—"}
                </p>
              </div>

              <div className={styles.infoBox}>
                <p className={styles.infoLabel}>Stock</p>
                <p className={styles.infoValue}>{stock}</p>
              </div>

              <div className={styles.infoBox}>
                <p className={styles.infoLabel}>Status</p>
                <p className={styles.infoValue}>
                  {status === "active" ? "Active" : "Inactive"}
                </p>
              </div>

              <div className={styles.infoBox}>
                <p className={styles.infoLabel}>ID</p>
                <p className={styles.infoValue}>
                  {String(product?._id).slice(-8)}
                </p>
              </div>
            </div>

            <div className={styles.note}>
              <div className={styles.noteIcon}>
                <Package size={16} />
              </div>
              <div>
                <p className={styles.noteTitle}>Vendor Tip</p>
                <p className={styles.noteText}>
                  Keep stock updated to avoid missing orders and cancellations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Edit modal */}
        {openEdit && (
          <EditProductModal
            product={product}
            onClose={() => setOpenEdit(false)}
            onUpdated={onProductUpdated}
          />
        )}

        <div className={styles.bottomSpace} />
      </div>
    </div>
  );
};

export default ItemPage;

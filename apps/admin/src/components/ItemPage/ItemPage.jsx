import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, RefreshCw, Pencil, Tag, Box, Layers } from "lucide-react";
import EditProductModal from "../Inventory/EditProductModal";
import styles from "./ItemPage.module.css";

const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`/api/products/base/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const productData =
        res.data?.product || res.data?.baseProduct || res.data || null;
      setProduct(productData);
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

  const productImage = useMemo(() => {
    return product?.image || product?.images?.[0] || "";
  }, [product]);

  const displayPrice = useMemo(() => {
    if (!product?.basePrice) return "—";
    return `₹${product.basePrice}`;
  }, [product]);

  const displayCreated = useMemo(() => {
    if (!product?.createdAt) return "-";
    return new Date(product.createdAt).toLocaleString();
  }, [product]);

  const onProductUpdated = (updatedProduct) => {
    // ✅ if your modal returns updated product
    if (updatedProduct) setProduct(updatedProduct);
    else fetchProduct(); // fallback
    setOpenEdit(false);
    toast.success("Product updated!", { position: "top-center" });
  };

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
                <ArrowLeft size={16} />
                Back
              </button>

              <button className={styles.primaryBtn} onClick={fetchProduct}>
                <RefreshCw size={16} />
                Retry
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
              This product may have been removed.
            </p>

            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.leftTop}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              Back
            </button>

            <div>
              <h2 className={styles.title}>Item</h2>
              <p className={styles.subtitle}>View & edit product details</p>
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

        {/* Main Card */}
        <div className={styles.mainCard}>
          <div className={styles.left}>
            <div className={styles.imageBox}>
              {productImage ? (
                <img
                  src={productImage}
                  alt={product?.name}
                  className={styles.image}
                />
              ) : (
                <div className={styles.fallback}>
                  {(product?.name?.[0] || "P").toUpperCase()}
                </div>
              )}
            </div>

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

          <div className={styles.right}>
            <p className={styles.name}>{product?.name || "Unnamed Product"}</p>
            <p className={styles.desc}>
              {product?.description ||
                "No description available for this product."}
            </p>

            <div className={styles.infoGrid}>
              <div className={styles.infoBox}>
                <p className={styles.infoLabel}>Price</p>
                <p className={styles.infoValue}>{displayPrice}</p>
              </div>

              <div className={styles.infoBox}>
                <p className={styles.infoLabel}>Status</p>
                <p className={styles.infoValue}>{product?.status || "—"}</p>
              </div>

              <div className={styles.infoBox}>
                <p className={styles.infoLabel}>SKU</p>
                <p className={styles.infoValue}>{product?.sku || "—"}</p>
              </div>

              <div className={styles.infoBox}>
                <p className={styles.infoLabel}>Created</p>
                <p className={styles.infoValue}>{displayCreated}</p>
              </div>
            </div>

            <div className={styles.note}>
              <div className={styles.noteIcon}>
                <Box size={16} />
              </div>
              <div>
                <p className={styles.noteTitle}>Editable</p>
                <p className={styles.noteText}>
                  Click <b>Edit</b> to update this base product using your
                  modal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {openEdit && (
          <EditProductModal
            product={product}
            onClose={() => setOpenEdit(false)}
            onUpdated={(updatedProduct) => {
              if (updatedProduct) setProduct(updatedProduct);
              else fetchProduct();
            }}
          />
        )}

        <div className={styles.bottomSpace} />
      </div>
    </div>
  );
};

export default ItemPage;

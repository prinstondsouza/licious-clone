import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./EditProductModal.module.css";

const EditProductModal = ({ product, onClose, onUpdated }) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    nextAvailableBy: "",
    status: "active",
  });

  const [newImages, setNewImages] = useState([]); // files
  const [previewUrls, setPreviewUrls] = useState([]); // preview for files
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      nextAvailableBy: product.nextAvailableBy || "",
      status: product.status || "active",
    });

    setNewImages([]);
    setPreviewUrls([]);
  }, [product]);

  // cleanup previews to avoid memory leak
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);

    // limit to 10
    const limited = files.slice(0, 10);

    setNewImages(limited);
    setPreviewUrls(limited.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveSelectedImage = (index) => {
    const updatedFiles = newImages.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);

    setNewImages(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);

      const fd = new FormData();

      // send only what you want to update
      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("stock", form.stock);
      fd.append("nextAvailableBy", form.nextAvailableBy);
      fd.append("status", form.status);

      // images (multer expects "images")
      newImages.forEach((img) => fd.append("images", img));

      await axios.put(`/api/products/vendor/${product._id}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      onUpdated();
      onClose();
    } catch (error) {
      console.log(
        "Error updateProduct:",
        error.response?.data || error.message,
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

        {/* ✅ Name */}
        <div className={styles.field}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        {/* ✅ Category */}
        <div className={styles.field}>
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </div>

        {/* ✅ Description */}
        <div className={styles.field}>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className={styles.textarea}
          />
        </div>

        {/* ✅ Price */}
        <div className={styles.field}>
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
          />
        </div>

        {/* ✅ Stock */}
        <div className={styles.field}>
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
          />
        </div>

        {/* ✅ Next Available By */}
        <div className={styles.field}>
          <label>Next Available By</label>
          <select
            name="nextAvailableBy"
            value={form.nextAvailableBy}
            onChange={handleChange}
          >
            <option value="">-- Select --</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="in-2-days">In 2 Days</option>
            <option value="in-3-days">In 3 Days</option>
            <option value="next-week">Next Week</option>
          </select>
        </div>

        {/* ✅ Status */}
        <div className={styles.field}>
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>

        {/* ✅ Images Upload */}
        <div className={styles.field}>
          <label>Upload New Images (max 10)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
          />
        </div>

        {/* ✅ Preview newly selected images */}
        {previewUrls.length > 0 && (
          <div className={styles.previewWrap}>
            {previewUrls.map((url, idx) => (
              <div key={idx} className={styles.previewItem}>
                <img src={url} alt="preview" className={styles.previewImg} />
                <button
                  type="button"
                  className={styles.removeImgBtn}
                  onClick={() => handleRemoveSelectedImage(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Existing images */}
        {product.images?.length > 0 && (
          <div className={styles.existingWrap}>
            <p className={styles.smallLabel}>Existing Images:</p>
            <div className={styles.previewWrap}>
              {product.images.map((img, idx) => (
                <div key={idx} className={styles.previewItem}>
                  <img src={img} alt="existing" className={styles.previewImg} />
                </div>
              ))}
            </div>
          </div>
        )}

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

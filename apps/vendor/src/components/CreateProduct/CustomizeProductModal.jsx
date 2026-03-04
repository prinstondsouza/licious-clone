
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./CustomizeProductModal.module.css";

const CustomizeProductModal = ({ isOpen, onClose, selectedProduct, onSuccess }) => {
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
  const [deletedImages, setDeletedImages] = useState([]);

  // Initialize form when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setForm({
        name: selectedProduct.name || "",
        category: selectedProduct.category || "",
        description: selectedProduct.description || "",
        price: selectedProduct.basePrice || "",
        stock: "",
        nextAvailableBy: "",
        status: "active",
      });
      // Reset image states
      setNewImages([]);
      setPreviewUrls([]);
      setDeletedImages([]);
    }
  }, [selectedProduct]);

  // Cleanup previews to avoid memory leak
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  if (!isOpen || !selectedProduct) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);

    // Limit to 10
    const limited = files.slice(
      0,
      10 - (selectedProduct?.images?.length || 0) + deletedImages.length
    );

    setNewImages(limited);
    setPreviewUrls(limited.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveSelectedImage = (index) => {
    const updatedFiles = newImages.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);

    // Revoke URL to prevent memory leak
    URL.revokeObjectURL(previewUrls[index]);

    setNewImages(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  const handleRemoveExistingImage = (img) => {
    setDeletedImages((prev) => [...prev, img]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.price || !form.stock) return toast.error("Enter price and stock");

    try {
      setSaving(true);

      const fd = new FormData();

      // Basic product info
      fd.append("baseProductId", selectedProduct._id);
      fd.append("vendorBasePrice", Number(selectedProduct.basePrice));
      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("description", form.description);
      fd.append("price", Number(form.price));
      fd.append("stock", Number(form.stock));
      fd.append("nextAvailableBy", form.nextAvailableBy);
      fd.append("status", form.status);

      // Handle images from base product
      if (selectedProduct.images?.length > 0 && deletedImages.length > 0) {
        const remainingImages = selectedProduct.images.filter(
          (img) => !deletedImages.includes(img)
        );
        fd.append("baseImages", JSON.stringify(remainingImages));
      }

      // New images
      newImages.forEach((img) => fd.append("images", img));

      await axios.post("/api/products/vendor/inventory", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("✅ Product added to your inventory");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.log(
        "Error addFromCatalog:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
        <h3 className={styles.subTitle}>Customize Product</h3>

        <div className={styles.selectedInfo}>
          <div className={styles.selectedTop}>
            <div>
              <p className={styles.selectedName}>{selectedProduct.name}</p>
              <p className={styles.selectedMeta}>
                Base Price: ₹{selectedProduct.basePrice || 0} • Category:{" "}
                {selectedProduct.category}
              </p>
            </div>
          </div>
          <p className={styles.selectedDescription}>
            {selectedProduct.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Product Name */}
          <div className={styles.field}>
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
            />
          </div>

          {/* Category */}
          <div className={styles.field}>
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Enter category"
            />
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Enter product description"
              rows="3"
            />
          </div>

          {/* Price & Stock */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Your Selling Price</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
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
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Enter stock"
              />
            </div>
          </div>

          {/* Next Available By */}
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

          {/* Status */}
          <div className={styles.field}>
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Images Upload */}
          <div className={styles.field}>
            <label>Upload Additional Images (max 10 total)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
            />
            <p className={styles.hint}>
              You can upload additional images or keep the ones below.
            </p>
          </div>

          {/* Preview newly selected images */}
          {previewUrls.length > 0 && (
            <div className={styles.previewWrap}>
              {previewUrls.map((url, idx) => (
                <div key={idx} className={styles.previewItem}>
                  <img
                    src={url}
                    alt="preview"
                    className={styles.previewImg}
                  />
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

          {/* Existing Images from Base Product */}
          {selectedProduct.images?.length > 0 && (
            <div className={styles.existingWrap}>
              <p className={styles.smallLabel}>Images from Catalog:</p>
              <div className={styles.previewWrap}>
                {selectedProduct.images
                  .filter((img) => !deletedImages.includes(img))
                  .map((img, idx) => (
                    <div key={idx} className={styles.previewItem}>
                      <img
                        src={img}
                        alt="existing"
                        className={styles.previewImg}
                      />
                      <button
                        type="button"
                        className={styles.removeImgBtn}
                        onClick={() => handleRemoveExistingImage(img)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
              {deletedImages.length > 0 && (
                <p className={styles.hint}>
                  {deletedImages.length} image(s) will be removed
                </p>
              )}
            </div>
          )}

          <button
            className={styles.submitBtn}
            disabled={saving || !form.price || !form.stock}
          >
            {saving ? "Adding to Inventory..." : "Add to Inventory"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomizeProductModal;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ImagePlus, X, Save } from "lucide-react";
import styles from "./EditProductModal.module.css";

const EditProductModal = ({ product, onClose, onUpdated }) => {
  const token = localStorage.getItem("token");

  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "");
  const [description, setDescription] = useState(product?.description || "");
  const [basePrice, setBasePrice] = useState(product?.basePrice || "");
  const [status, setStatus] = useState(product?.status || "active");

  const [saving, setSaving] = useState(false);

  // new uploads
  const [newFiles, setNewFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // string[]
  const [deletedImages, setDeletedImages] = useState([]); // string[]

  useEffect(() => {
    setName(product?.name || "");
    setCategory(product?.category || "");
    setDescription(product?.description || "");
    setBasePrice(product?.basePrice ?? "");
    setStatus(product?.status || "active");

    setNewFiles([]);
    setPreviews([]);
    setDeletedImages([]);
  }, [product]);

  // cleanup preview blob urls
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const existingImages = useMemo(() => {
    return product?.images || [];
  }, [product]);

  const hasChanges = useMemo(() => {
    const same =
      String(name).trim() === String(product?.name || "").trim() &&
      String(category).trim() === String(product?.category || "").trim() &&
      String(description).trim() ===
        String(product?.description || "").trim() &&
      Number(basePrice || 0) === Number(product?.basePrice || 0) &&
      String(status) === String(product?.status || "active") &&
      newFiles.length === 0 &&
      deletedImages.length === 0;

    return !same;
  }, [
    name,
    category,
    description,
    basePrice,
    status,
    newFiles,
    deletedImages,
    product,
  ]);

  const handlePickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Only images
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      toast.warn("Only image files are allowed", { position: "top-center" });
    }

    // limit to 6 uploads per save (nice UX)
    const merged = [...newFiles, ...imageFiles].slice(0, 6);

    // generate previews
    const nextPreviews = merged.map((f) => URL.createObjectURL(f));

    // cleanup old previews
    previews.forEach((url) => URL.revokeObjectURL(url));

    setNewFiles(merged);
    setPreviews(nextPreviews);

    e.target.value = ""; // reset input
  };

  const removeNewFile = (index) => {
    const nextFiles = [...newFiles];
    nextFiles.splice(index, 1);

    // cleanup current previews and rebuild
    previews.forEach((url) => URL.revokeObjectURL(url));
    const nextPreviews = nextFiles.map((f) => URL.createObjectURL(f));

    setNewFiles(nextFiles);
    setPreviews(nextPreviews);
  };

  const removeExistingImage = (imgUrl) => {
    setDeletedImages((prev) => [...prev, imgUrl]);
  };

  const handleUpdate = async () => {
    try {
      if (!hasChanges) {
        toast.info("No changes to save", { position: "top-center" });
        return;
      }

      if (!String(name).trim()) {
        toast.error("Name is required", { position: "top-center" });
        return;
      }

      if (!String(category).trim()) {
        toast.error("Category is required", { position: "top-center" });
        return;
      }

      setSaving(true);

      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("category", category.trim());
      fd.append("description", description);
      fd.append("basePrice", String(basePrice || 0));
      fd.append("status", status);

      // backend uses req.files (multer) — must match its fieldname.
      // Most common: "images"
      newFiles.forEach((file) => fd.append("images", file));

      if (deletedImages.length > 0) {
        fd.append("deletedImages", JSON.stringify(deletedImages));
      }

      const res = await axios.put(`/api/products/base/${product._id}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          // don't set Content-Type manually; axios sets boundary
        },
      });

      const updated = res.data?.baseProduct || res.data?.product || null;

      toast.success("Product updated successfully", { position: "top-center" });

      if (onUpdated) {
        onUpdated(updated);
      }

      onClose();
    } catch (error) {
      console.log(
        "Error updateProduct:",
        error.response?.data || error.message,
      );
      toast.error(error.response?.data?.message || "Failed to update product", {
        position: "top-center",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.top}>
          <div>
            <h2 className={styles.heading}>Edit Product</h2>
            <p className={styles.productName}>{product?.name || "-"}</p>
          </div>

          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Existing images */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Current Images</p>

          {existingImages.filter((img) => !deletedImages.includes(img))
            .length === 0 ? (
            <div className={styles.emptyImages}>No images uploaded yet.</div>
          ) : (
            <div className={styles.imageRow}>
              {existingImages
                .filter((img) => !deletedImages.includes(img))
                .map((img, idx) => (
                  <div key={idx} className={styles.imageBox}>
                    <img src={img} alt="product" className={styles.image} />
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeExistingImage(img)}
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Upload new images */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionTitle}>Upload New Images</p>
            <span className={styles.helperText}>Max 6</span>
          </div>

          <label className={styles.uploadBtn}>
            <ImagePlus size={16} />
            Add Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePickFiles}
              className={styles.hiddenInput}
            />
          </label>

          {previews.length > 0 && (
            <div className={styles.previewGrid}>
              {previews.map((src, idx) => (
                <div key={idx} className={styles.previewCard}>
                  <img src={src} alt="preview" className={styles.previewImg} />
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeNewFile(idx)}
                    type="button"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fields */}
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
            />
          </div>

          <div className={styles.field}>
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Eg: Fruits, Grocery..."
            />
          </div>

          <div className={styles.field}>
            <label>Base Price</label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className={styles.field}>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write product description..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>

          <button
            className={styles.saveBtn}
            onClick={handleUpdate}
            disabled={saving || !hasChanges}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {!hasChanges && (
          <p className={styles.bottomHint}>Make changes to enable Save.</p>
        )}
      </div>
    </div>
  );
};

export default EditProductModal;

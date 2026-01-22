import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, ImagePlus, X, PlusCircle, RefreshCw } from "lucide-react";
import styles from "./CreateProduct.module.css";

const CreateProduct = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [images, setImages] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // string[]

  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      String(name).trim() &&
      String(category).trim() &&
      String(description).trim() &&
      String(price).trim() &&
      Number(price) > 0 &&
      !saving
    );
  }, [name, category, description, price, saving]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      toast.warn("Only image files are allowed", { position: "top-center" });
    }

    const limited = imageFiles.slice(0, 6);

    // cleanup old previews
    previews.forEach((p) => URL.revokeObjectURL(p));

    const nextPreviews = limited.map((f) => URL.createObjectURL(f));
    setImages(limited);
    setPreviews(nextPreviews);

    e.target.value = "";
  };

  const removeImage = (index) => {
    const next = [...images];
    next.splice(index, 1);

    previews.forEach((p) => URL.revokeObjectURL(p));
    const nextPreviews = next.map((f) => URL.createObjectURL(f));

    setImages(next);
    setPreviews(nextPreviews);
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setDescription("");
    setPrice("");
    setImages([]);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!String(name).trim()) {
      toast.error("Name is required", { position: "top-center" });
      return;
    }
    if (!String(category).trim()) {
      toast.error("Category is required", { position: "top-center" });
      return;
    }
    if (!String(description).trim()) {
      toast.error("Description is required", { position: "top-center" });
      return;
    }
    if (!String(price).trim() || Number(price) <= 0) {
      toast.error("Price must be greater than 0", { position: "top-center" });
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", category.trim());
      formData.append("description", description.trim());
      formData.append("basePrice", String(Number(price)));

      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.post("/api/products/base", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // ⚠️ don't set multipart content-type manually, axios will handle boundary
        },
      });

      toast.success("New base product created ✅", { position: "top-center" });

      resetForm();
      navigate("/products"); // ✅ best UX
    } catch (error) {
      console.log(
        "Error createProduct:",
        error.response?.data || error.message,
      );
      toast.error(error.response?.data?.message || "Failed to create product", {
        position: "top-center",
      });
    } finally {
      setSaving(false);
    }
  };

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
              <h2 className={styles.title}>Create Base Product</h2>
              <p className={styles.subtitle}>
                Add new item to your base catalog
              </p>
            </div>
          </div>

          <div className={styles.rightTop}>
            <button className={styles.secondaryBtn} onClick={resetForm}>
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Form Card */}
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eg: Chicken Breast"
              />
            </div>

            <div className={styles.field}>
              <label>Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Chicken, Fish, Grocery..."
              />
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short description..."
                rows={4}
              />
            </div>

            <div className={styles.field}>
              <label>Base Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
              />
              <p className={styles.hint}>Example: 199, 299</p>
            </div>

            <div className={styles.field}>
              <label>Images</label>

              <label className={styles.uploadBtn}>
                <ImagePlus size={16} />
                Select Images (Max 6)
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.hiddenInput}
                />
              </label>

              {images.length > 0 && (
                <p className={styles.fileText}>
                  {images.length} image(s) selected
                </p>
              )}
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className={`${styles.field} ${styles.full}`}>
                <p className={styles.previewTitle}>Preview</p>

                <div className={styles.previewGrid}>
                  {previews.map((src, idx) => (
                    <div key={idx} className={styles.previewCard}>
                      <img
                        src={src}
                        alt="preview"
                        className={styles.previewImg}
                      />

                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeImage(idx)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate("/products")}
            >
              Cancel
            </button>

            <button className={styles.submitBtn} disabled={!canSubmit}>
              <PlusCircle size={16} />
              {saving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>

        <div className={styles.bottomSpace} />
      </div>
    </div>
  );
};

export default CreateProduct;

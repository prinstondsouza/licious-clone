import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./CreateProduct.module.css";

const CreateProduct = () => {
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [images, setImages] = useState([]); // ✅ files
  const [previewUrls, setPreviewUrls] = useState([]); // ✅ previews

  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    setImages(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  // ✅ cleanup object URLs to avoid memory leak
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);

    setImages(updatedImages);
    setPreviewUrls(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !category || !description || !price || !stock) {
      return alert("Please fill all fields");
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("price", Number(price));
      formData.append("stock", Number(stock));

      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.post("/api/products/vendor/create-new", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("New product created ✅");

      setName("");
      setCategory("");
      setDescription("");
      setPrice("");
      setStock("");

      setImages([]);
      setPreviewUrls([]);
    } catch (error) {
      console.log(
        "Error createProduct:",
        error.response?.data || error.message,
      );
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headRow}>
        <h2 className={styles.title}>Create Your Own Product</h2>
        <Link className={styles.linkBtn} to="/add-from-catalog">
          Add From Catalog
        </Link>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>

        <div className={styles.field}>
          <label>Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Chicken, Fish, etc"
          />
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write short description"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />
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
        </div>

        <div className={styles.field}>
          <label>Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          {images.length > 0 && (
            <p className={styles.fileText}>{images.length} file(s) selected</p>
          )}

          {/* ✅ Preview Grid */}
          {previewUrls.length > 0 && (
            <div className={styles.previewWrap}>
              {previewUrls.map((url, index) => (
                <div key={index} className={styles.previewItem}>
                  <img src={url} alt="preview" className={styles.previewImg} />

                  <button
                    type="button"
                    className={styles.removeImgBtn}
                    onClick={() => handleRemoveImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className={styles.submitBtn} disabled={saving}>
          {saving ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;

import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./CreateProduct.module.css";

const CreateProduct = () => {
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);

  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !category || !description || !price) {
      return alert("Please fill all fields");
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("basePrice", Number(price));

      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.post("/api/products/base", formData, {
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
      setImages([]);
    } catch (error) {
      console.log(
        "Error createProduct:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div>
      <h2 className={styles.title}>Create Your Own Base Product</h2>
      <Link to="/add-from-catalog">Add From Catalog</Link>
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
            <label>Base Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Images</label>
          <input type="file" multiple onChange={handleImageChange} />
          {images.length > 0 && (
            <p className={styles.fileText}>{images.length} file(s) selected</p>
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

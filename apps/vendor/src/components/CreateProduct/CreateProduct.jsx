import React, { useState } from "react";
import axios from "axios";
import styles from "./CreateProduct.module.css";

const CreateProduct = () => {
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);

  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
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
    } catch (error) {
      console.log("Error createProduct:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Your Own Product</h2>

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

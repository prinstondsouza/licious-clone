import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./CategoriesModal.module.css";
import {
  CATEGORY_IMAGES,
  CATEGORY_SUBCATEGORIES,
  FALLBACK_IMAGE,
} from "../../utils/categoryData";

const CategoriesModal = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Chicken");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/products/vendor");
        const products = res.data.vendorProducts || [];
        const uniqueCategories = [...new Set(products.map((p) => p.category))];

        const categoryObjects = uniqueCategories.map((category) => ({
          name: category,
          image: CATEGORY_IMAGES[category] || FALLBACK_IMAGE,
          subcategories: CATEGORY_SUBCATEGORIES[category] || ["All Products"],
        }));

        setCategories(categoryObjects);
        if (
          categoryObjects.length > 0 &&
          !categoryObjects.find((c) => c.name === activeCategory)
        ) {
          setActiveCategory(categoryObjects[0].name);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  const activeCategoryData = categories.find((c) => c.name === activeCategory);

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.modalContainer}>
        <div className={styles.sidebar}>
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`${styles.categoryItem} ${
                activeCategory === cat.name ? styles.active : ""
              }`}
              onMouseEnter={() => setActiveCategory(cat.name)}
              onClick={() => setActiveCategory(cat.name)}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className={styles.categoryIcon}
              />
              <span className={styles.categoryName}>{cat.name}</span>
            </div>
          ))}
        </div>
        <div className={styles.content}>
          <ul className={styles.subList}>
            {activeCategoryData?.subcategories.map((sub, index) => (
              <li key={index} className={styles.subItem}>
                <Link
                  to={`/categories?category=${encodeURIComponent(activeCategory)}&subcategory=${encodeURIComponent(sub)}`}
                  onClick={onClose}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {sub}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default CategoriesModal;

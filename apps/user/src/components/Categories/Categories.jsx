import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../Product/ProductCard";
import { getProductQuantity } from "../../utils/cartUtils";
import styles from "./Categories.module.css";
import { useCart } from "../../context/CartContext"

// Category Button Component
const CategoryButton = ({ category, isSelected, onClick }) => {
  return (
    <button
      className={`${styles.categoryButton} ${isSelected ? styles.categoryButtonSelected : ""}`}
      onClick={onClick}
    >
      {category.name}
    </button>
  );
};

// Main Component
const Categories = () => {
  const { cart } = useCart();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    if (categoryName === "all") {
      setCategoryItems(allProducts);
    } else {
      const filteredItems = allProducts.filter(
        (item) => item.category === categoryName
      );
      setCategoryItems(filteredItems);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/products/vendor");
        const products = res.data.vendorProducts;
        setAllProducts(products);

        const uniqueCategories = [
          ...new Set(products.map((item) => item.category)),
        ];

        const categoryObjects = uniqueCategories.map((category, index) => ({
          id: index,
          name: category,
        }));

        setCategories(categoryObjects);
        setCategoryItems(products);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading categories...</div>;
  }

  return (
    <div className={styles.categoriesContainer}>
      {/* Categories Sidebar */}
      <div className={styles.categoriesSidebar}>
        <h2>Categories</h2>
        <div className={styles.categoriesList}>
          <CategoryButton
            category={{ name: "All Products" }}
            isSelected={!selectedCategory || selectedCategory === "all"}
            onClick={() => handleCategoryClick("all")}
          />
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.name}
              onClick={() => handleCategoryClick(category.name)}
            />
          ))}
        </div>
      </div>

      {/* Products Display */}
      <div className={styles.productsDisplay}>
        <h2>
          {selectedCategory && selectedCategory !== "all"
            ? `Products in ${selectedCategory} (${categoryItems.length})`
            : `All Products (${categoryItems.length})`}
        </h2>

        {categoryItems.length === 0 ? (
          <p className={styles.noProducts}>No products found in this category.</p>
        ) : (
          <div className={styles.productsGrid}>
            {categoryItems.map((item) => (
              <div key={item._id}>
                <ProductCard
                  product={item}
                  quantity={getProductQuantity(cart, item._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
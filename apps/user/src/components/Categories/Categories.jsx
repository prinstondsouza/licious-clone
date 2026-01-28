import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../Product/ProductCard";
import { getProductQuantity } from "../../utils/cartUtils";
import { useCart } from "../../context/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import CategoryIconsGrid from "./CategoryIconsGrid";
import styles from "./Categories.module.css";

const Categories = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedFromUrl = searchParams.get("category") || "all";

  const [loading, setLoading] = useState(true);
  const [categoryItems, setCategoryItems] = useState([]);

  const fetchProducts = async (category) => {
    try {
      setLoading(true);

      const url =
        category === "all"
          ? "/api/products/vendor"
          : `/api/products/vendor?category=${encodeURIComponent(category)}`;

      const res = await axios.get(url);
      const products = res.data.vendorProducts || [];
      setCategoryItems(products);
    } catch (error) {
      console.error("Categories fetch error:", error);
      setCategoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFromUrl]);

  const onSelectCategory = (category) => {
    if (category === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }

    // optional smooth scroll (nice UX)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.page}>
      {/* ✅ category icons top */}
      <CategoryIconsGrid
        selectedCategory={selectedFromUrl}
        onSelectCategory={onSelectCategory}
      />

      {/* ✅ products */}
      <div className={styles.productsSection}>
        <div className={styles.productsHeader}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>

          <h2 className={styles.productsTitle}>
            {selectedFromUrl === "all"
              ? `All Products (${categoryItems.length})`
              : `${selectedFromUrl} (${categoryItems.length})`}
          </h2>
        </div>

        {loading ? (
          <p className={styles.loading}>Loading products...</p>
        ) : categoryItems.length === 0 ? (
          <p className={styles.noProducts}>
            No products found in this category.
          </p>
        ) : (
          <div className={styles.productsGrid}>
            {categoryItems.map((item) => (
              <div
                key={item._id}
                className={item.stock === 0 ? styles.unavailable : ""}
              >
                <div className={item.stock === 0 ? styles.outOfStock : ""}>
                  {item.stock === 0 && (
                    <div className={styles.outOfStockTxt}>Out of Stock</div>
                  )}
                  <ProductCard
                    product={item}
                    quantity={getProductQuantity(cart, item._id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;

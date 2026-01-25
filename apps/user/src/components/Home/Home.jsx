import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CategoryIconsGrid from "../Categories/CategoryIconsGrid";
import ProductCard from "../Product/ProductCard";
import { getProductQuantity } from "../../utils/cartUtils";
import styles from "./Home.module.css";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";

const Home = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  const { user } = useUser();
  const fname = user?.firstName;

  const [items, setItems] = useState([]);

  useEffect(() => {
    axios
      .get("/api/products/vendor")
      .then((response) => {
        setItems(response.data.vendorProducts || response.data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const availableItems = items.filter((i) => i.stock !== 0);

  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeText}>Hi, {fname ? fname : "Guest"} 👋</h1>

      <h2 className={styles.sectionTitle}>Products</h2>

      <div className={styles.productGrid}>
        {availableItems.map((item) => (
          <div key={item._id} className={styles.cardWrapper}>
            <ProductCard
              product={item}
              quantity={getProductQuantity(cart, item._id)}
            />
          </div>
        ))}
      </div>

      <hr
        style={{ border: "0", borderTop: "1px solid #eee", margin: "40px 0" }}
      />

      <h2 className={styles.heading}>Shop by categories</h2>
      <p className={styles.para}>Freshest meats just for you</p>

      <hr className={styles.hr} />

      <CategoryIconsGrid
        selectedCategory="all"
        onSelectCategory={(category) => {
          if (category === "all") navigate("/categories");
          else navigate(`/categories?category=${encodeURIComponent(category)}`);
        }}
      />
    </div>
  );
};

export default Home;

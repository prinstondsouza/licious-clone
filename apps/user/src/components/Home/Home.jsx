import React, { useEffect, useState } from "react";
import axios from "axios";
import Categories from "../Categories/Categories";
import ProductCard from "../Product/ProductCard";
import { getProductQuantity } from "../../utils/cartUtils";
import styles from "./Home.module.css";
import { useCart } from "../../context/CartContext";

const Home = () => {
  const { cart } = useCart();
  const [items, setItems] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    axios
      .get("/api/products/vendor")
      .then((response) => {
        setItems(response.data.vendorProducts || response.data);
      })
      .catch((error) => console.error("Error fetching products:", error));

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeText}>
        Hi, {username ? username : "Guest"} 👋
      </h1>

      <h2 className={styles.sectionTitle}>Fresh Cuts (Base Products)</h2>

      <div className={styles.productGrid}>
        {items.map((item) => (
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

      <Categories />
    </div>
  );
};

export default Home;

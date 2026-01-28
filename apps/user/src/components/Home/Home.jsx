import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CategoryIconsGrid from "../Categories/CategoryIconsGrid";
import ProductCard from "../Product/ProductCard";
import { getProductQuantity } from "../../utils/cartUtils";
import styles from "./Home.module.css";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  const { user, fetchUser } = useUser();
  const fname = user?.firstName;

  const [items, setItems] = useState([]);

  const gridRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [localStorage.token]);

  const updateScrollButtons = () => {
    const el = gridRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

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

      <div className={styles.carouselWrapper}>
        {canScrollLeft && (
          <button
            className={`${styles.carouselArrow} ${styles.leftArrow}`}
            onClick={() => {
              gridRef.current.scrollBy({ left: -320, behavior: "smooth" });
            }}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {canScrollRight && (
          <button
            className={`${styles.carouselArrow} ${styles.rightArrow}`}
            onClick={() => {
              gridRef.current.scrollBy({ left: 320, behavior: "smooth" });
            }}
          >
            <ChevronRight size={22} />
          </button>
        )}

        <div
          className={styles.productGrid}
          ref={gridRef}
          onScroll={updateScrollButtons}
        >
          {availableItems.map((item) => (
            <div key={item._id} className={styles.cardWrapper}>
              <ProductCard
                product={item}
                quantity={getProductQuantity(cart, item._id)}
              />
            </div>
          ))}
        </div>
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

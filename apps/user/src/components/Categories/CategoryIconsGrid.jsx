import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./CategoryIconsGrid.module.css";

const CategoryIconsGrid = ({ selectedCategory = "all", onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ same images you provided
  const CATEGORY_IMAGES = {
    "Today's Deal":
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/cb6e4eb8-6aec-7872-1638-0c2cf7970b71/original/Todays_Deals.png",
    Chicken:
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/34466dbd-a515-edd1-3e99-05000f217cb6/original/Chicken_(2).png",
    "Fish & Seafood":
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/caac432f-545f-f03f-ce10-3b911916da70/original/FIsh_(1).png",
    Fish: "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/caac432f-545f-f03f-ce10-3b911916da70/original/FIsh_(1).png",
    Mutton:
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/3a3d173d-5537-dafc-0be4-dec0791dcd24/original/MUT.png",
    "Ready to Cook":
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/21653c3a-4d6d-da71-2432-6833b88e9629/original/RC.png",
    Prawns:
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/f4053965-f199-80a0-2551-d85d712574e2/original/Prawn_(2).png",
    "Cold Cuts":
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/49a8dd0c-7254-0b89-b348-b57281c76f5a/original/Coldcuts_(2).png",
    Spreads:
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/d9a97969-ebd7-977c-e676-b343a18d7318/original/SPD.png",
    Eggs: "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/1bd08fae-c971-390a-ce8a-6f6502f5bd0d/original/Eggs_(1).png",
    "Biryani & Kebab":
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/0b7ccd0f-0811-c38b-5420-0317c8006bda/original/Biryani_(2).png",
    Combos:
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/69b72338-4180-2631-b175-04265b1e5c7a/original/Combo_(2).png",
    "Plant-Based-Meat":
      "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/66e49926-d949-dfb3-2e79-8052d07f0a3b/original/PBM_6_(8).png",
  };

  const fallbackImage =
    "https://dao54xqhg9jfa.cloudfront.net/OMS-Category/34466dbd-a515-edd1-3e99-05000f217cb6/original/Chicken_(2).png";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        // ✅ fetch all once just to build category list
        const res = await axios.get("/api/products/vendor");
        const products = res.data.vendorProducts || [];

        const uniqueCategories = [...new Set(products.map((p) => p.category))];

        const categoryObjects = uniqueCategories.map((category, index) => ({
          id: index,
          name: category,
          image: CATEGORY_IMAGES[category] || fallbackImage,
        }));

        setCategories(categoryObjects);
      } catch (err) {
        console.log(
          "CategoryIconsGrid Error:",
          err.response?.data || err.message,
        );
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
    <div className={styles.secondMainbox}>
      <div className={styles.firstDiv}>
        <h2 className={styles.heading}>Shop by categories</h2>
        <p className={styles.para}>Freshest meats just for you</p>

        <hr className={styles.hr} />

        <div className={styles.inner}>
          {/* ✅ All products */}
          <button
            type="button"
            onClick={() => onSelectCategory?.("all")}
            className={`${styles.catItem} ${
              selectedCategory === "all" ? styles.catActive : ""
            }`}
          >
            <img
              src="https://dao54xqhg9jfa.cloudfront.net/OMS-Category/cb6e4eb8-6aec-7872-1638-0c2cf7970b71/original/Todays_Deals.png"
              alt="All Products"
            />
            <p>All Products</p>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory?.(cat.name)}
              className={`${styles.catItem} ${
                selectedCategory === cat.name ? styles.catActive : ""
              }`}
            >
              <img src={cat.image} alt={cat.name} />
              <p>{cat.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryIconsGrid;

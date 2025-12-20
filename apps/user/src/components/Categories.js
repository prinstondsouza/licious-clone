import { useState, useEffect } from "react";
import axios from "axios";

import ProductCard from "./ProductCard";

// Category Button Component
const CategoryButton = ({ category, isSelected, onClick }) => {
  return (
    <button
      className={`category-button ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      {category.name}
    </button>
  );
};

// Main Component
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const addToCart = async (vendorProductId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/cart/add",
        {
          vendorProductId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Item added to cart!");
    } catch (error) {
      console.error(
        "Add to cart error:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Failed to add item");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/products/vendor");
        const products = res.data.vendorProducts;
        setAllProducts(products);

        // Get unique categories
        const uniqueCategories = [
          ...new Set(products.map((item) => item.category)),
        ];

        // Store categories as objects with name
        const categoryObjects = uniqueCategories.map((category, index) => ({
          id: index,
          name: category,
        }));

        setCategories(categoryObjects);

        // Initially show all products
        setCategoryItems(products);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);

    if (categoryName === "all") {
      setCategoryItems(allProducts);
    } else {
      // Filter products by selected category
      const filteredItems = allProducts.filter(
        (item) => item.category === categoryName
      );
      setCategoryItems(filteredItems);
    }
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="categories-container">
      {/* Categories Sidebar */}
      <div className="categories-sidebar">
        <h2>Categories</h2>
        <div className="categories-list">
          <CategoryButton
            category={{ name: "All Products" }}
            isSelected={!selectedCategory}
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
      <div className="products-display">
        <h2>
          {selectedCategory && selectedCategory !== "all"
            ? `Products in ${selectedCategory} (${categoryItems.length})`
            : `All Products (${categoryItems.length})`}
        </h2>

        {categoryItems.length === 0 ? (
          <p className="no-products">No products found in this category.</p>
        ) : (
          <div className="products-grid">
            {categoryItems.map((item) => (
              <ProductCard
                addToCart={() => addToCart(item._id)}
                product={item}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add some CSS (either in a separate file or in a style tag)
const styles = `
  .categories-container {
    display: flex;
    gap: 2rem;
    padding: 1rem;
  }
  
  .categories-sidebar {
    min-width: 200px;
  }
  
  .categories-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .category-button {
    text-align: left;
    padding: 0.75rem 1rem;
    background-color: #f8f9fa;
    color: #212529;
    border: 1px solid #dee2e6;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    font-size: 1rem;
  }
  
  .category-button:hover {
    background-color: #e9ecef;
    transform: translateY(-1px);
  }
  
  .category-button.selected {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  .products-display {
    flex: 1;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .product-card {
    border: 1px solid #dee2e6;
    border-radius: 10px;
    padding: 1.25rem;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .product-card h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #212529;
  }
  
  .product-category {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
  
  .product-description {
    color: #495057;
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .product-price {
    color: #007bff;
    font-size: 1.25rem;
  }
  
  .product-status {
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .product-status.active {
    background-color: #28a745;
  }
  
  .product-status.inactive {
    background-color: #dc3545;
  }
  
  .product-stock {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #6c757d;
  }
  
  .no-products {
    color: #6c757d;
    font-style: italic;
    padding: 2rem;
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 8px;
  }
  
  .loading {
    padding: 2rem;
    text-align: center;
    color: #6c757d;
  }
`;

// Add the styles to the document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Categories;

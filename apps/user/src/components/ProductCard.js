import { Link } from "react-router-dom";
import axios from "axios";

const ProductCard = ({ product }) => {
  const addToCart = async (vendorProductId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in to add items to your cart.");
        window.location.href = "/login";
        return;
      }

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

  return (
    <div className="product-card">
      <Link
        to={`/product/${product._id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {product.images && product.images[0] && (
          <img
            src={product.images[0] || product.images}
            alt={product.name}
            style={{ width: "100%", height: "150px", objectFit: "cover" }}
          />
        )}
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <strong style={{ fontWeight: "bold", color: "#d92662" }}>
          ₹{product.price || product.basePrice || "N/A"}
        </strong>
      </Link>

      <button
        onClick={() => addToCart(product._id)}
        style={{
          backgroundColor: "#d92662",
          color: "white",
          border: "none",
          padding: "10px",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
          marginTop: "10px",
        }}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;

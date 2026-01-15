import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./ItemPage.module.css"
import { toast } from "react-toastify";

const ItemPage = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cart, setCart] = useState();

  const addToCart = async (vendorProductId) => {
    try {
      setUpdating(true);

      if (!token) {
        toast.info("Please login to add items to your Cart!", {
          position: "top-center",
        });
        navigate("/");
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
      setCart(res.data.cart);

      toast.info("Item added to cart!", {
        position: "top-center",
        closeOnClick: true,
      });

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item");
    } finally {
      setUpdating(false);
    }
  };

  const removeOneFromCart = async (vendorProductId) => {
    try {
      setUpdating(true);

      if (!token) {
        toast.error("Please login to remove items from your Cart!", {
          position: "top-center",
        });
        navigate("/");
        return;
      }

      const res = await axios.post(
        "/api/cart/remove",
        {
          vendorProductId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCart(res.data.cart);

      toast.info("Item removed from cart!", {
        position: "top-center",
        closeOnClick: true,
      });

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`/api/products/vendor/${productId}`);
        setProductDetails(response.data.vendorProduct || response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return <div className={styles.loading}>Loading product details...</div>;
  }

  if (!productDetails) {
    return (
      <div className={styles.container}>
        <h2>Product not found.</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.productWrapper}>
        <div className={styles.imageSection}>
          <img
            src={productDetails.images[0]}
            alt={productDetails.name}
            className={styles.productImage}
          />
        </div>
        <div className={styles.infoSection}>
          <h2 className={styles.title}>{productDetails.name}</h2>
          <div className={styles.description}>
            <p>
              {productDetails.description ||
                "No description provided for this product."}
            </p>
          </div>
          <div className={styles.priceAndAddBtn}>
            <p className={styles.price}>₹{productDetails.price}</p>
            {/* <QuantityButton
              // qty={getProductQuantity(cart, productDetails._id)}
              loading={updating}
              onAdd={(qty) => addToCart(productDetails._id)}
              onRemove={(qty) => removeOneFromCart(productDetails._id)}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemPage;

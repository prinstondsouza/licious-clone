import { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredOrderId, setHoveredOrderId] = useState(null); // Track which order date is hovered

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
    const storedEmail = localStorage.getItem("email");
    setEmail(storedEmail);
    const storedPhone = localStorage.getItem("phone");
    setPhone(storedPhone);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Assuming the response contains an array of orders
        const ordersData = response.data.orders || response.data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setError(null);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again later.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format date if your order objects have date properties
  const formatDateAndTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Handle future dates (just in case)
    if (diffInSeconds < 0) return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // For recent times, show relative format
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInSeconds / 3600);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    // For older dates (7+ days ago), show date and time
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get full date and time
  const getFullDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Format currency if your order objects have price/total properties
  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "N/A";
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2>{username || "Not available"}</h2>
        <p>
          {phone || "Not available"} | {email || "Not available"}
        </p>
      </div>

      <div>
        <h3>Order History</h3>

        {loading ? (
          <p>Loading orders...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {orders.map((order, index) => {
              const orderId = order.id || order._id || `order-${index}`;
              const dateString = order.createdAt || order.date;
              
              return (
                <li
                  key={orderId}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 10px 0" }}>
                        Order #{order._id || `ORD${index + 1}`}
                      </h4>
                      <p style={{ margin: "5px 0" }}>
                        <strong>Date:</strong>{" "}
                        <span
                          onMouseEnter={() => setHoveredOrderId(orderId)}
                          onMouseLeave={() => setHoveredOrderId(null)}
                          style={{ 
                            cursor: "pointer",
                            transition: "color 0.2s",
                            color: hoveredOrderId === orderId ? "#007bff" : "inherit"
                          }}
                        >
                          {hoveredOrderId === orderId 
                            ? getFullDateTime(dateString)
                            : formatDateAndTime(dateString)
                          }
                        </span>
                      </p>
                      <p style={{ margin: "5px 0" }}>
                        <strong>Status:</strong>
                        <span
                          style={{
                            color:
                              order.status === "out-for-delivery"
                                ? "green"
                                : order.status === "confirmed"
                                ? "blue"
                                : order.status === "delivered"
                                ? "darkgreen"
                                : order.status === "pending"
                                ? "orange"
                                : order.status === "cancelled"
                                ? "red"
                                : "black",
                            marginLeft: "5px",
                          }}
                        >
                          {order.status || "Unknown"}
                        </span>
                      </p>
                      <p style={{ margin: "5px 0" }}>
                        <strong>Total:</strong>{" "}
                        {formatCurrency(
                          order.totalPrice || order.total || order.price
                        )}
                      </p>

                      {/* Display order items if available */}
                      {order.items && order.items.length > 0 && (
                        <div style={{ marginTop: "10px" }}>
                          <strong>Items:</strong>
                          <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                            {order.items.slice(0, 3).map((item, idx) => (
                              <li key={idx}>
                                {item.name || item.productName} ×{" "}
                                {item.quantity || 1}
                              </li>
                            ))}
                            {order.items.length > 3 && (
                              <li>...and {order.items.length - 3} more items</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Order actions or additional info */}
                    <div>
                      <button
                        style={{
                          padding: "5px 15px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          // Handle view order details
                          console.log("View order:", order);
                          // You can implement a modal or navigation to order details
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Profile;
import React from "react";

const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "500px",
  maxHeight: "80vh",
  overflowY: "auto",
};

const closeBtnStyle = {
  float: "right",
  background: "red",
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "5px 10px",
  cursor: "pointer",
};

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeBtnStyle} onClick={onClose}>
          X
        </button>

        <h3>Order Details</h3>
        <hr />

        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Total Price:</strong> ₹{order.totalPrice}
        </p>
        <p>
          <strong>Delivery Address:</strong> {order.deliveryAddress}
        </p>

        <p>
          <strong>Created At:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default OrderDetailsModal;

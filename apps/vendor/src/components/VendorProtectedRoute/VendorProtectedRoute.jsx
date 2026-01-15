import React from "react";
import { Navigate } from "react-router-dom";

const VendorProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const status = localStorage.getItem("status");

  if (!token) {
    return <Navigate to="/register" replace />;
  }


  if (role && role !== "vendor") {
    return <Navigate to="/register" replace />;
  }

  if (status && status !== "approved") {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default VendorProtectedRoute;

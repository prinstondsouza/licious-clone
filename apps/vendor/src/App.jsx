import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Register from "./components/Register/Register";
import VendorDashboard from "./components/VendorDashboard/VendorDashboard";
import Profile from "./components/Profile/Profile";
import ItemPage from "./components/ItemPage/ItemPage";
import LoginSidebar from "./components/Login/LoginSidebar";
import InventoryList from "./components/Inventory/InventoryList";
import CreateProduct from "./components/CreateProduct/CreateProduct";
import AddFromCatalog from "./components/CreateProduct/AddFromCatalog";
import VendorOrders from "./components/Orders/VendorOrders";
import OrderDetails from "./components/Orders/OrderDetails";
import PendingApproval from "./components/PendingApproval/PendingApproval";

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

function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <Router>
      <div className="App">
        <Navbar onLoginClick={() => setLoginOpen(true)} />

        <LoginSidebar isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

        <ToastContainer />

        <div style={{ padding: "20px" }}>
          <Routes>
            <Route
              path="/"
              element={
                <VendorProtectedRoute>
                  <VendorDashboard />
                </VendorProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <VendorProtectedRoute>
                  <Profile />
                </VendorProtectedRoute>
              }
            />

            <Route
              path="/inventory"
              element={
                <VendorProtectedRoute>
                  <InventoryList />
                </VendorProtectedRoute>
              }
            />

            <Route
              path="/create-product"
              element={
                <VendorProtectedRoute>
                  <CreateProduct />
                </VendorProtectedRoute>
              }
            />

            <Route
              path="/add-from-catalog"
              element={
                <VendorProtectedRoute>
                  <AddFromCatalog />
                </VendorProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <VendorProtectedRoute>
                  <VendorOrders />
                </VendorProtectedRoute>
              }
            />

            <Route path="/orders/:id" element={<OrderDetails />} />

            <Route
              path="/register"
              element={<Register onLoginClick={() => setLoginOpen(true)} />}
            />

            <Route path="/product/:id" element={<ItemPage />} />

            <Route
              path="/pending-approval"
              element={
                <PendingApproval onLoginClick={() => setLoginOpen(true)} />
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

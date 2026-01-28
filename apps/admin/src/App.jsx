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
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import ItemPage from "./components/ItemPage/ItemPage";
import LoginSidebar from "./components/Login/LoginSidebar";
import Products from "./components/Inventory/Products";
import CreateProduct from "./components/CreateProduct/CreateProduct";
import AddFromCatalog from "./components/CreateProduct/AddFromCatalog";
import AdminOrders from "./components/AdminOrders/AdminOrders";
import Users from "./components/Users/Users";
import Vendors from "./components/Vendors/Vendors";
import VendorDetailsPage from "./components/Vendors/VendorDetailsPage";
import CreateVendor from "./components/Vendors/CreateVendor";
import DeliveryPartners from "./components/DeliveryPartners/DeliveryPartners";
import UserProfile from "./components/Users/UserProfile";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/register" replace />;
  }

  if (role && role !== "admin") {
    return <Navigate to="/register" replace />;
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
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/create-product"
              element={
                <AdminProtectedRoute>
                  <CreateProduct />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/add-from-catalog"
              element={
                <AdminProtectedRoute>
                  <AddFromCatalog />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <AdminProtectedRoute>
                  <AdminOrders />
                </AdminProtectedRoute>
              }
            />

            <Route path="/users" element={<Users />} />

            <Route path="/vendors" element={<Vendors />} />

            <Route path="/vendors/:id" element={<VendorDetailsPage />} />

            <Route path="/create-vendor" element={<CreateVendor />} />

            <Route path="/delivery" element={<DeliveryPartners />} />

            <Route
              path="/register"
              element={<Register onLoginClick={() => setLoginOpen(true)} />}
            />

            <Route path="/product/:id" element={<ItemPage />} />

            <Route path="/users/:id" element={<UserProfile />} />

            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ItemPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

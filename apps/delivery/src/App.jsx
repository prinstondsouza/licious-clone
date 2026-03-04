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
import DeliveryDashboard from "./components/DeliveryDashboard/DeliveryDashboard";
import LoginSidebar from "./components/Login/LoginSidebar";
import MyOrders from "./components/MyOrders/MyOrders";
import Profile from "./components/Profile/Profile";

const DeliveryProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/register" replace />;
  }

  if (role && role !== "deliveryPerson") {
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
                <DeliveryProtectedRoute>
                  <DeliveryDashboard />
                </DeliveryProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <DeliveryProtectedRoute>
                  <MyOrders />
                </DeliveryProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <DeliveryProtectedRoute>
                  <Profile />
                </DeliveryProtectedRoute>
              }
            />

            <Route
              path="/register"
              element={<Register onLoginClick={() => setLoginOpen(true)} />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your components
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Cart from "./components/Cart";
import Categories from "./components/Categories";
import Stores from "./components/Stores";
import Profile from "./components/Profile";
// import other components as needed
// import AdminDashboard from "./components/AdminDashboard";
// import VendorDashboard from "./components/VendorDashboard";
// import DeliveryDashboard from "./components/DeliveryDashboard";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/profile" element={<Profile/>} /> 
            {/* <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/deliveryPerson" element={<DeliveryDashboard />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

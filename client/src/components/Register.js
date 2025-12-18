import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    latitude: 12.9716, // Hardcoded for now (Bangalore)
    longitude: 77.5946 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST request to your backend
      const res = await axios.post('/api/auth/user/register', formData);
      console.log('Registration Success:', res.data);
      alert('Registration Successful! Please Login.');
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Registration Error:', error.response?.data || error.message);
      alert('Registration Failed: ' + (error.response?.data?.message || 'Server Error'));
    }
  };

  // Simple CSS for the form
  const inputStyle = { display: 'block', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#d92662' }}>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} style={inputStyle} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} style={inputStyle} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} style={inputStyle} required />
        <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} style={inputStyle} required />
        <textarea name="address" placeholder="Address" onChange={handleChange} style={inputStyle} required />
        
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#d92662', color: 'white', border: 'none', cursor: 'pointer' }}>
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Register;
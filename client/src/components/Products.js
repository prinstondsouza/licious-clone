// client/src/components/Products.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Products = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get('/api/products/base')
      .then(response => {
        // 1. INSPECT THE DATA
        console.log("Full Backend Response:", response.data);
        setItems(response.data.baseProducts);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h2>All Products</h2>
      
      {/* 3. SAFETY CHECK: Only map if it is an array */}
      {Array.isArray(items) && items.length > 0 ? (
        items.map(item => (
          <div key={item._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
             {/* Use optional chaining (?.) just in case name is missing */}
             <h3>{item.name || "No Name"}</h3>
             <p>₹{item.basePrice || "notFound"}</p>
             <p>{item.description || "descNotFound"}</p>
             <p>{item.createdBy || "createdbyNotFound"}</p>
             <p>{item.status || "statusNotFound"}</p>
             <p>{item.category || "catNotFound"}</p>
          </div>
        ))
      ) : (
        <p>Loading products or no products found...</p>
      )}
    </div>
  );
};

export default Products;
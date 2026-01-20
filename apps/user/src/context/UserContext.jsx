import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(
    localStorage.getItem("selectedAddressId") || "",
  );

  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setAddresses([]);
      setSelectedAddressId("");
      localStorage.removeItem("selectedAddressId");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedUser = res?.data?.user || null;
      const fetchedAddresses = fetchedUser?.addresses || [];

      setUser(fetchedUser);
      setAddresses(fetchedAddresses);

      if (!selectedAddressId && fetchedAddresses.length > 0) {
        const firstId = fetchedAddresses[0]._id;
        setSelectedAddressId(firstId);
        localStorage.setItem("selectedAddressId", firstId);
      }
    } catch (err) {
      console.log("Fetch user error:", err.response?.data || err.message);
      setUser(null);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (selectedAddressId) {
      localStorage.setItem("selectedAddressId", selectedAddressId);
    }
  }, [selectedAddressId]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setAddresses([]);
    setSelectedAddressId("");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        addresses,
        setAddresses,
        selectedAddressId,
        setSelectedAddressId,
        loading,
        fetchUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

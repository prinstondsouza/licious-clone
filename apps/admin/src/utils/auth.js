import { jwtDecode } from "jwt-decode";

export const getUserTypeFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode(token);
    return decoded.userType || "user";
  } catch (err) {
    return null;
  }
};
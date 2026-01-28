// Admin dashboard welcome route
export const adminDashboard = (req, res) => {
  res.json({
    message: "Welcome Admin",
    user: req.user
  });
};

// Get all vendors
export const getVendors = (req, res) => {
  res.json({ message: "List of all vendors will come here" });
};

// Get all delivery agents
export const getDeliveryPartners = (req, res) => {
  res.json({ message: "List of all delivery partners will come here" });
};

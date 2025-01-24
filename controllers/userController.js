const User = require("../models/User");

// Get all users for ranking
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users sorted by clickCount in descending order
    const users = await User.find({}, "username clickCount isActive").sort({ clickCount: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: "server error", error: err.message});
  }
};



// Get a specific user's details
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch user by ID
    const user = await User.findById(id, "username clickCount isActive");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Server Error" , error: err.message});
  }
};

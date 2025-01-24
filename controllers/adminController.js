const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
     res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" , error: err.message});
  }
};


exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" , error: err.message});
  }
};

exports.toggleUserBlocked = async (req, res) => {
    try {
      
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      user.blocked = !user.blocked;
  
      await user.save();

      res.json({ message: user.blocked ? "User blocked" : "User unblocked", user });
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  };
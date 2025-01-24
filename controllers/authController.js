const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.log(err)
    res.status(500).json({error: err.message});
  }
};


exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      if (user.blocked) {
        return res.status(403).json({ message: "Your account is blocked" });
      }
  
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      const token = jwt.sign({ userId: user._id, role: user.role }, 'SECRET123', {
        expiresIn: "7d",
      });
  
      res.json({ token, user });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Error logging in user", error: err.message });
    }
  };
  

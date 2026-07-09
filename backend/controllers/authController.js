const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ role added to token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });

    // If registering as patient, auto-create Patient record
    if (user.role === "patient") {
      const Patient = require("../models/Patient");
      await Patient.create({
        name: user.name,
        age: 0,          // default, receptionist can update later
        gender: "male",  // default
        contact: email,  // use email as contact placeholder
        createdBy: user._id,
        userId: user._id
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ role in response
        token: generateToken(user._id, user.role), // ✅ role in token
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscriptionPlan: plan },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Plan updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to module.exports:
module.exports = { registerUser, loginUser, getUserProfile, getUsers, updateUserPlan };
// module.exports = { registerUser, loginUser, getUserProfile };

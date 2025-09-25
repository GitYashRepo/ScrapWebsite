import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../Models/Admin.js";

/**
 * @route POST /create-admin
 * @desc Create a new admin user with hardcoded credentials (setup only)
 */
const createAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ email: "webtechware25@gmail.com" });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hash = await bcrypt.hash("9201043", 10);
    const admin = new Admin({
      name: "Yash Singh",
      email: "webtechware25@gmail.com",
      password: hash,
      role: "admin",
    });

    await admin.save();

    res.json({ message: "✅ Admin created successfully" });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * @route POST /login
 * @desc Admin login endpoint
 */
const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("admintoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      token,
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};


/**
 * @route POST /admin/verify
 * @desc Verify admin token and return admin details
 */
const verifyAdmin = async (req, res) => {
  try {
    const token = req.cookies.admintoken; // 👈 read from cookie
    if (!token) {
      return res.status(401).json({ message: "No token, not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.json({
      message: "Admin verified",
      admin: { id: admin._id, email: admin.email, role: admin.role },
      token,
    });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

export {
    createAdmin,
    AdminLogin,
    verifyAdmin,
}

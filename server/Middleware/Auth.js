import jwt from "jsonwebtoken";
import Admin from "../Models/Admin.js";

const adminAuth = async (req, res, next) => {
  const token = req.cookies?.admintoken || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select("-password");
    if (!req.admin) return res.status(401).json({ message: "Not authorized" });
    next();
  } catch (err) {
    res.status(401).json({ message: "Token failed" });
  }
};

export default adminAuth;

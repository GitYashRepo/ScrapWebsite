import Router from "express";
const router = Router();
import adminAuth from "../Middleware/Auth.js";
import { createAdmin, AdminLogin, verifyAdmin } from "../AppController/Admin.js";

/**
 * @route POST /create-admin
 * @desc Create a new admin user with hardcoded credentials
 */
router.post("/create", createAdmin);


/**
 * @route POST /login
 * @desc Admin login endpoint
 */
router.post("/login", AdminLogin);


/**
 * @route POST /admin/verify
 * @desc Verify admin token and return admin details
 */
router.post("/verify", adminAuth, verifyAdmin);



export default router;

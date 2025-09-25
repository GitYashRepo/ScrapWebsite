import Router from "express";
const router = Router();
import { GetQuotes, createQuote, UpdateQuote, UpdateReadStatus, DeleteQuote } from "../AppController/Quote.js";
import adminAuth from "../Middleware/Auth.js";

/**
 * @route POST /quotes
 * @desc Create a new project quote request
 */
router.post("/create", createQuote);

/**
 * @route GET /quotes
 * @desc Fetch all quotes
 */
router.get("/get-quote", adminAuth, GetQuotes);


/**
 * @route PATCH /quotes/:id
 * @desc Update quote status or amountPaid
 */
router.patch("/:id", adminAuth, UpdateQuote);

/**
 * @route PATCH /quotes/:id/read
 * @desc Update read/unread status of a quote
 */
router.patch("/:id/read", adminAuth, UpdateReadStatus);

/**
 * @route DELETE /quotes/:id
 * @desc Delete a quote
 */
router.delete("/:id", adminAuth, DeleteQuote);

export default router;

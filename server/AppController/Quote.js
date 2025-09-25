import Quote from "../Models/Quote.js";


/**
 * @route POST /quotes
 * @desc Create a new project quote request
 */
const createQuote = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      projectType,
      budget,
      timeline,
      description,
      selectedServices
    } = req.body;

    // Required field validation
    if (!name || !email || !description) {
      return res.status(400).json({ message: "Name, email, and description are required" });
    }

    const quote = new Quote({
      name,
      email,
      phone,
      company,
      projectType,
      budget,
      timeline,
      description,
      selectedServices
    });

    await quote.save();
    res.status(201).json({ message: "✅ Quote submitted successfully", quote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route GET /quotes
 * @desc Fetch all quotes
 */
const GetQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route PATCH /quotes/:id
 * @desc Update quote status or amountPaid
 */
const UpdateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, amountPaid } = req.body;

    const quote = await Quote.findByIdAndUpdate(
      id,
      { $set: { ...(status && { status }), ...(amountPaid !== undefined && { amountPaid }) } },
      { new: true }
    );

    if (!quote) return res.status(404).json({ message: "Quote not found" });

    res.json({ message: "✅ Quote updated successfully", quote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * @route PATCH /quotes/:id/read
 * @desc Update quote read/unread status
 */
const UpdateReadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;

    if (!["Read", "Unread"].includes(read)) {
      return res.status(400).json({ message: "Invalid read status" });
    }

    const quote = await Quote.findByIdAndUpdate(
      id,
      { $set: { read } },
      { new: true }
    );

    if (!quote) return res.status(404).json({ message: "Quote not found" });

    res.json({ message: "📖 Read status updated successfully", quote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/**
 * @route DELETE /quotes/:id
 * @desc Delete a quote
 */
const DeleteQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findByIdAndDelete(id);

    if (!quote) return res.status(404).json({ message: "Quote not found" });

    res.json({ message: "🗑️ Quote deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export {
    GetQuotes,
    createQuote,
    UpdateQuote,
    UpdateReadStatus,
    DeleteQuote,
}

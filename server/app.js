import dotenv from "dotenv";
dotenv.config();
import express from "express"
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import expressSession from "express-session";

// MongoDB Connection
import connectToDb from "./Config/db.js";

// Routes
import IndexRouter from "./Routes/Index.js";
import AdminRouter from "./Routes/Admin.js";
import QuoteRouter from "./Routes/Quote.js";


// --- MIDDLEWARES ---
// ✅ Cookie parser FIRST
app.use(cookieParser());
// ✅ CORS
const corsOptions = {
    origin: ["https://webtechware.vercel.app","http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// JSON & URL encoding
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Express Session (after cookieParser, before passport)
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "none",
    },
}));


// ✅ Connect DB once before starting server
await connectToDb(); // ✅ wait for MongoDB before loading routes

// --- ROUTES ---
app.use("/", IndexRouter);
app.use("/admin", AdminRouter);
app.use("/quotes", QuoteRouter);

// --- START SERVER AFTER DB CONNECTS ---
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`🚀 Server started on http://localhost:${port}`);
});

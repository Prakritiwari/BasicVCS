require("./load-env");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectDB } = require("./db");
const mainRouter = require("./routes/main.router");

const app = express();

app.disable("x-powered-by");
app.use(bodyParser.json({ limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));

// Vercel rewrites /(.*) to /api. Normalise both forms so the same Express
// routes work locally, on Vercel, and behind a plain reverse proxy.
app.use((req, res, next) => {
    if (req.url === "/api") {
        req.url = "/";
    } else if (req.url.startsWith("/api/")) {
        req.url = req.url.slice(4);
    }
    next();
});

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const corsOrigin = allowedOrigins.includes("*") ? "*" : allowedOrigins;
app.use(cors({ origin: corsOrigin }));

app.get("/", (req, res) => {
    res.send("Welcome!");
});

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("Database unavailable:", err.message);
        res.status(503).json({ error: "Database unavailable." });
    }
});

app.use("/", mainRouter);

app.use((req, res) => {
    res.status(404).json({ error: "Not found." });
});

app.use((err, req, res, next) => {
    console.error("Unhandled API error:", err);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: "Internal server error." });
});

module.exports = app;

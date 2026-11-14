require("./load-env");

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { connectDB } = require("./db");

async function startServer() {
    const port = process.env.PORT || 3000;

    await connectDB().catch((err) => {
        console.error("MongoDB connection failed:", err.message);
    });

    const httpServer = http.createServer(app);
    const allowedOrigins = (process.env.CORS_ORIGIN || "*")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    const socketOrigin = allowedOrigins.includes("*") ? "*" : allowedOrigins;

    const io = new Server(httpServer, {
        cors: {
            origin: socketOrigin,
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        socket.on("joinRoom", (userID) => {
            socket.join(userID);
        });
    });

    httpServer.listen(port, () => {
        console.log(`The server is running on PORT: ${port}`);
    });

    return httpServer;
}

if (require.main === module) {
    startServer();
}

module.exports = { startServer };

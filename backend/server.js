import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initializeSocketIO } from "./config/socket.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import searchRoutes from "./routes/search.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";
import listRoutes from "./routes/list.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import trendingRoutes from "./routes/trending.routes.js";
import messageRoutes from "./routes/message.routes.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
	cors: {
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true,
	},
});

// Connect to database
connectDB();

// Middleware
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: "cross-origin" },
	})
);
app.use(compression());
app.use(morgan("dev"));
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true,
	})
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Make io accessible to routes
app.set("io", io);

// Initialize Socket.IO handlers
initializeSocketIO(io);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tweets", tweetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/messages", messageRoutes);

// Health check
app.get("/api/health", (req, res) => {
	res.json({ status: "ok", message: "ChirpX API is running" });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
	console.log(`ChirpX server running on port ${PORT}`);
	console.log(`Socket.IO server initialized`);
});

export { io };

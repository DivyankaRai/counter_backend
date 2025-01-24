const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/User");
const connectDB = require("./config/db");
require("dotenv").config();


// MongoDB Connection
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with debugging and proper resource management
const io = new Server(server, {
  cors: {
    origin: "*", // Update to specific frontend origin in production
  },
  transports: ["websocket"], // Use WebSocket only for efficiency
});

// Middleware setup
app.use(cors());
app.use(express.json());

// Attach Socket.IO instance to the request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

const activeUsers = new Map(); // Store active users (userId -> { socketId, username })

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);


  // Handle user connection
  socket.on("userConnected", async (userId) => {
    console.log(`User connected: ${userId}`);
    if (!userId) {
      console.warn("No userId provided for userConnected event.");
      return;
    }

    try {
      // Fetch user data (username) from MongoDB
      const user = await User.findById(userId).select("username");

      if (user) {
        // Add user to activeUsers map with socketId and username
        activeUsers.set(userId, { socketId: socket.id, username: user.username });

        // Broadcast the updated active users list to all clients
        const activeUserList = Array.from(activeUsers.values());
        io.emit("activeUsersList", activeUserList);
        console.log("Active Users:", activeUserList);
      } else {
        console.warn(`User with ID ${userId} not found.`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.id}`);

    // Remove user from activeUsers map on disconnect
    for (let [userId, { socketId }] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }

    // Broadcast the updated active users list to all clients
    const activeUserList = Array.from(activeUsers.values());
    io.emit("activeUsersList", activeUserList);
    console.log("Active Users after disconnection:", activeUserList);
  });

  // Handle banana click event
  socket.on("bananaClick", async ({ userId }) => {
    if (!userId) {
      console.warn("No userId provided for bananaClick event.");
      return;
    }

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { clickCount: 1 } },
        { new: true }
      );

      if (user) {
        // Emit updated click count to all connected clients
        io.emit("updateRanking", {
          userId: user._id,
          clickCount: user.clickCount,
        });
      }
    } catch (error) {
      console.error("Error updating banana count:", error);
    }
  });


  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.id}`);
  });

  // Handle and log socket errors
  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


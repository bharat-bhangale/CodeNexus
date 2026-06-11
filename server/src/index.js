import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import app from './app.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codenexus';

// ─── HTTP + Socket.IO Server ───
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── Socket.IO Connection Handler ───
io.on('connection', (socket) => {
  logger.info(`🔌 Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    logger.info(`🔌 Client disconnected: ${socket.id} (${reason})`);
  });
});

// Make io available to routes via app.locals
app.locals.io = io;

// ─── Connect to MongoDB & Start Server ───
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    const dbName = mongoose.connection.db.databaseName;
    logger.info(`📦 MongoDB connected to ${dbName}`);

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 CodeNexus server running on port ${PORT}`);
      logger.info(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error.message);

    // If MongoDB is not available, start server anyway (for health check)
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongooseServerSelectionError') {
      logger.warn('⚠️  MongoDB not available — starting server without database');
      httpServer.listen(PORT, () => {
        logger.info(`🚀 CodeNexus server running on port ${PORT} (no database)`);
      });
    } else {
      process.exit(1);
    }
  }
};

// ─── Graceful Shutdown ───
const shutdown = async (signal) => {
  logger.info(`\n${signal} received — shutting down gracefully...`);

  httpServer.close(() => {
    logger.info('🛑 HTTP server closed');
  });

  try {
    await mongoose.connection.close();
    logger.info('🛑 MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB:', error.message);
  }

  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Unhandled Errors ───
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

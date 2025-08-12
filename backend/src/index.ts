/**
 * Main entry point for the Smart Autocomplete Search System backend
 * Sets up Express server with middleware, routes, and Socket.IO
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { getDatabase } from '@/utils/database';
import { errorHandler, notFoundHandler } from '@/utils/middleware';
import { TrieService } from '@/services/TrieService';

// Import route handlers
import suggestRoutes from '@/routes/suggest';
import selectRoutes from '@/routes/select';
import insertRoutes from '@/routes/insert';
import exportRoutes from '@/routes/export';
import adminRoutes from '@/routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware setup
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow embedding for development
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Join rooms for real-time updates
  socket.on('join:trie-updates', () => {
    socket.join('trie-updates');
    console.log(`Client ${socket.id} joined trie-updates room`);
  });

  socket.on('join:analytics-updates', () => {
    socket.join('analytics-updates');
    console.log(`Client ${socket.id} joined analytics-updates room`);
  });
});

// Make io available to routes
app.set('io', io);

// Initialize TrieService with Socket.IO
const trieService = TrieService.getInstance();
trieService.initialize(io);

// API Routes
app.use('/api/suggest', suggestRoutes);
app.use('/api/select', selectRoutes);
app.use('/api/insert', insertRoutes);
app.use('/api/export-trie', exportRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database connection
    const db = getDatabase({
      connectionString: process.env.DATABASE_URL!,
      ssl: process.env.NODE_ENV === 'production',
    });

    // Test database connection
    const isDbConnected = await db.testConnection();
    if (!isDbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Initialize Trie with data from database
    console.log('Initializing Trie with database data...');
    await trieService.loadFromDatabase();
    console.log('✅ Trie initialization completed');

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`💾 Database connected: ${isDbConnected ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, io };

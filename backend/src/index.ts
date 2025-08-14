

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
import { performanceOptimizer } from './services/performanceOptimizer';

import suggestRoutes from '@/routes/suggest';
import selectRoutes from '@/routes/select';
import insertRoutes from '@/routes/insert';
import exportRoutes from '@/routes/export';
import adminRoutes from '@/routes/admin';

dotenv.config();

const app = express();
const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env['SOCKET_IO_CORS_ORIGIN'] || ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
  },
});

app.use(helmet({
  crossOriginEmbedderPolicy: false, 
}));

app.use(cors({
  origin: process.env['FRONTEND_URL'] || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api/', limiter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'],
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('join:trie-updates', () => {
    socket.join('trie-updates');
    console.log(`Client ${socket.id} joined trie-updates room`);
  });

  socket.on('join:analytics-updates', () => {
    socket.join('analytics-updates');
    console.log(`Client ${socket.id} joined analytics-updates room`);
  });
});

app.set('io', io);

const trieService = TrieService.getInstance();
trieService.initialize(io);

app.use('/api/suggest', suggestRoutes);
app.use('/api/select', selectRoutes);
app.use('/api/insert', insertRoutes);
app.use('/api/export-trie', exportRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env['PORT'] || 3001;

async function startServer() {
  try {
    const db = getDatabase({
      connectionString: process.env['DATABASE_URL']!,
      ssl: process.env['NODE_ENV'] === 'production',
    });

    const isDbConnected = await db.testConnection();
    if (!isDbConnected) {
      throw new Error('Failed to connect to database');
    }

    console.log('Initializing Trie with database data...');
    await trieService.loadFromDatabase();
    console.log(' Trie initialization completed');

    console.log('Warming up performance cache...');
    await performanceOptimizer.warmUpCache(async (query: string) => {
      const result = await trieService.getSuggestions(query, 10);
      return result.suggestions;
    });
    console.log(' Performance cache warmed up');

    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env['NODE_ENV']}`);
      console.log(` Frontend URL: ${process.env['FRONTEND_URL']}`);
      console.log(` Database connected: ${isDbConnected ? '✅' : '❌'}`);

      const metrics = performanceOptimizer.getMetrics();
      console.log(` Cache initialized with ${metrics.suggestionCacheSize} entries`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

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

startServer();

export { app, io };

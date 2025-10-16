import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Redis from 'redis';

// Load environment variables
dotenv.config();

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Redis
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
await redis.connect();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/dashboard', (await import('./routes/dashboard.js')).default);
app.use('/api/events', (await import('./routes/events.js')).default);
app.use('/api/admin', (await import('./routes/admin.js')).default);
app.use('/api/users', (await import('./routes/users.js')).default);
app.use('/api/channels', (await import('./routes/channels.js')).default);
app.use('/api/notifications', (await import('./routes/notifications.js')).default);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-event-channel', (eventId) => {
    socket.join(`event-${eventId}`);
    console.log(`User ${socket.id} joined event channel: ${eventId}`);
  });

  socket.on('leave-event-channel', (eventId) => {
    socket.leave(`event-${eventId}`);
    console.log(`User ${socket.id} left event channel: ${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Đã xảy ra lỗi máy chủ', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Lỗi máy chủ nội bộ'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Không tìm thấy trang' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📊 Trạng thái: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  await redis.disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});

export { prisma, redis, io };
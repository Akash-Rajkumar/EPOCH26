import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fuzzerRoutes from './routes/fuzzer.js';
import crashRoutes from './routes/crashes.js';
import sessionRoutes from './routes/sessions.js';
import { supabase } from './lib/supabase.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.VITE_API_URL || 'http://localhost:5173',
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use('/fuzzer', fuzzerRoutes);
app.use('/crashes', crashRoutes);
app.use('/sessions', sessionRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'FuzzForge API running 🚀' });
});

// Supabase Temp test
app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('sessions').select('*');

  if (error) return res.status(500).json(error);
  res.json(data);
});

// Socket connection test
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('test_event', {
    message: 'Socket working 🎉'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
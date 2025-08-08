// 🚀 FlowForge Backend Server
// Express.js server with workflow execution endpoints

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: true,
      websocket: true,
    },
  });
});

// Basic API endpoints
app.get('/api/nodes', (req, res) => {
  res.json({
    success: true,
    data: [
      { type: 'webhook', category: 'triggers', name: 'Webhook Trigger' },
      { type: 'http-request', category: 'data', name: 'HTTP Request' },
      { type: 'email-sender', category: 'actions', name: 'Email Sender' },
      { type: 'document-builder', category: 'builders', name: 'Document Builder' },
      { type: 'media-builder', category: 'builders', name: 'Media Builder' },
    ],
    count: 5,
  });
});

// WebSocket setup for real-time communication
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      // Echo back for now
      ws.send(
        JSON.stringify({
          type: 'response',
          data: { received: data },
        }),
      );
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 FlowForge Backend running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});

export default app;

// 🚀 FlowForge Backend Server
// Express.js server with workflow execution endpoints

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { bootstrap } from './src/app/bootstrap.js';
import NodeOrchestrator from './src/app/NodeOrchestrator.js';
import WorkflowOrchestrator from './src/app/WorkflowOrchestrator.js';
import eventBus from './src/shared/EventBus.js';
import logger from './src/observability/logger.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Bootstrap system
await bootstrap();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', version: '2.0.0', timestamp: new Date().toISOString() });
});

// Basic API endpoints

// List all available nodes
app.get('/api/nodes', (req, res) => {
  res.json({ nodes: NodeOrchestrator.listNodes() });
});


// Execute a workflow
app.post('/api/workflows/execute', async (req, res) => {
  const { workflow, triggerData, options } = req.body;
  const result = await WorkflowOrchestrator.execute(workflow, triggerData, options);
  res.json(result);
});

// WebSocket setup for real-time communication
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');
  
  ws.on('message', (msg) => {
    logger.info('WS message', { msg });
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`FlowForge Backend running on port ${PORT}`);
  logger.info(`📍 Health: http://localhost:${PORT}/health`);
  logger.info(`📍 API: http://localhost:${PORT}/api`);
});

export default app;

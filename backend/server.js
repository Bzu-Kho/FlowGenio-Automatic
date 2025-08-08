// 🚀 FlowForge Backend Server
// Express.js server with workflow execution endpoints

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { bootstrap } from './src/app/bootstrap.js';
import nodeOrchestrator from './src/app/NodeOrchestrator.js';
import workflowOrchestrator from './src/app/WorkflowOrchestrator.js';
import eventBus from './src/shared/EventBus.js';
import logger from './src/observability/logger.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3003; // Backend port - avoiding conflicts (3000: frontend, 3001: healthcare)

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

app.get('/api/nodes', async (req, res) => {
  const nodes = await nodeOrchestrator.listNodes();
  res.json({ nodes });
});

app.post('/api/workflows/execute', async (req, res) => {
  const { workflow, triggerData, options } = req.body;
  const result = await workflowOrchestrator.executeWorkflow(workflow, triggerData, options);
  res.json(result);
});

// List workflow execution history
app.get('/api/executions', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const executions = await workflowOrchestrator.getExecutions(limit);
  res.json({ executions });
});

// List active executions
app.get('/api/executions/active', async (req, res) => {
  const executions = await workflowOrchestrator.getActiveExecutions();
  res.json({ executions });
});

// WebSocket setup for real-time communication
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');

  ws.on('message', (msg) => {
    logger.info('WS message', { msg });
  });
});

// Global error handler for observability
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack, path: req.path });
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
server.listen(PORT, () => {
  logger.info(`FlowForge Backend running on port ${PORT}`);
  logger.info(`📍 Health: http://localhost:${PORT}/health`);
  logger.info(`📍 API: http://localhost:${PORT}/api`);
});

// AI Assistant Chat Endpoint is currently disabled due to missing dependency.
// To enable, ensure './src/services/llm-chain-master.js' exists and is implemented.
// import LLMChainMaster from './src/services/llm-chain-master.js';
// const llmChainMaster = new LLMChainMaster();
// app.post('/api/assistant/chat', async (req, res) => {
//   const { message, context = 'automation_expert', history = [] } = req.body;
//   if (!message) {
//     return res.status(400).json({ error: 'Message is required' });
//   }
//   try {
//     const result = await llmChainMaster.processQuery(message, context, history);
//     res.json(result);
//   } catch (err) {
//     logger.error('Assistant chat error', { error: err.message, stack: err.stack });
//     res.status(500).json({ error: 'Assistant unavailable', details: err.message });
//   }
// });

export default app;

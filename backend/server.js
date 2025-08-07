// 🚀 FlowForge Backend Server
// Express.js server with workflow execution endpoints

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

import NodeRegistry from './src/engine/NodeRegistry.js';
import WorkflowEngine from './src/engine/WorkflowEngine.js';
import FirecrawlKnowledgeBase from './src/services/firecrawl-knowledge-base.js';
import LLMChainMaster from './src/services/llm-chain-master.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize core services
const nodeRegistry = NodeRegistry;
const workflowEngine = new WorkflowEngine();
const knowledgeBase = new FirecrawlKnowledgeBase();
const llmChain = new LLMChainMaster();

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
      nodeRegistry: nodeRegistry.getNodeTypes().length > 0,
      workflowEngine: true,
      knowledgeBase: true,
      llmChain: true
    }
  });
});

// ======================
// NODE REGISTRY ENDPOINTS
// ======================

// Get all available nodes
app.get('/api/nodes', (req, res) => {
  try {
    const nodes = nodeRegistry.getAllNodes();
    res.json({
      success: true,
      data: nodes,
      count: nodes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get nodes by category
app.get('/api/nodes/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const nodes = nodeRegistry.getNodesByCategory(category);
    res.json({
      success: true,
      data: nodes,
      category,
      count: nodes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get node palette for UI
app.get('/api/nodes/palette', (req, res) => {
  try {
    const palette = nodeRegistry.getNodePalette();
    res.json({
      success: true,
      data: palette
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific node metadata
app.get('/api/nodes/:type', (req, res) => {
  try {
    const { type } = req.params;
    const metadata = nodeRegistry.getNodeMetadata(type);
    
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: `Node type "${type}" not found`
      });
    }

    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate node
app.post('/api/nodes/:type/validate', async (req, res) => {
  try {
    const { type } = req.params;
    const { testData } = req.body;
    
    const validation = await nodeRegistry.validateNode(type, testData);
    res.json({
      success: validation.valid,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ======================
// WORKFLOW EXECUTION ENDPOINTS
// ======================

// Execute workflow
app.post('/api/workflows/execute', async (req, res) => {
  try {
    const { workflow, triggerData, options } = req.body;

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'Workflow definition is required'
      });
    }

    const result = await workflowEngine.executeWorkflow(workflow, triggerData, options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get active executions
app.get('/api/executions/active', (req, res) => {
  try {
    const executions = workflowEngine.getActiveExecutions();
    res.json({
      success: true,
      data: executions,
      count: executions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get execution history
app.get('/api/executions/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = workflowEngine.getExecutionHistory(limit);
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop execution
app.post('/api/executions/:executionId/stop', async (req, res) => {
  try {
    const { executionId } = req.params;
    const stopped = await workflowEngine.stopExecution(executionId);
    
    if (stopped) {
      res.json({
        success: true,
        message: 'Execution stopped successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Execution not found or already completed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ======================
// LLM AI ASSISTANT ENDPOINTS
// ======================

// AI assistance for workflows
app.post('/api/ai/assist', async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const response = await llmChain.processQuery(message, context, conversationHistory);
    
    res.json({
      success: response.success,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate node suggestions
app.post('/api/ai/suggest-nodes', async (req, res) => {
  try {
    const { flowDescription, existingNodes } = req.body;

    if (!flowDescription) {
      return res.status(400).json({
        success: false,
        error: 'Flow description is required'
      });
    }

    const suggestions = await llmChain.generateNodeSuggestions(flowDescription, existingNodes);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Optimize workflow
app.post('/api/ai/optimize', async (req, res) => {
  try {
    const { workflow } = req.body;

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'Workflow is required'
      });
    }

    const optimization = await llmChain.optimizeFlow(workflow);
    
    res.json({
      success: true,
      data: optimization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug workflow issues
app.post('/api/ai/debug', async (req, res) => {
  try {
    const { workflow, errorDescription } = req.body;

    if (!workflow || !errorDescription) {
      return res.status(400).json({
        success: false,
        error: 'Workflow and error description are required'
      });
    }

    const debug = await llmChain.debugFlowIssue(workflow, errorDescription);
    
    res.json({
      success: true,
      data: debug
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ======================
// KNOWLEDGE BASE ENDPOINTS
// ======================

// Search knowledge base
app.get('/api/knowledge/search', async (req, res) => {
  try {
    const { q: query, category, limit } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const results = knowledgeBase.searchKnowledge(query, category);
    const limitedResults = limit ? results.slice(0, parseInt(limit)) : results;
    
    res.json({
      success: true,
      data: limitedResults,
      count: limitedResults.length,
      totalCount: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Crawl knowledge sources
app.post('/api/knowledge/crawl', async (req, res) => {
  try {
    // Start crawling in background
    knowledgeBase.crawlAutomationSources().catch(error => {
      console.error('Knowledge base crawling failed:', error);
    });

    res.json({
      success: true,
      message: 'Knowledge base crawling started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ======================
// UTILITY ENDPOINTS
// ======================

// Get system statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      nodes: {
        total: nodeRegistry.getNodeTypes().length,
        categories: nodeRegistry.getCategories().length,
        byCategory: nodeRegistry.getCategoriesWithNodes()
      },
      executions: {
        active: workflowEngine.getActiveExecutions().length,
        historyCount: workflowEngine.getExecutionHistory().length
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// ======================
// WEBSOCKET SERVER
// ======================

const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

const wsConnections = new Map();

wss.on('connection', (ws, req) => {
  const connectionId = uuidv4();
  wsConnections.set(connectionId, ws);
  
  console.log(`WebSocket client connected: ${connectionId}`);

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleWebSocketMessage(ws, connectionId, message);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });

  ws.on('close', () => {
    wsConnections.delete(connectionId);
    console.log(`WebSocket client disconnected: ${connectionId}`);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    connectionId,
    message: 'Connected to FlowForge WebSocket'
  }));
});

async function handleWebSocketMessage(ws, connectionId, message) {
  const { type, payload } = message;

  switch (type) {
    case 'execute_workflow':
      // Execute workflow and stream updates
      try {
        const result = await workflowEngine.executeWorkflow(
          payload.workflow, 
          payload.triggerData, 
          payload.options
        );
        
        ws.send(JSON.stringify({
          type: 'execution_complete',
          data: result
        }));
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'execution_error',
          error: error.message
        }));
      }
      break;

    case 'subscribe_executions':
      // Subscribe to execution updates
      ws.executionSubscription = true;
      ws.send(JSON.stringify({
        type: 'subscribed',
        subscription: 'executions'
      }));
      break;

    case 'ping':
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        error: `Unknown message type: ${type}`
      }));
  }
}

// Broadcast execution updates to subscribed clients
function broadcastExecutionUpdate(update) {
  const message = JSON.stringify({
    type: 'execution_update',
    data: update
  });

  for (const [connectionId, ws] of wsConnections.entries()) {
    if (ws.executionSubscription && ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  }
}

// ======================
// SERVER STARTUP
// ======================

server.listen(PORT, () => {
  console.log(`
🚀 FlowForge Backend Server Started!

📡 HTTP Server: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}/ws
📚 API Docs: http://localhost:${PORT}/health

🎯 Available Endpoints:
   GET  /api/nodes                 - Get all nodes
   GET  /api/nodes/palette         - Get node palette
   POST /api/workflows/execute     - Execute workflow
   GET  /api/executions/active     - Get active executions
   POST /api/ai/assist             - AI assistance
   GET  /api/knowledge/search      - Search knowledge base
   GET  /api/stats                 - System statistics

🧠 Core Services:
   ✅ Node Registry (${nodeRegistry.getNodeTypes().length} nodes)
   ✅ Workflow Engine
   ✅ LLM Chain Master
   ✅ Knowledge Base
   ✅ WebSocket Server

Ready to forge some flows! 🔥
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down FlowForge Backend...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;

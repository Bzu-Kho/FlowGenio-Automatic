# 🚀 FlowGenio - Visual Automation Platform

**Build powerful automation workflows with visual drag-and-drop interface**

FlowGenio is a modern, lightweight alternative to n8n, Node-RED, and Zapier. Create automation workflows visually with our intuitive node-based editor, powered by AI assistance and extensive knowledge base.

## ✨ Features

- **🎨 Visual Workflow Editor** - Drag-and-drop interface powered by React Flow
- **🧠 AI-Powered Assistant** - Get suggestions and help from integrated LLM
- **🔌 Extensible Node System** - Custom nodes with hot-reload support
- **⚡ Real-time Execution** - Live workflow execution with WebSocket updates
- **📚 Knowledge Base** - Built-in automation patterns and best practices
- **🚀 Lightweight** - No Docker required, runs on SQLite
- **🔒 Local-First** - Your data stays on your machine

## 🏗️ Architecture

### Core Components

- **Frontend**: Next.js 15 + React Flow + Tailwind CSS
- **Backend**: Node.js + Express + WebSockets
- **Database**: SQLite (portable, zero-config)
- **AI Integration**: OpenAI GPT + Local knowledge base
- **Node System**: Modular, extensible architecture

### 🎯 Node Categories

| Category        | Description     | Examples                                     |
| --------------- | --------------- | -------------------------------------------- |
| 🚀 **Triggers** | Start workflows | Manual, Webhook, Schedule, File Watcher      |
| 🔀 **Logic**    | Control flow    | If/Else, Switch, Loop, Merge/Split           |
| 💾 **Data**     | Handle data     | HTTP Request, Set Variable, Read/Write Files |
| 🤖 **AI/LLM**   | AI operations   | OpenAI GPT, Local LLM, Text Processing       |
| 🎯 **Actions**  | Execute tasks   | Email, Database Query, Custom Functions      |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### 1. Clone Repository

```bash
git clone https://github.com/your-username/flowforge.git
cd flowforge
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Start Development Servers

**Option A: Manual Start**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option B: Automated Script**

```bash
# Windows
scripts\dev.bat

# Linux/Mac
chmod +x scripts/dev.sh
./scripts/dev.sh
```

### 4. Open FlowForge

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📖 Usage Guide

### Creating Your First Workflow

1. **Open FlowForge** in your browser (http://localhost:3000)
2. **Drag nodes** from the palette to the canvas
3. **Connect nodes** by dragging from output to input ports
4. **Configure nodes** by clicking and editing properties
5. **Execute workflow** using the Execute button

### Example: Simple HTTP Workflow

```
Manual Trigger → HTTP Request → If/Else → Console Output
```

1. Add a **Manual Trigger** node
2. Add an **HTTP Request** node (set URL to any API)
3. Add an **If/Else** node (check if status === 200)
4. Add **Console Output** nodes to both branches
5. Connect the nodes and execute!

## 🔧 Node Development

### Creating Custom Nodes

```javascript
import BaseNode from '../base/BaseNode.js';

class MyCustomNode extends BaseNode {
  constructor(config = {}) {
    super('MyCustomNode', {
      ...config,
      category: 'utility',
      icon: 'star',
      description: 'My awesome custom node',
    });
  }

  defineInputs() {
    return [{ name: 'input', type: 'any', required: true }];
  }

  defineOutputs() {
    return [{ name: 'output', type: 'any' }];
  }

  async execute(context) {
    const input = context.getInputData('input');

    // Your custom logic here
    const result = { processed: input };

    return { output: result };
  }
}

export default MyCustomNode;
```

### Register Your Node

```javascript
import nodeRegistry from './src/engine/NodeRegistry.js';
import MyCustomNode from './src/nodes/MyCustomNode.js';

nodeRegistry.registerNode('MyCustomNode', MyCustomNode);
```

## 🤖 AI Assistant

FlowForge includes an AI-powered assistant to help you:

- **Generate node suggestions** based on your workflow description
- **Optimize existing workflows** for better performance
- **Debug workflow issues** with detailed analysis
- **Explain node functionality** and best practices

### Using AI Assistant

```javascript
// Get workflow suggestions
POST /api/ai/suggest-nodes
{
  "flowDescription": "I want to fetch data from an API and send emails",
  "existingNodes": ["ManualTrigger"]
}

// Optimize workflow
POST /api/ai/optimize
{
  "workflow": { /* your workflow definition */ }
}
```

## 📚 API Reference

### Core Endpoints

#### Nodes

- `GET /api/nodes` - Get all available nodes
- `GET /api/nodes/palette` - Get node palette for UI
- `GET /api/nodes/:type` - Get specific node metadata

#### Workflow Execution

- `POST /api/workflows/execute` - Execute a workflow
- `GET /api/executions/active` - Get active executions
- `GET /api/executions/history` - Get execution history

#### AI Assistant

- `POST /api/ai/assist` - General AI assistance
- `POST /api/ai/suggest-nodes` - Get node suggestions
- `POST /api/ai/optimize` - Optimize workflow

#### Knowledge Base

- `GET /api/knowledge/search` - Search knowledge base
- `POST /api/knowledge/crawl` - Trigger knowledge crawling

### WebSocket Events

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3001/ws');

// Execute workflow with real-time updates
ws.send(
  JSON.stringify({
    type: 'execute_workflow',
    payload: { workflow, triggerData },
  }),
);

// Subscribe to execution updates
ws.send(
  JSON.stringify({
    type: 'subscribe_executions',
  }),
);
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# End-to-end tests
npm run test:e2e
```

## 🚢 Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start production servers
cd ../backend
npm start
```

### Docker (Optional)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **TypeScript/JavaScript**: ESLint + Prettier
- **Commit Messages**: Conventional Commits
- **Testing**: Jest + React Testing Library

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Flow** - For the amazing visual workflow editor
- **n8n & Node-RED** - Inspiration for the node-based architecture
- **OpenAI** - AI assistance capabilities
- **Firecrawl** - Knowledge base automation

## 📞 Support

- **Documentation**: [FlowForge Docs](https://docs.flowforge.dev)
- **Discord**: [Join our community](https://discord.gg/flowforge)
- **Issues**: [GitHub Issues](https://github.com/your-username/flowforge/issues)
- **Email**: support@flowforge.dev

## 🗺️ Roadmap

### Version 1.1 (Next Release)

- [ ] Custom node marketplace
- [ ] Workflow templates library
- [ ] Advanced debugging tools
- [ ] Performance monitoring

### Version 1.2 (Future)

- [ ] Multi-user collaboration
- [ ] Cloud deployment options
- [ ] Advanced AI integrations
- [ ] Enterprise features

### Version 2.0 (Long-term)

- [ ] Visual scripting language
- [ ] Mobile app support
- [ ] Real-time collaboration
- [ ] Enterprise SSO

---

**Built with ❤️ by the FlowForge Team**

_Forge your automation workflows with ease!_

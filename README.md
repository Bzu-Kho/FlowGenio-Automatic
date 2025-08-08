# 🚀 FlowGenio - Advanced Visual Workflow Automation Platform

**Professional workflow automation with AI-powered assistance and real-time streaming**

FlowGenio is a cutting-edge visual workflow automation platform that combines the power of modern web technologies with intelligent AI assistance. Build complex automation workflows through an intuitive drag-and-drop interface, enhanced with real-time AI streaming and comprehensive theming support.

## ✨ Key Features

### 🎨 **Modern Visual Interface**
- **ReactFlow-powered Editor** - Professional drag-and-drop workflow canvas
- **Real-time Minimap** - Workflow overview integrated into chat panel
- **Comprehensive Theming** - Dark, Light, and System theme modes
- **Responsive Design** - Optimized for all screen sizes

### 🧠 **AI-Powered Assistance**
- **Real-time AI Streaming** - ChatGPT-style streaming responses
- **Workflow Optimization** - AI suggestions for better performance
- **Node Recommendations** - Smart suggestions based on workflow context
- **Expert Knowledge Base** - Built-in automation patterns and best practices

### 🔧 **Professional Architecture**
- **Modular Node System** - 7 organized node categories
- **Hot-reload Development** - Instant updates during development
- **TypeScript Support** - Full type safety and IntelliSense
- **ESLint & Prettier** - Consistent code quality and formatting

### ⚡ **Performance & Reliability**
- **Separated Ports** - Frontend (3050) and Backend (3003) for optimal performance
- **WebSocket Integration** - Real-time workflow execution updates
- **SQLite Database** - Lightweight, zero-configuration data storage
- **Docker Support** - Container-ready for easy deployment

## 🏗️ Architecture Overview

### Technology Stack

| Component | Technology | Port | Description |
|-----------|------------|------|-------------|
| **Frontend** | Next.js 15.4.6 + ReactFlow | 3050 | Modern React application with visual workflow editor |
| **Backend** | Node.js + Express | 3003 | RESTful API with WebSocket support |
| **Database** | SQLite | - | Lightweight, portable database |
| **Styling** | TailwindCSS | - | Utility-first CSS with dark mode support |
| **AI Integration** | OpenAI GPT | - | Real-time streaming AI assistance |

### 🎯 Node Categories (7 Main Types)

| Category | Color | Description | Example Nodes |
|----------|-------|-------------|---------------|
| 🚀 **Trigger Flows** | `bg-blue-500` | Workflow initiators | Manual Trigger, Webhook, Schedule |
| � **API Calls** | `bg-green-500` | External integrations | HTTP Request, REST API, GraphQL |
| � **Data Transform** | `bg-purple-500` | Data manipulation | Set Variable, Transform, Parse JSON |
| � **Conditional Logic** | `bg-orange-500` | Flow control | If/Else, Switch, Router |
| 💻 **Advanced Scripting** | `bg-red-500` | Custom code execution | JavaScript Node, Python Script |
| �️ **Flow Control** | `bg-yellow-500` | Workflow management | Loop, Merge, Split, Delay |
| 🔍 **Debug & Monitor** | `bg-gray-500` | Development tools | Console Output, Logger, Debugger |

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for version control

### 1. Clone Repository

```bash
git clone https://github.com/Bzu-Kho/FlowGenio-Automatic.git
cd FlowGenio-Automatic
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

```bash
# Backend configuration
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend runs without additional config
```

### 4. Start Development Servers

**Option A: Automated Scripts (Recommended)**

```bash
# Windows PowerShell
.\scripts\dev.ps1

# Windows Batch
scripts\dev.bat

# Linux/macOS
chmod +x scripts/dev.sh
./scripts/dev.sh
```

**Option B: Manual Start**

```bash
# Terminal 1 - Backend (Port 3003)
cd backend
npm run dev

# Terminal 2 - Frontend (Port 3050)
cd frontend
npm run dev
```

### 5. Access FlowGenio

- **Application**: http://localhost:3050
- **Backend API**: http://localhost:3003
- **Health Check**: http://localhost:3003/health

## 🎨 User Interface Features

### Theme System
FlowGenio supports three theme modes with complete UI consistency:

- **🌞 Light Mode** - Clean, professional light interface
- **🌙 Dark Mode** - Eye-friendly dark interface with proper contrast
- **🖥️ System Mode** - Automatically follows system preferences

### Integrated Minimap
- **Real-time Updates** - Automatically reflects workflow changes
- **Smart Positioning** - Located in chat panel for optimal space usage
- **Theme Aware** - Properly styled for all theme modes

### AI Chat Interface
- **Streaming Responses** - Real-time AI assistance like ChatGPT
- **Workflow Context** - AI understands your current workflow
- **Drag Support** - Intuitive chat panel interaction

## 📖 Usage Guide

### Creating Your First Workflow

1. **Launch FlowGenio** at http://localhost:3050
2. **Select Theme** - Choose Light, Dark, or System mode
3. **Add Trigger Node** - Drag "Manual Trigger" from Trigger Flows category
4. **Add Processing Node** - Add "HTTP Request" from API Calls category
5. **Add Logic Node** - Add "If/Else" from Conditional Logic category
6. **Connect Nodes** - Draw connections between node ports
7. **Configure Nodes** - Click nodes to set properties
8. **Test Workflow** - Use Execute button to test
9. **Monitor Execution** - Watch real-time updates in minimap

### Example: API Data Processing Workflow

```
Manual Trigger → HTTP Request → If/Else → Console Output
                              ↓
                         Transform Data → Email Send
```

### AI Assistant Usage

1. **Open Chat Panel** - Click chat icon in interface
2. **Ask Questions** - "How do I process API responses?"
3. **Get Suggestions** - AI provides relevant node recommendations
4. **Workflow Help** - "Optimize my current workflow"
5. **Real-time Assistance** - Streaming responses for immediate help

## 🔧 Development Guide

### Project Structure

```
FlowGenio-Automatic/
├── frontend/                 # Next.js application (Port 3050)
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   │   ├── FlowEditor.tsx        # Main workflow editor
│   │   │   ├── MiniMapViewer.tsx     # Integrated minimap
│   │   │   ├── ThemeProvider.tsx     # Theme management
│   │   │   └── ExpertAssistantChat.tsx # AI chat interface
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # Static assets
│   └── tailwind.config.ts   # Tailwind configuration with dark mode
├── backend/                 # Node.js API server (Port 3003)
│   ├── src/
│   │   ├── engine/          # Workflow execution engine
│   │   ├── nodes/           # Node implementations
│   │   ├── services/        # Business logic services
│   │   └── routes/          # API endpoints
│   └── server.js           # Main server file
├── scripts/                # Development automation scripts
├── docs/                   # Documentation
└── configs/                # Configuration files
```

### Custom Node Development

```typescript
import BaseNode from '../base/BaseNode.js';

class CustomProcessorNode extends BaseNode {
  constructor(config = {}) {
    super('CustomProcessor', {
      ...config,
      category: 'Data Transform',
      color: 'bg-purple-500',
      icon: 'processor',
      description: 'Custom data processing node',
    });
  }

  defineInputs() {
    return [
      { name: 'data', type: 'object', required: true },
      { name: 'config', type: 'object', required: false }
    ];
  }

  defineOutputs() {
    return [
      { name: 'processed', type: 'object' },
      { name: 'error', type: 'string' }
    ];
  }

  async execute(context) {
    try {
      const data = context.getInputData('data');
      const config = context.getInputData('config') || {};
      
      // Custom processing logic
      const processed = this.processData(data, config);
      
      return { processed };
    } catch (error) {
      return { error: error.message };
    }
  }

  processData(data, config) {
    // Implementation here
    return data;
  }
}

export default CustomProcessorNode;
```

## 🔌 API Reference

### Core Workflow API

```typescript
// Execute workflow
POST /api/workflows/execute
{
  "workflow": {
    "nodes": [...],
    "edges": [...]
  },
  "triggerData": {}
}

// Get execution status
GET /api/executions/:id

// List available nodes
GET /api/nodes/palette
```

### AI Assistant API

```typescript
// Stream AI assistance
POST /api/ai/stream-assist
{
  "message": "How do I optimize this workflow?",
  "workflowContext": {...}
}

// Get node suggestions
POST /api/ai/suggest-nodes
{
  "description": "I need to process CSV files",
  "currentNodes": [...]
}
```

### WebSocket Events

```typescript
// Real-time workflow execution
const ws = new WebSocket('ws://localhost:3003/ws');

// Subscribe to execution updates
ws.send(JSON.stringify({
  type: 'subscribe_execution',
  executionId: 'exec_123'
}));

// Receive real-time updates
ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  // Handle execution updates
};
```

## 🧪 Testing & Quality Assurance

### Code Quality Tools

```bash
# ESLint - Code linting
cd frontend
npm run lint

# Prettier - Code formatting
npm run format

# Type checking
npm run type-check
```

### Testing Commands

```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test

# Integration tests
npm run test:integration
```

## 🚀 Deployment Options

### Development Deployment

```bash
# Start development servers
npm run dev

# With file watching
npm run dev:watch
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build

# Start production
npm start
```

### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  flowgenio-frontend:
    build: ./frontend
    ports:
      - "3050:3050"
    environment:
      - NODE_ENV=production

  flowgenio-backend:
    build: ./backend
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
```

```bash
# Deploy with Docker
docker-compose up -d
```

## 🤝 Contributing

We welcome contributions to FlowGenio! Please follow these guidelines:

### Development Workflow

1. **Fork** the repository
2. **Create branch** `git checkout -b feature/amazing-feature`
3. **Follow standards** - ESLint, Prettier, TypeScript
4. **Test thoroughly** - Ensure all tests pass
5. **Commit with convention** - Use conventional commits
6. **Push changes** `git push origin feature/amazing-feature`
7. **Create Pull Request** - Detailed description required

### Code Standards

- **TypeScript** - Strict mode enabled
- **ESLint** - Airbnb configuration
- **Prettier** - Consistent formatting
- **Conventional Commits** - Semantic commit messages

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ReactFlow** - Powerful workflow visualization library
- **Next.js** - Modern React framework
- **TailwindCSS** - Utility-first CSS framework
- **OpenAI** - AI assistance capabilities
- **Node-RED & n8n** - Inspiration for node-based automation

## 📞 Support & Community

- **Repository**: [GitHub - FlowGenio-Automatic](https://github.com/Bzu-Kho/FlowGenio-Automatic)
- **Issues**: [Report bugs or request features](https://github.com/Bzu-Kho/FlowGenio-Automatic/issues)
- **Discussions**: [Community discussions](https://github.com/Bzu-Kho/FlowGenio-Automatic/discussions)

## 🗺️ Roadmap

### ✅ Completed Features

- [x] Modern React Flow interface with theming
- [x] Real-time AI streaming assistance
- [x] Integrated minimap with workflow overview
- [x] Comprehensive dark/light/system themes
- [x] 7-category node organization system
- [x] TypeScript conversion and code standardization
- [x] Professional ESLint/Prettier configuration

### 🔄 Current Development (v1.1)

- [ ] Advanced node marketplace
- [ ] Workflow templates library
- [ ] Enhanced debugging tools
- [ ] Performance monitoring dashboard

### 🚀 Future Releases (v1.2+)

- [ ] Multi-user collaboration features
- [ ] Cloud deployment options
- [ ] Advanced AI workflow generation
- [ ] Enterprise authentication systems
- [ ] Mobile-responsive optimizations
- [ ] Real-time collaborative editing

---

**🎯 Built with passion by the FlowGenio Team**

*Empowering automation through intelligent visual workflows*
---

**🎯 Built with passion by the FlowGenio Team**

*Empowering automation through intelligent visual workflows*

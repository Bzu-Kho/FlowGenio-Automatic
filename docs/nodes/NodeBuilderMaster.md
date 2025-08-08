# 🏗️ NodeBuilder Master - AI-Powered Node Generator

## Overview

El **NodeBuilder Master** es un nodo revolucionario que utiliza inteligencia artificial para generar nodos personalizados de FlowForge basados en especificaciones detalladas. Es como tener un desarrollador AI que crea nodos a medida según tus necesidades específicas.

## Features

### 🤖 AI-Powered Generation
- **Ollama Integration**: Utiliza modelos locales como Llama3 para privacidad total
- **OpenAI Support**: Compatible con GPT-3.5/GPT-4 para generación avanzada
- **Fallback System**: Sistema de respaldo si AI no está disponible

### 🎯 Comprehensive Node Creation
- **Multiple Categories**: Triggers, Data, Logic, Actions, Integrations, Utilities
- **Complexity Levels**: Simple, Medium, Complex, Expert
- **Code Styles**: FlowForge, n8n-compatible, Zapier-style, Custom

### 📚 Auto-Documentation
- **JSON Documentation**: Documentación estructurada automática
- **Markdown Files**: Documentación legible para humanos
- **Usage Examples**: Ejemplos de uso generados automáticamente

### 💾 Smart Saving
- **Auto-Detection**: Detecta automáticamente la carpeta de categoría
- **Custom Paths**: Permite guardar en ubicaciones personalizadas
- **Auto-Registration**: Registro automático en NodeRegistry (próximamente)

## Usage Examples

### Example 1: Simple Slack Notifier

```json
{
  "nodeSpecs": {
    "name": "SlackNotifier",
    "category": "actions",
    "description": "Send notifications to Slack channels using webhooks",
    "complexity": "medium"
  },
  "ioSpecs": {
    "inputs": [
      {
        "name": "message",
        "type": "string",
        "required": true,
        "description": "Message to send to Slack"
      },
      {
        "name": "channel",
        "type": "string",
        "required": false,
        "description": "Slack channel (optional)"
      }
    ],
    "outputs": [
      {
        "name": "response",
        "type": "object",
        "description": "Slack API response"
      },
      {
        "name": "success",
        "type": "boolean",
        "description": "Whether message was sent successfully"
      }
    ]
  },
  "aiSettings": {
    "useAI": true,
    "aiProvider": "ollama",
    "model": "llama3:latest",
    "codeStyle": "flowforge"
  }
}
```

### Example 2: Complex Database Connector

```json
{
  "nodeSpecs": {
    "name": "PostgreSQLConnector",
    "category": "data",
    "description": "Advanced PostgreSQL database connector with query builder, transactions, and connection pooling",
    "complexity": "expert"
  },
  "ioSpecs": {
    "inputs": [
      {
        "name": "query",
        "type": "string",
        "required": true,
        "description": "SQL query to execute"
      },
      {
        "name": "parameters",
        "type": "array",
        "required": false,
        "description": "Query parameters for prepared statements"
      }
    ],
    "outputs": [
      {
        "name": "results",
        "type": "array",
        "description": "Query results"
      },
      {
        "name": "metadata",
        "type": "object",
        "description": "Query metadata (affected rows, execution time, etc.)"
      }
    ]
  },
  "aiSettings": {
    "useAI": true,
    "aiProvider": "ollama",
    "model": "codellama:latest",
    "codeStyle": "flowforge"
  }
}
```

### Example 3: Custom Logic Node

```json
{
  "nodeSpecs": {
    "name": "DataTransformer",
    "category": "logic",
    "description": "Transform data using custom JavaScript expressions with validation and error handling",
    "complexity": "complex"
  },
  "ioSpecs": {
    "inputs": [
      {
        "name": "data",
        "type": "any",
        "required": true,
        "description": "Data to transform"
      },
      {
        "name": "schema",
        "type": "object",
        "required": false,
        "description": "JSON schema for validation"
      }
    ],
    "outputs": [
      {
        "name": "transformed",
        "type": "any",
        "description": "Transformed data"
      },
      {
        "name": "validation",
        "type": "object",
        "description": "Validation results"
      }
    ]
  }
}
```

## Configuration Options

### Node Specifications
- **name**: Node class name (PascalCase)
- **category**: Category folder (triggers, data, logic, actions, etc.)
- **description**: Detailed functionality description
- **complexity**: simple | medium | complex | expert

### AI Settings
- **aiProvider**: ollama | openai | anthropic
- **model**: Specific model name (llama3:latest, gpt-4, etc.)
- **codeStyle**: flowforge | n8n | zapier | custom

### Documentation Settings
- **generateDocs**: Generate comprehensive documentation
- **docFormat**: json | markdown | both
- **includeExamples**: Include usage examples and test cases

### Output Settings
- **autoSave**: Automatically save generated node
- **saveLocation**: auto | custom | temp
- **autoRegister**: Register node in NodeRegistry (coming soon)

## Generated Node Structure

Every generated node follows this structure:

```javascript
// 🤖 Auto-generated Node: NodeName
// Generated by NodeBuilder Master

import BaseNode from '../base/BaseNode.js';

class NodeName extends BaseNode {
  constructor(config = {}) {
    super('NodeName', {
      ...config,
      category: 'category',
      icon: 'icon-name',
      description: 'Node description'
    });
  }

  defineInputs() {
    // AI-generated input definitions
  }

  defineOutputs() {
    // AI-generated output definitions
  }

  defineProperties() {
    // AI-generated property configurations
  }

  async execute(inputs, context) {
    // AI-generated implementation
  }
}

export default NodeName;
```

## AI Prompting Strategy

The NodeBuilder Master uses sophisticated prompting to generate high-quality nodes:

1. **Context Setting**: Establishes the role as FlowForge expert
2. **Specification Analysis**: Analyzes requirements and complexity
3. **Pattern Matching**: References existing FlowForge patterns
4. **Code Generation**: Generates production-ready code
5. **Validation**: Validates structure and conventions

## Integration with Ollama

### Local AI Benefits
- **Privacy**: All processing happens locally
- **Speed**: Fast generation without API limits
- **Customization**: Can fine-tune models for FlowForge patterns
- **Offline**: Works without internet connection

### Ollama Setup
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull recommended models
ollama pull llama3:latest      # General purpose
ollama pull codellama:latest   # Code-specialized
ollama pull mistral:latest     # Fast alternative

# Start Ollama service
ollama serve
```

## Future Enhancements

- [ ] **Auto-Registration**: Automatic node registration in NodeRegistry
- [ ] **Testing Generation**: Generate unit tests for created nodes
- [ ] **Visual Designer**: GUI for specifying node requirements
- [ ] **Template Library**: Pre-built templates for common patterns
- [ ] **Version Control**: Track generated node versions
- [ ] **Marketplace Integration**: Share generated nodes with community

## Error Handling

The NodeBuilder Master includes comprehensive error handling:

- **Validation Errors**: Clear messages for invalid specifications
- **AI Service Errors**: Graceful fallback when AI services are unavailable
- **Code Validation**: Ensures generated code follows FlowForge patterns
- **File System Errors**: Handles save/load operations safely

## Performance Considerations

- **Async Generation**: Non-blocking AI generation
- **Caching**: Future caching of common patterns
- **Streaming**: Support for streaming responses from AI models
- **Resource Management**: Efficient handling of large code generations

---

**NodeBuilder Master** represents the future of no-code/low-code development, where AI assists in creating exactly the automation tools you need, when you need them.

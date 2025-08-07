// 🔧 FlowForge Base Node Class
// Foundation for all automation nodes

import { v4 as uuidv4 } from 'uuid';

class BaseNode {
  constructor(type, config = {}) {
    this.id = config.id || uuidv4();
    this.type = type;
    this.name = config.name || type;
    this.category = config.category || 'utility';
    this.position = config.position || { x: 0, y: 0 };
    this.data = config.data || {};
    this.inputs = this.defineInputs();
    this.outputs = this.defineOutputs();
    this.properties = this.defineProperties();
    this.version = '1.0.0';
    this.description = config.description || 'Base automation node';
    this.icon = config.icon || 'circle';
    this.color = this.getCategoryColor();
  }

  // Abstract methods - must be implemented by child classes
  defineInputs() {
    return [{ name: 'input', type: 'any', required: false }];
  }

  defineOutputs() {
    return [{ name: 'output', type: 'any' }];
  }

  defineProperties() {
    return {};
  }

  async execute(context) {
    throw new Error(`Execute method not implemented for ${this.type}`);
  }

  // Node lifecycle methods
  async initialize() {
    // Override in child classes for setup
    return true;
  }

  async validate() {
    // Override in child classes for validation
    return { valid: true, errors: [] };
  }

  async cleanup() {
    // Override in child classes for cleanup
    return true;
  }

  // Utility methods
  getCategoryColor() {
    const colors = {
      trigger: '#3B82F6',    // Blue
      logic: '#10B981',      // Green
      data: '#8B5CF6',       // Purple
      ai: '#F59E0B',         // Orange
      action: '#EF4444',     // Red
      utility: '#6B7280'     // Gray
    };
    return colors[this.category] || colors.utility;
  }

  getNodeDefinition() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      category: this.category,
      description: this.description,
      icon: this.icon,
      color: this.color,
      inputs: this.inputs,
      outputs: this.outputs,
      properties: this.properties,
      position: this.position,
      data: this.data,
      version: this.version
    };
  }

  updateProperty(key, value) {
    if (!this.data) this.data = {};
    this.data[key] = value;
    return this;
  }

  getProperty(key, defaultValue = null) {
    return this.data?.[key] ?? defaultValue;
  }

  // Connection management
  canConnectTo(targetNode, outputPort = 'output', inputPort = 'input') {
    const output = this.outputs.find(o => o.name === outputPort);
    const input = targetNode.inputs.find(i => i.name === inputPort);
    
    if (!output || !input) return false;
    
    // Type compatibility check
    if (output.type === 'any' || input.type === 'any') return true;
    if (output.type === input.type) return true;
    
    // Additional type compatibility rules
    const compatibleTypes = {
      'string': ['text', 'json'],
      'number': ['integer', 'float'],
      'object': ['json', 'array']
    };
    
    const compatible = compatibleTypes[output.type];
    return compatible && compatible.includes(input.type);
  }

  // Error handling
  createError(message, code = 'EXECUTION_ERROR', details = {}) {
    return {
      node: this.id,
      type: this.type,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Logging
  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      node: this.id,
      type: this.type,
      level,
      message,
      data
    };
    
    // TODO: Implement proper logging system
    console.log(`[${level.toUpperCase()}] ${this.type}(${this.id}): ${message} - BaseNode.js:145`, data);
    return logEntry;
  }

  // Serialization
  serialize() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      category: this.category,
      position: this.position,
      data: this.data,
      version: this.version
    };
  }

  static deserialize(data) {
    // Factory method to recreate node from serialized data
    // This will be overridden by the NodeRegistry
    return new BaseNode(data.type, data);
  }
}

export default BaseNode;

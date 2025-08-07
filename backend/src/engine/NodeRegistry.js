// 📚 FlowForge Node Registry
// Central registry for all available nodes

import ManualTrigger from '../nodes/triggers/ManualTrigger.js';
import HttpRequest from '../nodes/data/HttpRequest.js';
import IfElse from '../nodes/logic/IfElse.js';
import SetVariable from '../nodes/data/SetVariable.js';
import ConsoleOutput from '../nodes/actions/ConsoleOutput.js';

class NodeRegistry {
  constructor() {
    this.nodes = new Map();
    this.categories = new Map();
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    // Register core nodes
    this.registerNode('ManualTrigger', ManualTrigger);
    this.registerNode('HttpRequest', HttpRequest);
    this.registerNode('IfElse', IfElse);
    this.registerNode('SetVariable', SetVariable);
    this.registerNode('ConsoleOutput', ConsoleOutput);

    this.initialized = true;
    console.log(`✅ FlowForge Node Registry initialized with ${this.nodes.size} nodes`);
  }

  registerNode(type, nodeClass) {
    if (this.nodes.has(type)) {
      console.warn(`⚠️ Node type "${type}" already registered, overwriting...`);
    }

    // Validate node class
    if (!this.validateNodeClass(nodeClass)) {
      throw new Error(`Invalid node class for type "${type}"`);
    }

    // Create a sample instance to get metadata
    const sampleNode = new nodeClass();
    const metadata = {
      type,
      class: nodeClass,
      category: sampleNode.category,
      name: sampleNode.name,
      description: sampleNode.description,
      icon: sampleNode.icon,
      color: sampleNode.color,
      inputs: sampleNode.inputs,
      outputs: sampleNode.outputs,
      properties: sampleNode.properties,
      version: sampleNode.version
    };

    this.nodes.set(type, metadata);
    this.addToCategory(sampleNode.category, type);

    console.log(`📝 Registered node: ${type} (${sampleNode.category})`);
  }

  validateNodeClass(nodeClass) {
    try {
      const instance = new nodeClass();
      
      // Check required methods
      const requiredMethods = ['execute', 'defineInputs', 'defineOutputs', 'defineProperties'];
      for (const method of requiredMethods) {
        if (typeof instance[method] !== 'function') {
          console.error(`❌ Node class missing required method: ${method}`);
          return false;
        }
      }

      // Check required properties
      const requiredProps = ['type', 'category'];
      for (const prop of requiredProps) {
        if (!instance[prop]) {
          console.error(`❌ Node class missing required property: ${prop}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ Error validating node class:`, error);
      return false;
    }
  }

  addToCategory(category, nodeType) {
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    
    const categoryNodes = this.categories.get(category);
    if (!categoryNodes.includes(nodeType)) {
      categoryNodes.push(nodeType);
    }
  }

  createNode(type, config = {}) {
    if (!this.initialized) {
      this.initialize();
    }

    const nodeMetadata = this.nodes.get(type);
    if (!nodeMetadata) {
      throw new Error(`Unknown node type: ${type}`);
    }

    try {
      const nodeInstance = new nodeMetadata.class(config);
      console.log(`🏗️ Created node: ${type} (${nodeInstance.id})`);
      return nodeInstance;
    } catch (error) {
      throw new Error(`Failed to create node "${type}": ${error.message}`);
    }
  }

  getNodeTypes() {
    if (!this.initialized) {
      this.initialize();
    }
    return Array.from(this.nodes.keys());
  }

  getNodeMetadata(type) {
    return this.nodes.get(type);
  }

  getAllNodes() {
    if (!this.initialized) {
      this.initialize();
    }
    return Array.from(this.nodes.values());
  }

  getNodesByCategory(category) {
    if (!this.initialized) {
      this.initialize();
    }
    
    const nodeTypes = this.categories.get(category) || [];
    return nodeTypes.map(type => this.nodes.get(type)).filter(Boolean);
  }

  getCategories() {
    if (!this.initialized) {
      this.initialize();
    }
    return Array.from(this.categories.keys());
  }

  getCategoriesWithNodes() {
    if (!this.initialized) {
      this.initialize();
    }

    const result = {};
    for (const [category, nodeTypes] of this.categories.entries()) {
      result[category] = nodeTypes.map(type => this.nodes.get(type)).filter(Boolean);
    }
    return result;
  }

  // Dynamic node registration (for plugins/extensions)
  registerCustomNode(type, nodeClass, metadata = {}) {
    try {
      this.registerNode(type, nodeClass);
      
      // Store additional metadata for custom nodes
      const nodeMetadata = this.nodes.get(type);
      nodeMetadata.custom = true;
      nodeMetadata.author = metadata.author;
      nodeMetadata.source = metadata.source;
      nodeMetadata.tags = metadata.tags || [];
      
      console.log(`🔌 Registered custom node: ${type}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to register custom node "${type}":`, error);
      return false;
    }
  }

  unregisterNode(type) {
    if (!this.nodes.has(type)) {
      return false;
    }

    const nodeMetadata = this.nodes.get(type);
    this.nodes.delete(type);

    // Remove from category
    const categoryNodes = this.categories.get(nodeMetadata.category);
    if (categoryNodes) {
      const index = categoryNodes.indexOf(type);
      if (index > -1) {
        categoryNodes.splice(index, 1);
      }
    }

    console.log(`🗑️ Unregistered node: ${type}`);
    return true;
  }

  // Validation and testing
  async validateNode(type, testData = {}) {
    const nodeMetadata = this.nodes.get(type);
    if (!nodeMetadata) {
      throw new Error(`Node type "${type}" not found`);
    }

    try {
      // Create test instance
      const testNode = this.createNode(type);
      
      // Test initialization
      await testNode.initialize();
      
      // Test validation
      const validation = await testNode.validate();
      if (!validation.valid) {
        return {
          valid: false,
          errors: validation.errors,
          type: 'validation'
        };
      }

      // Test execution with mock context (if test data provided)
      if (Object.keys(testData).length > 0) {
        const mockContext = this.createMockContext(testData);
        await testNode.execute(mockContext);
      }

      await testNode.cleanup();

      return {
        valid: true,
        message: `Node "${type}" validation successful`
      };

    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
        type: 'execution'
      };
    }
  }

  createMockContext(inputData = {}) {
    return {
      getInputData: (port = 'input') => inputData[port] || inputData,
      getVariable: (name) => null, // Mock variable store
      setVariable: (name, value) => {}, // Mock variable store
      executionId: 'test-' + Date.now()
    };
  }

  // Export/Import node definitions
  exportNodeDefinitions() {
    const definitions = {};
    
    for (const [type, metadata] of this.nodes.entries()) {
      definitions[type] = {
        type: metadata.type,
        category: metadata.category,
        name: metadata.name,
        description: metadata.description,
        icon: metadata.icon,
        color: metadata.color,
        inputs: metadata.inputs,
        outputs: metadata.outputs,
        properties: metadata.properties,
        version: metadata.version,
        custom: metadata.custom || false
      };
    }

    return definitions;
  }

  getNodePalette() {
    const categories = this.getCategoriesWithNodes();
    const palette = [];

    for (const [category, nodes] of Object.entries(categories)) {
      const categoryInfo = {
        category,
        displayName: this.getCategoryDisplayName(category),
        icon: this.getCategoryIcon(category),
        color: this.getCategoryColor(category),
        nodes: nodes.map(node => ({
          type: node.type,
          name: node.name,
          description: node.description,
          icon: node.icon,
          color: node.color
        }))
      };
      
      palette.push(categoryInfo);
    }

    return palette;
  }

  getCategoryDisplayName(category) {
    const displayNames = {
      trigger: 'Triggers',
      logic: 'Logic & Flow',
      data: 'Data',
      ai: 'AI & LLM',
      action: 'Actions',
      utility: 'Utilities'
    };
    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  getCategoryIcon(category) {
    const icons = {
      trigger: 'play',
      logic: 'git-branch',
      data: 'database',
      ai: 'brain',
      action: 'zap',
      utility: 'settings'
    };
    return icons[category] || 'circle';
  }

  getCategoryColor(category) {
    const colors = {
      trigger: '#3B82F6',
      logic: '#10B981',
      data: '#8B5CF6',
      ai: '#F59E0B',
      action: '#EF4444',
      utility: '#6B7280'
    };
    return colors[category] || '#6B7280';
  }
}

// Create singleton instance
const nodeRegistry = new NodeRegistry();

export default nodeRegistry;

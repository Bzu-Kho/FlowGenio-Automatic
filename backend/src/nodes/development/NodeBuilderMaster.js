// 🔧 NodeBuilder Master v2.0 - AI-Powered Node Generator & Transformer
// Advanced node with internal flow automation and virtual processing nodes

import BaseNode from '../base/BaseNode.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NodeBuilderMaster extends BaseNode {
  constructor(config = {}) {
    super('NodeBuilderMaster', {
      ...config,
      category: 'development',
      icon: 'magic-wand',
      description: 'AI-powered node generator with internal flow automation',
      version: '2.0.0',
      aiEnabled: true
    });
    
    // State management
    this.memory = new Map();
    this.generatedNodes = new Map();
    this.generationHistory = [];
    this.currentTransformation = null;
    this.isTransformed = false;
    
    // Internal Flow System - Virtual Nodes
    this.internalNodes = new Map();
    this.flowRoutes = [];
    this.flowState = {
      currentStep: 0,
      totalSteps: 0,
      data: null,
      transformations: [],
      errors: []
    };
    
    // Initialize virtual processing nodes
    this.initializeVirtualNodes();
    
    // Load persisted memory
    this.loadMemory();
  }

  defineInputs() {
    return [
      {
        name: 'trigger',
        type: 'any',
        required: false,
        description: 'Trigger input to start generation or execute flow'
      },
      {
        name: 'specification',
        type: 'string',
        required: false,
        description: 'Node specification (overrides config if provided)'
      },
      {
        name: 'data',
        type: 'any',
        required: false,
        description: 'Data input for processing through internal flow'
      },
      {
        name: 'flowConfig',
        type: 'object',
        required: false,
        description: 'Custom flow configuration for internal processing'
      },
      {
        name: 'memory',
        type: 'object',
        required: false,
        description: 'Memory context from previous executions'
      }
    ];
  }

  defineOutputs() {
    return [
      {
        name: 'success',
        type: 'any',
        description: 'Success output - processed data or generated node'
      },
      {
        name: 'transformed',
        type: 'any',
        description: 'Data transformed through internal flow'
      },
      {
        name: 'flowState',
        type: 'object',
        description: 'Internal flow execution state and metrics'
      },
      {
        name: 'memory',
        type: 'object',
        description: 'Updated memory context'
      },
      {
        name: 'error',
        type: 'string',
        description: 'Error output when processing fails'
      },
      {
        name: 'nodeReady',
        type: 'object',
        description: 'Signal when generated node is ready'
      },
      {
        name: 'debug',
        type: 'object',
        description: 'Debug information and flow trace'
      }
    ];
  }

  defineProperties() {
    return {
      // === OPERATION MODE ===
      operationMode: {
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Auto (Generate + Flow)' },
          { value: 'generate', label: 'Generate Only' },
          { value: 'flow', label: 'Flow Processing Only' },
          { value: 'transform', label: 'Transform Mode' }
        ],
        label: 'Operation Mode',
        description: 'How the node should operate'
      },
      
      // === FLOW AUTOMATION ===
      enableInternalFlow: {
        type: 'boolean',
        default: true,
        label: 'Enable Internal Flow',
        description: 'Use internal virtual nodes for data processing'
      },
      flowStrategy: {
        type: 'select',
        default: 'adaptive',
        options: [
          { value: 'adaptive', label: 'Adaptive (AI-driven)' },
          { value: 'linear', label: 'Linear Processing' },
          { value: 'conditional', label: 'Conditional Branching' },
          { value: 'parallel', label: 'Parallel Processing' },
          { value: 'custom', label: 'Custom Flow' }
        ],
        label: 'Flow Strategy',
        description: 'Internal flow processing strategy'
      },
      maxFlowSteps: {
        type: 'number',
        default: 10,
        min: 1,
        max: 50,
        label: 'Max Flow Steps',
        description: 'Maximum number of internal processing steps'
      },
      
      // === CORE SPECIFICATION ===
      nodeSpecification: {
        type: 'textarea',
        default: '',
        label: 'Node Specification',
        description: 'Detailed description of the node to generate or flow to create',
        placeholder: 'Describe the functionality, processing steps, inputs, outputs...',
        rows: 4
      },
      nodeName: {
        type: 'string',
        default: '',
        label: 'Node Name',
        description: 'Name for the generated node (auto-generated if empty)',
        placeholder: 'MyCustomNode'
      },
      nodeCategory: {
        type: 'select',
        default: 'custom',
        options: [
          { value: 'data', label: 'Data Processing' },
          { value: 'logic', label: 'Logic & Control' },
          { value: 'utility', label: 'Utility' },
          { value: 'custom', label: 'Custom' },
          { value: 'ai', label: 'AI & ML' },
          { value: 'integration', label: 'Integration' },
          { value: 'flow', label: 'Flow Automation' }
        ],
        label: 'Node Category',
        description: 'Category for the generated node'
      },
      
      // === AI CONFIGURATION ===
      aiMode: {
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Auto (Ollama → OpenAI)' },
          { value: 'ollama', label: 'Ollama (Local)' },
          { value: 'openai', label: 'OpenAI (Cloud)' },
          { value: 'disabled', label: 'Disabled' }
        ],
        label: 'AI Mode',
        description: 'AI provider preference'
      },
      aiModel: {
        type: 'string',
        default: 'llama3.1',
        label: 'AI Model',
        description: 'Specific AI model to use (e.g., llama3.1, gpt-4)',
        placeholder: 'llama3.1'
      },
      aiTemperature: {
        type: 'number',
        default: 0.7,
        min: 0,
        max: 1,
        step: 0.1,
        label: 'AI Temperature',
        description: 'Creativity level (0 = deterministic, 1 = creative)'
      },
      
      // === MEMORY & PERSISTENCE ===
      useMemory: {
        type: 'boolean',
        default: true,
        label: 'Use Memory',
        description: 'Enable memory for context persistence between executions'
      },
      memoryKey: {
        type: 'string',
        default: 'default',
        label: 'Memory Key',
        description: 'Memory namespace for this node instance',
        placeholder: 'default'
      },
      saveGenerated: {
        type: 'boolean',
        default: true,
        label: 'Save Generated Nodes',
        description: 'Save generated nodes to filesystem for reuse'
      },
      autoTransform: {
        type: 'boolean',
        default: false,
        label: 'Auto Transform',
        description: 'Automatically transform into generated node on success'
      },
      
      // === FLOW CONTROL ===
      flowMemory: {
        type: 'boolean',
        default: true,
        label: 'Flow Memory',
        description: 'Remember flow state between steps'
      },
      flowRetry: {
        type: 'boolean',
        default: true,
        label: 'Flow Retry',
        description: 'Auto-retry failed flow steps'
      },
      flowOptimization: {
        type: 'boolean',
        default: true,
        label: 'Flow Optimization',
        description: 'Optimize flow routes dynamically'
      },
      
      // === GENERATION OPTIONS ===
      includeDocumentation: {
        type: 'boolean',
        default: true,
        label: 'Include Documentation',
        description: 'Generate comprehensive documentation'
      },
      includeTests: {
        type: 'boolean',
        default: false,
        label: 'Include Tests',
        description: 'Generate test files for the node'
      },
      includeExamples: {
        type: 'boolean',
        default: true,
        label: 'Include Examples',
        description: 'Generate usage examples'
      },
      
      // === ADVANCED ===
      outputDirectory: {
        type: 'string',
        default: './generated-nodes',
        label: 'Output Directory',
        description: 'Directory to save generated nodes',
        placeholder: './generated-nodes'
      },
      debugMode: {
        type: 'boolean',
        default: false,
        label: 'Debug Mode',
        description: 'Enable detailed logging and debugging information'
      }
    };
  }

  // ===================================
  // VIRTUAL NODES SYSTEM - INTERNAL FLOW
  // ===================================

  initializeVirtualNodes() {
    // Virtual Input Processing Node
    this.internalNodes.set('input-processor', {
      name: 'Input Processor',
      type: 'virtual-input',
      execute: async (data, context) => {
        this.log('🔍 Virtual Input Processor', { data });
        
        // Analyze input data structure
        const analysis = this.analyzeInputData(data);
        
        return {
          success: true,
          data: data,
          analysis,
          recommendations: this.getProcessingRecommendations(analysis)
        };
      }
    });

    // Virtual Data Transformer Node
    this.internalNodes.set('data-transformer', {
      name: 'Data Transformer',
      type: 'virtual-transform',
      execute: async (data, context, config) => {
        this.log('🔄 Virtual Data Transformer', { data, config });
        
        let transformedData = data;
        
        // Apply transformation rules
        if (config && config.rules && config.rules.length > 0) {
          for (const rule of config.rules) {
            transformedData = this.applyTransformRule(transformedData, rule);
          }
        }
        
        return {
          success: true,
          data: transformedData,
          transformationApplied: config?.rules || [],
          originalData: data
        };
      }
    });

    // Virtual Output Formatter Node
    this.internalNodes.set('output-formatter', {
      name: 'Output Formatter',
      type: 'virtual-output',
      execute: async (data, context, config) => {
        this.log('📤 Virtual Output Formatter', { data, config });
        
        const formattedOutput = this.formatOutput(data, config);
        
        return {
          success: true,
          data: formattedOutput,
          format: config?.format || 'default',
          metadata: {
            processedAt: new Date().toISOString(),
            nodeId: this.id,
            flowStep: context.flowStep || 'final'
          }
        };
      }
    });

    this.log('🏗️ Virtual nodes initialized', {
      count: this.internalNodes.size,
      nodes: Array.from(this.internalNodes.keys())
    });
  }

  // Flow execution methods...
  async executeInternalFlow(data, properties, context) {
    this.log('🌊 Starting internal flow execution');
    
    try {
      const route = [
        { nodeId: 'input-processor', config: {} },
        { nodeId: 'data-transformer', config: {} },
        { nodeId: 'output-formatter', config: {} }
      ];
      
      let currentData = data;
      const flowResults = [];
      
      for (let i = 0; i < route.length; i++) {
        const step = route[i];
        
        try {
          this.log(`🔄 Flow step ${i + 1}/${route.length}: ${step.nodeId}`);
          
          const virtualNode = this.internalNodes.get(step.nodeId);
          if (!virtualNode) {
            throw new Error(`Virtual node not found: ${step.nodeId}`);
          }
          
          const stepContext = {
            ...context,
            flowStep: i + 1,
            totalSteps: route.length
          };
          
          const result = await virtualNode.execute(currentData, stepContext, step.config);
          
          if (result.success) {
            currentData = result.data;
            flowResults.push({
              step: i + 1,
              nodeId: step.nodeId,
              result: result
            });
          } else {
            throw new Error(result.error || 'Virtual node execution failed');
          }
          
        } catch (error) {
          this.log(`❌ Flow step ${i + 1} failed`, error);
          throw error;
        }
      }
      
      return {
        success: true,
        data: currentData,
        flowResults: flowResults,
        route: route
      };
      
    } catch (error) {
      this.log('❌ Internal flow execution failed', error);
      return {
        success: false,
        error: error.message,
        data: data
      };
    }
  }

  // Helper methods
  analyzeInputData(data) {
    return {
      dataType: typeof data,
      size: JSON.stringify(data).length,
      needsTransformation: true,
      benefitsFromAI: typeof data === 'string' && data.length > 50
    };
  }

  getProcessingRecommendations(analysis) {
    return ['Process with internal flow', 'Apply transformations'];
  }

  applyTransformRule(data, rule) {
    return data; // Placeholder
  }

  formatOutput(data, config) {
    return {
      data: data,
      metadata: {
        type: typeof data,
        processed: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  async execute(inputs, context) {
    const startTime = Date.now();
    
    console.log('🔧 NodeBuilder Master execute called');
    console.log('  - this.data:', this.data);
    console.log('  - inputs:', inputs);
    console.log('  - context:', context);
    
    // FIXED: Use this.data which contains the actual configured properties
    const configuredProperties = this.data || {};
    const defaultProperties = this.defineProperties();
    
    // Merge default properties with configured ones from this.data
    const properties = {
      ...Object.fromEntries(
        Object.entries(defaultProperties).map(([key, prop]) => [key, prop.default])
      ),
      ...configuredProperties
    };
    
    console.log('🔧 Final properties:', properties);
    
    try {
      // Initialize execution context
      const execContext = {
        requestId: context.requestId || `nodebuilder-${Date.now()}`,
        timestamp: new Date().toISOString(),
        properties,
        inputs
      };
      
      // Debug logging
      if (properties.debugMode) {
        this.log('🔧 NodeBuilder Master execution started', {
          context: execContext,
          currentState: {
            isTransformed: this.isTransformed,
            hasCurrentTransformation: !!this.currentTransformation
          }
        });
      }
      
      // === OPERATION MODE ROUTING ===
      const operationMode = properties.operationMode || 'auto';
      
      if (operationMode === 'flow' || (operationMode === 'auto' && inputs.data)) {
        // FLOW PROCESSING MODE
        this.log('🌊 Entering flow processing mode');
        
        const flowResult = await this.executeInternalFlow(
          inputs.data || inputs.trigger || 'default data', 
          properties, 
          execContext
        );
        
        // Prepare flow outputs
        const executionTime = Date.now() - startTime;
        const outputs = {
          transformed: flowResult.data,
          flowState: {
            success: flowResult.success,
            steps: flowResult.flowResults?.length || 0,
            executionTime,
            route: flowResult.route
          }
        };
        
        if (flowResult.success) {
          outputs.success = flowResult.data;
        } else {
          outputs.error = flowResult.error;
        }
        
        if (properties.debugMode) {
          outputs.debug = {
            executionTime,
            flowResults: flowResult.flowResults,
            context: execContext
          };
        }
        
        return outputs;
      }
      
      // === NODE GENERATION MODE ===
      if (operationMode === 'generate' || operationMode === 'auto') {
        this.log('🏗️ Entering node generation mode');
        
        // Check if this node is already transformed
        if (this.isTransformed && this.currentTransformation) {
          return await this.executeTransformedNode(inputs, execContext);
        }
        
        // Get specification from input or properties
        const specification = inputs.specification || properties.nodeSpecification;
        if (!specification || specification.trim().length === 0) {
          throw new Error('Node specification is required for generation mode');
        }
        
        // Generate the node
        const generationResult = await this.generateNode(specification, execContext);
        
        // Auto-transform if enabled
        if (properties.autoTransform && generationResult.success) {
          await this.transformToNode(generationResult);
        }
        
        // Prepare generation outputs
        const executionTime = Date.now() - startTime;
        const outputs = {
          success: generationResult
        };
        
        if (generationResult.success) {
          outputs.nodeReady = {
            nodeName: generationResult.nodeName,
            nodeType: generationResult.nodeType,
            filePath: generationResult.filePath,
            canTransform: true
          };
        } else {
          outputs.error = generationResult.error;
        }
        
        if (properties.debugMode) {
          outputs.debug = {
            executionTime,
            context: execContext,
            generationResult
          };
        }
        
        return outputs;
      }
      
      // === TRANSFORM MODE ===
      if (operationMode === 'transform') {
        this.log('🔄 Entering transform mode');
        
        if (!this.currentTransformation) {
          throw new Error('No transformation available. Generate a node first.');
        }
        
        return await this.executeTransformedNode(inputs, execContext);
      }
      
      // Default fallback
      throw new Error(`Unknown operation mode: ${operationMode}`);
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      this.log('❌ NodeBuilder Master execution failed', {
        error: error.message,
        executionTime
      });
      
      return {
        error: error.message,
        flowState: {
          success: false,
          executionTime,
          error: error.message
        }
      };
    }
  }

  async generateNode(specification, context) {
    const properties = this.config.properties || {};
    
    try {
      // Prepare generation parameters
      const generationParams = {
        specification,
        nodeName: properties.nodeName || this.generateNodeName(specification),
        nodeCategory: properties.nodeCategory || 'custom',
        aiModel: properties.aiModel || 'llama3.1',
        temperature: properties.aiTemperature || 0.7,
        includeDocumentation: properties.includeDocumentation !== false,
        includeTests: properties.includeTests === true,
        includeExamples: properties.includeExamples !== false,
        context: context.memory
      };
      
      this.log('🤖 Starting node generation', generationParams);
      
      // Generate node using template (AI integration comes later)
      const generationResult = await this.generateNodeTemplate(generationParams);
      
      // Save generated node if enabled
      if (properties.saveGenerated && generationResult.success) {
        await this.saveGeneratedNode(generationResult, properties.outputDirectory);
      }
      
      // Add to generation history
      this.generationHistory.push({
        timestamp: context.timestamp,
        specification,
        result: generationResult,
        params: generationParams
      });
      
      // Limit history size
      if (this.generationHistory.length > 50) {
        this.generationHistory = this.generationHistory.slice(-50);
      }
      
      return generationResult;
      
    } catch (error) {
      this.log('❌ Node generation failed', error);
      return {
        success: false,
        error: error.message,
        aiProvider: 'none',
        aiModel: 'none'
      };
    }
  }

  async generateNodeTemplate(params) {
    const nodeName = params.nodeName || 'CustomNode';
    const nodeType = this.sanitizeNodeName(nodeName);
    
    // Generate node code using template
    const nodeCode = this.generateNodeCodeTemplate(nodeType, params);
    
    // Generate documentation if requested
    let documentation = null;
    if (params.includeDocumentation) {
      documentation = this.generateDocumentationTemplate(nodeType, params);
    }
    
    // Generate tests if requested
    let tests = null;
    if (params.includeTests) {
      tests = this.generateTestTemplate(nodeType, params);
    }
    
    return {
      success: true,
      nodeName,
      nodeType,
      nodeCode,
      documentation,
      tests,
      category: params.nodeCategory,
      specification: params.specification,
      generatedAt: new Date().toISOString(),
      aiProvider: 'template',
      aiModel: 'template-based'
    };
  }

  generateNodeCodeTemplate(nodeType, params) {
    return `// 🎯 ${nodeType} - Generated by NodeBuilder Master
// ${params.specification}

import BaseNode from '../base/BaseNode.js';

class ${nodeType} extends BaseNode {
  constructor(config = {}) {
    super('${nodeType}', {
      ...config,
      category: '${params.nodeCategory}',
      icon: 'gear',
      description: '${params.specification.substring(0, 100).replace(/'/g, "\\'")}...',
      version: '1.0.0',
      generated: true
    });
  }

  defineInputs() {
    return [
      {
        name: 'input',
        type: 'any',
        required: true,
        description: 'Main input data'
      }
    ];
  }

  defineOutputs() {
    return [
      {
        name: 'output',
        type: 'any',
        description: 'Processed output data'
      },
      {
        name: 'error',
        type: 'string',
        description: 'Error message if processing fails'
      }
    ];
  }

  defineProperties() {
    return {
      enabled: {
        type: 'boolean',
        default: true,
        label: 'Enabled',
        description: 'Enable/disable this node'
      }
    };
  }

  async execute(inputs, context) {
    try {
      const properties = this.config.properties || {};
      
      if (!properties.enabled) {
        return { error: 'Node is disabled' };
      }
      
      // TODO: Implement the specified functionality
      // Specification: ${params.specification.replace(/\n/g, '\\n')}
      
      this.log('Processing input', inputs.input);
      
      // Placeholder implementation - return the input
      const result = inputs.input;
      
      return {
        output: result
      };
      
    } catch (error) {
      this.log('Execution error', error);
      return {
        error: error.message
      };
    }
  }
  
  log(message, data = null) {
    console.log(\`[\${new Date().toISOString()}] ${nodeType}: \${message}\`);
    if (data) {
      console.log('  Data:', data);
    }
  }
}

export default ${nodeType};`;
  }

  generateDocumentationTemplate(nodeType, params) {
    return `# ${nodeType}

## Description
${params.specification}

## Category
${params.nodeCategory}

## Inputs
- **input** (any, required): Main input data

## Outputs
- **output** (any): Processed output data
- **error** (string): Error message if processing fails

## Properties
- **enabled** (boolean): Enable/disable this node

## Usage Example
\`\`\`javascript
// Add ${nodeType} to your workflow
const node = new ${nodeType}({
  id: 'my-${nodeType.toLowerCase()}',
  properties: {
    enabled: true
  }
});

// Execute the node
const result = await node.execute({
  input: 'your data here'
}, { requestId: 'test' });

console.log(result.output);
\`\`\`

## Generated Information
- **Generated at**: ${new Date().toISOString()}
- **Generated by**: NodeBuilder Master v2.0
- **Specification**: ${params.specification}

## Implementation Notes
This node was generated automatically. To customize its behavior:
1. Edit the \`execute\` method implementation
2. Add custom properties in \`defineProperties\`
3. Modify inputs/outputs in \`defineInputs\`/\`defineOutputs\`
4. Update the specification and regenerate if needed
`;
  }

  generateTestTemplate(nodeType, params) {
    return `// Test file for ${nodeType}
import ${nodeType} from './${nodeType}.js';

describe('${nodeType}', () => {
  let node;
  
  beforeEach(() => {
    node = new ${nodeType}({
      id: 'test-${nodeType.toLowerCase()}'
    });
  });
  
  test('should create instance correctly', () => {
    expect(node).toBeDefined();
    expect(node.type).toBe('${nodeType}');
    expect(node.config.category).toBe('${params.nodeCategory}');
  });
  
  test('should have correct inputs and outputs', () => {
    const inputs = node.defineInputs();
    const outputs = node.defineOutputs();
    
    expect(inputs).toHaveLength(1);
    expect(inputs[0].name).toBe('input');
    
    expect(outputs).toHaveLength(2);
    expect(outputs.map(o => o.name)).toContain('output');
    expect(outputs.map(o => o.name)).toContain('error');
  });
  
  test('should execute without errors', async () => {
    const inputs = { input: 'test data' };
    const context = { requestId: 'test' };
    
    const result = await node.execute(inputs, context);
    
    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
    expect(result.output).toBe('test data');
  });
  
  test('should handle disabled state', async () => {
    node.config.properties = { enabled: false };
    
    const inputs = { input: 'test data' };
    const context = { requestId: 'test' };
    
    const result = await node.execute(inputs, context);
    
    expect(result.error).toBe('Node is disabled');
  });
});`;
  }

  async saveGeneratedNode(generationResult, outputDirectory) {
    try {
      const baseDir = path.resolve(outputDirectory || './generated-nodes');
      const nodeDir = path.join(baseDir, generationResult.nodeType);
      
      // Ensure directories exist
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }
      if (!fs.existsSync(nodeDir)) {
        fs.mkdirSync(nodeDir, { recursive: true });
      }
      
      // Save node code
      const nodeFile = path.join(nodeDir, `${generationResult.nodeType}.js`);
      fs.writeFileSync(nodeFile, generationResult.nodeCode, 'utf8');
      generationResult.filePath = nodeFile;
      
      // Save documentation
      if (generationResult.documentation) {
        const docFile = path.join(nodeDir, 'README.md');
        fs.writeFileSync(docFile, generationResult.documentation, 'utf8');
      }
      
      // Save tests
      if (generationResult.tests) {
        const testFile = path.join(nodeDir, `${generationResult.nodeType}.test.js`);
        fs.writeFileSync(testFile, generationResult.tests, 'utf8');
      }
      
      // Save manifest
      const manifest = {
        nodeType: generationResult.nodeType,
        nodeName: generationResult.nodeName,
        category: generationResult.category,
        specification: generationResult.specification,
        generatedAt: generationResult.generatedAt,
        files: {
          node: `${generationResult.nodeType}.js`,
          documentation: generationResult.documentation ? 'README.md' : null,
          tests: generationResult.tests ? `${generationResult.nodeType}.test.js` : null
        }
      };
      
      const manifestFile = path.join(nodeDir, 'manifest.json');
      fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf8');
      
      this.log('💾 Generated node saved successfully', {
        nodeType: generationResult.nodeType,
        directory: nodeDir
      });
      
    } catch (error) {
      this.log('❌ Failed to save generated node', error);
      throw error;
    }
  }

  async transformToNode(generationResult) {
    try {
      this.currentTransformation = generationResult;
      this.isTransformed = true;
      
      this.log('🔄 Transformed to generated node', {
        nodeType: generationResult.nodeType,
        nodeName: generationResult.nodeName
      });
      
      // Update node appearance
      this.config.name = generationResult.nodeName;
      this.config.description = `Transformed: ${generationResult.specification.substring(0, 50)}...`;
      this.config.icon = 'magic-wand-sparkles';
      
    } catch (error) {
      this.log('❌ Transformation failed', error);
      throw error;
    }
  }

  async executeTransformedNode(inputs, context) {
    try {
      if (!this.currentTransformation) {
        throw new Error('No transformation available');
      }
      
      // Simulate execution of the generated node
      this.log('🎯 Executing transformed node', {
        nodeType: this.currentTransformation.nodeType,
        inputs: inputs.data || inputs.trigger
      });
      
      return {
        success: {
          message: 'Transformed node executed successfully',
          nodeType: this.currentTransformation.nodeType,
          result: inputs.data || inputs.trigger || 'No data provided'
        },
        memory: context.memory
      };
      
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  // Memory Management
  loadMemory() {
    try {
      const memoryFile = path.join(__dirname, '.nodebuilder-memory.json');
      if (fs.existsSync(memoryFile)) {
        const data = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
        this.memory = new Map(data.memory || []);
        this.generationHistory = data.history || [];
      }
    } catch (error) {
      this.log('⚠️ Failed to load memory', error);
    }
  }

  saveMemory() {
    try {
      const memoryFile = path.join(__dirname, '.nodebuilder-memory.json');
      const data = {
        memory: Array.from(this.memory.entries()),
        history: this.generationHistory.slice(-20),
        savedAt: new Date().toISOString()
      };
      fs.writeFileSync(memoryFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      this.log('⚠️ Failed to save memory', error);
    }
  }

  getMemory(key) {
    return this.memory.get(key);
  }

  updateMemory(key, data) {
    this.memory.set(key, {
      ...this.memory.get(key),
      ...data,
      updatedAt: new Date().toISOString()
    });
    
    // Auto-save memory occasionally
    if (Math.random() < 0.1) {
      this.saveMemory();
    }
    
    return this.memory.get(key);
  }

  // Utility Methods
  generateNodeName(specification) {
    // Extract potential node name from specification
    const words = specification.split(/\s+/).slice(0, 3);
    return words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join('') + 'Node';
  }

  sanitizeNodeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, 'N$&');
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] NodeBuilderMaster: ${message}`);
    if (data && this.config.properties?.debugMode) {
      console.log('  Data:', JSON.stringify(data, null, 2));
    }
  }
}

export default NodeBuilderMaster;

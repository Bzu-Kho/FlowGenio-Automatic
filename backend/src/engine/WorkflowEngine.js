// ⚡ FlowForge Workflow Engine
// Executes workflows with proper node orchestration

import { v4 as uuidv4 } from 'uuid';
import eventBus from '../shared/EventBus.js';
import { WorkflowStarted, NodeCompleted } from '../domain/events.js';
import nodeRegistry from './registry/NodeRegistry.js';

class WorkflowEngine {
  constructor() {
    this.activeExecutions = new Map();
    this.executionHistory = [];
    this.maxHistorySize = 1000;
  }

  async executeWorkflow(workflow, triggerData = {}, options = {}) {
    const executionId = uuidv4();
    const execution = {
      id: executionId,
      workflowId: workflow.id,
      startTime: new Date(),
      status: 'running',
      nodes: new Map(),
      variables: new Map(),
      errors: [],
      triggerData,
      options: {
        debug: options.debug || false,
        timeout: options.timeout || 300000, // 5 minutes default
        maxNodes: options.maxNodes || 100,
        ...options,
      },
    };

    this.activeExecutions.set(executionId, execution);

    // Emit workflow started event
    eventBus.publish('workflow.started', new WorkflowStarted(workflow.id, executionId));

    try {
      this.log(executionId, 'info', 'Starting workflow execution', {
        workflowId: workflow.id,
        triggerData,
      });

      // Validate workflow
      const validation = this.validateWorkflow(workflow);
      if (!validation.valid) {
        throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
      }

      // Initialize nodes
      await this.initializeNodes(execution, workflow);

      // Find trigger nodes
      const triggerNodes = this.findTriggerNodes(workflow);
      if (triggerNodes.length === 0) {
        throw new Error('No trigger nodes found in workflow');
      }

      // Execute workflow starting from triggers
      const results = [];
      for (const triggerNode of triggerNodes) {
        const result = await this.executeFromNode(execution, workflow, triggerNode.id, triggerData);
        results.push(result);
      }

      // Complete execution
      execution.endTime = new Date();
      execution.duration = execution.endTime - execution.startTime;
      execution.status = 'completed';
      execution.results = results;

      this.log(executionId, 'info', 'Workflow execution completed', {
        duration: execution.duration,
        nodesExecuted: execution.nodes.size,
      });

      return this.getExecutionResult(execution);
    } catch (error) {
      execution.endTime = new Date();
      execution.duration = execution.endTime - execution.startTime;
      execution.status = 'failed';
      execution.error = error.message;
      execution.errors.push({
        message: error.message,
        timestamp: new Date(),
        stack: error.stack,
      });

      this.log(executionId, 'error', 'Workflow execution failed', { error: error.message });

      throw error;
    } finally {
      // Clean up
      await this.cleanupExecution(execution, workflow);
      this.moveToHistory(execution);
    }
  }

  validateWorkflow(workflow) {
    const errors = [];

    // Basic structure validation
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have a nodes array');
    }

    if (!workflow.connections || !Array.isArray(workflow.connections)) {
      errors.push('Workflow must have a connections array');
    }

    if (workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    // Validate node references in connections
    const nodeIds = new Set(workflow.nodes.map((n) => n.id));
    for (const connection of workflow.connections) {
      if (!nodeIds.has(connection.source)) {
        errors.push(`Connection references unknown source node: ${connection.source}`);
      }
      if (!nodeIds.has(connection.target)) {
        errors.push(`Connection references unknown target node: ${connection.target}`);
      }
    }

    // Check for circular dependencies
    if (this.hasCircularDependencies(workflow)) {
      errors.push('Workflow contains circular dependencies');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  hasCircularDependencies(workflow) {
    const graph = this.buildDependencyGraph(workflow);
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (nodeId) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const dependencies = graph.get(nodeId) || [];
      for (const dep of dependencies) {
        if (!visited.has(dep)) {
          if (hasCycle(dep)) return true;
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of graph.keys()) {
      if (!visited.has(nodeId)) {
        if (hasCycle(nodeId)) return true;
      }
    }

    return false;
  }

  buildDependencyGraph(workflow) {
    const graph = new Map();

    // Initialize all nodes
    for (const node of workflow.nodes) {
      graph.set(node.id, []);
    }

    // Add dependencies from connections
    for (const connection of workflow.connections) {
      const dependencies = graph.get(connection.target) || [];
      dependencies.push(connection.source);
      graph.set(connection.target, dependencies);
    }

    return graph;
  }

  findTriggerNodes(workflow) {
    return workflow.nodes.filter((node) => {
      const metadata = nodeRegistry.getNodeMetadata(node.type);
      return metadata && metadata.category === 'trigger';
    });
  }

  async initializeNodes(execution, workflow) {
    for (const nodeData of workflow.nodes) {
      try {
        const node = nodeRegistry.createNode(nodeData.type, nodeData);
        await node.initialize();
        execution.nodes.set(nodeData.id, {
          instance: node,
          data: nodeData,
          status: 'initialized',
          executions: 0,
        });
      } catch (error) {
        throw new Error(`Failed to initialize node ${nodeData.id}: ${error.message}`);
      }
    }
  }

  async executeFromNode(execution, workflow, nodeId, inputData = {}) {
    const nodeInfo = execution.nodes.get(nodeId);
    if (!nodeInfo) {
      throw new Error(`Node ${nodeId} not found in execution context`);
    }

    // Check execution limits
    if (nodeInfo.executions >= 100) {
      throw new Error(`Node ${nodeId} exceeded maximum executions (100)`);
    }

    // Mark as executing
    nodeInfo.status = 'executing';
    nodeInfo.executions++;
    nodeInfo.startTime = new Date();

    try {
      this.log(execution.id, 'debug', `Executing node ${nodeId}`, {
        type: nodeInfo.instance.type,
        executions: nodeInfo.executions,
      });

      // Create execution context
      const context = this.createExecutionContext(execution, workflow, nodeId, inputData);

      // Execute the node
      const result = await nodeInfo.instance.execute(context);

      // Mark as completed
      nodeInfo.endTime = new Date();
      nodeInfo.duration = nodeInfo.endTime - nodeInfo.startTime;
      nodeInfo.status = 'completed';
      nodeInfo.lastResult = result;

      this.log(execution.id, 'debug', `Node ${nodeId} completed`, {
        duration: nodeInfo.duration,
        outputs: Object.keys(result || {}),
      });

      // Emitir evento de nodo completado
      eventBus.publish('node.completed', new NodeCompleted(nodeId, execution.id, result));

      // Execute connected nodes
      const connectedResults = await this.executeConnectedNodes(
        execution,
        workflow,
        nodeId,
        result,
      );

      return {
        nodeId,
        result,
        connectedResults,
        duration: nodeInfo.duration,
      };
    } catch (error) {
      nodeInfo.endTime = new Date();
      nodeInfo.duration = nodeInfo.endTime - nodeInfo.startTime;
      nodeInfo.status = 'failed';
      nodeInfo.error = error.message;

      this.log(execution.id, 'error', `Node ${nodeId} failed`, {
        error: error.message,
        duration: nodeInfo.duration,
      });

      execution.errors.push({
        nodeId,
        error: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  createExecutionContext(execution, workflow, nodeId, inputData) {
    return {
      executionId: execution.id,
      nodeId,
      getInputData: (port = 'input') => {
        // Get data from connected input nodes
        const connections = this.getIncomingConnections(workflow, nodeId);
        const connection = connections.find((c) => c.targetPort === port);

        if (connection) {
          const sourceNode = execution.nodes.get(connection.source);
          if (sourceNode && sourceNode.lastResult) {
            return sourceNode.lastResult[connection.sourcePort];
          }
        }

        // Fallback to provided input data
        return inputData[port] || inputData;
      },
      getVariable: (name) => execution.variables.get(name),
      setVariable: (name, value) => execution.variables.set(name, value),
      log: (level, message, data) =>
        this.log(execution.id, level, message, {
          nodeId,
          ...data,
        }),
    };
  }

  getIncomingConnections(workflow, nodeId) {
    return workflow.connections.filter((c) => c.target === nodeId);
  }

  getOutgoingConnections(workflow, nodeId) {
    return workflow.connections.filter((c) => c.source === nodeId);
  }

  async executeConnectedNodes(execution, workflow, sourceNodeId, sourceResult) {
    const outgoingConnections = this.getOutgoingConnections(workflow, sourceNodeId);
    const results = [];

    // Group connections by target node to avoid duplicate executions
    const targetNodes = new Map();
    for (const connection of outgoingConnections) {
      if (!targetNodes.has(connection.target)) {
        targetNodes.set(connection.target, []);
      }
      targetNodes.get(connection.target).push(connection);
    }

    // Execute each target node once with all connected data
    for (const [targetNodeId, connections] of targetNodes.entries()) {
      try {
        // Check if we have output data for any of the connections
        const hasValidOutput = connections.some(
          (conn) => sourceResult && sourceResult[conn.sourcePort] !== undefined,
        );

        if (hasValidOutput) {
          // Prepare input data from all connections
          const inputData = {};
          for (const connection of connections) {
            if (sourceResult && sourceResult[connection.sourcePort] !== undefined) {
              inputData[connection.targetPort] = sourceResult[connection.sourcePort];
            }
          }

          const result = await this.executeFromNode(execution, workflow, targetNodeId, inputData);
          results.push(result);
        }
      } catch (error) {
        // Log error but continue with other nodes
        this.log(execution.id, 'error', `Failed to execute connected node ${targetNodeId}`, {
          error: error.message,
        });
      }
    }

    return results;
  }

  async cleanupExecution(execution, workflow) {
    // Cleanup all node instances
    for (const [nodeId, nodeInfo] of execution.nodes.entries()) {
      try {
        await nodeInfo.instance.cleanup();
      } catch (error) {
        this.log(execution.id, 'warn', `Cleanup failed for node ${nodeId}`, {
          error: error.message,
        });
      }
    }

    // Remove from active executions
    this.activeExecutions.delete(execution.id);
  }

  moveToHistory(execution) {
    // Add to history
    this.executionHistory.unshift({
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.duration,
      nodeCount: execution.nodes.size,
      errorCount: execution.errors.length,
      error: execution.error,
    });

    // Trim history
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(0, this.maxHistorySize);
    }
  }

  getExecutionResult(execution) {
    return {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.duration,
      results: execution.results,
      errors: execution.errors,
      nodeExecutions: Array.from(execution.nodes.entries()).map(([id, info]) => ({
        nodeId: id,
        type: info.instance.type,
        status: info.status,
        executions: info.executions,
        duration: info.duration,
        error: info.error,
      })),
      variables: Object.fromEntries(execution.variables.entries()),
    };
  }

  // Logging
  log(executionId, level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      executionId,
      level,
      message,
      data,
    };

    console.log(`[${level.toUpperCase()}] [${executionId}] ${message}`, data);

    // Store in execution if active
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      if (!execution.logs) execution.logs = [];
      execution.logs.push(logEntry);
    }
  }

  // Management methods
  getActiveExecutions() {
    return Array.from(this.activeExecutions.values()).map((exec) => ({
      id: exec.id,
      workflowId: exec.workflowId,
      status: exec.status,
      startTime: exec.startTime,
      duration: exec.startTime ? new Date() - exec.startTime : 0,
      nodeCount: exec.nodes.size,
    }));
  }

  getExecutionHistory(limit = 50) {
    return this.executionHistory.slice(0, limit);
  }

  async stopExecution(executionId) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return false;
    }

    execution.status = 'stopped';
    execution.endTime = new Date();
    execution.duration = execution.endTime - execution.startTime;

    await this.cleanupExecution(execution, null);
    this.moveToHistory(execution);

    this.log(executionId, 'info', 'Execution stopped by user');
    return true;
  }
}

export default WorkflowEngine;

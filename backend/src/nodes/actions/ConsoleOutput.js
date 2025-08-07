// 📺 Console Output Node
// Outputs data to console for debugging and monitoring

import BaseNode from '../base/BaseNode.js';

class ConsoleOutput extends BaseNode {
  constructor(config = {}) {
    super('ConsoleOutput', {
      ...config,
      category: 'action',
      icon: 'terminal',
      description: 'Output data to console for debugging'
    });
  }

  defineInputs() {
    return [
      {
        name: 'input',
        type: 'any',
        required: true,
        description: 'Data to output to console'
      }
    ];
  }

  defineOutputs() {
    return [
      {
        name: 'output',
        type: 'object',
        description: 'Pass-through data with console metadata'
      }
    ];
  }

  defineProperties() {
    return {
      logLevel: {
        type: 'select',
        displayName: 'Log Level',
        description: 'Console log level',
        default: 'info',
        options: [
          { value: 'log', label: 'Log' },
          { value: 'info', label: 'Info' },
          { value: 'warn', label: 'Warning' },
          { value: 'error', label: 'Error' },
          { value: 'debug', label: 'Debug' }
        ]
      },
      message: {
        type: 'string',
        displayName: 'Message',
        description: 'Custom message to display',
        placeholder: 'Optional custom message'
      },
      includeTimestamp: {
        type: 'boolean',
        displayName: 'Include Timestamp',
        description: 'Add timestamp to console output',
        default: true
      },
      includeNodeInfo: {
        type: 'boolean',
        displayName: 'Include Node Info',
        description: 'Add node information to output',
        default: true
      },
      formatOutput: {
        type: 'select',
        displayName: 'Format Output',
        description: 'How to format the data output',
        default: 'pretty',
        options: [
          { value: 'pretty', label: 'Pretty JSON' },
          { value: 'compact', label: 'Compact JSON' },
          { value: 'string', label: 'String representation' },
          { value: 'summary', label: 'Data summary only' }
        ]
      },
      passThrough: {
        type: 'boolean',
        displayName: 'Pass Through Data',
        description: 'Pass input data to output port',
        default: true
      }
    };
  }

  async execute(context) {
    try {
      const inputData = context.getInputData('input');
      const logLevel = this.getProperty('logLevel', 'info');
      const customMessage = this.getProperty('message', '');
      const includeTimestamp = this.getProperty('includeTimestamp', true);
      const includeNodeInfo = this.getProperty('includeNodeInfo', true);
      const formatOutput = this.getProperty('formatOutput', 'pretty');
      const passThrough = this.getProperty('passThrough', true);

      // Build console output message
      const consoleMessage = this.buildConsoleMessage(
        inputData,
        customMessage,
        includeTimestamp,
        includeNodeInfo,
        formatOutput
      );

      // Output to console with appropriate level
      this.outputToConsole(logLevel, consoleMessage, inputData);

      // Prepare output data
      const outputData = {
        logged: true,
        logLevel,
        timestamp: new Date().toISOString(),
        message: customMessage || 'Console output',
        nodeId: this.id,
        data: passThrough ? inputData : undefined
      };

      if (passThrough) {
        // Merge with original data
        if (typeof inputData === 'object' && inputData !== null && !Array.isArray(inputData)) {
          return {
            output: {
              ...inputData,
              _console: {
                logged: true,
                timestamp: outputData.timestamp,
                logLevel
              }
            }
          };
        } else {
          return {
            output: {
              data: inputData,
              _console: {
                logged: true,
                timestamp: outputData.timestamp,
                logLevel
              }
            }
          };
        }
      } else {
        return { output: outputData };
      }

    } catch (error) {
      this.log('error', 'Console output execution failed', { error: error.message });
      throw this.createError(`Console Output execution failed: ${error.message}`, 'OUTPUT_ERROR');
    }
  }

  buildConsoleMessage(data, customMessage, includeTimestamp, includeNodeInfo, formatOutput) {
    let parts = [];

    // Add timestamp
    if (includeTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    // Add node info
    if (includeNodeInfo) {
      parts.push(`[${this.type}:${this.id.slice(0, 8)}]`);
    }

    // Add custom message
    if (customMessage) {
      parts.push(customMessage);
    }

    // Format data based on setting
    let formattedData;
    switch (formatOutput) {
      case 'pretty':
        formattedData = JSON.stringify(data, null, 2);
        break;
        
      case 'compact':
        formattedData = JSON.stringify(data);
        break;
        
      case 'string':
        formattedData = String(data);
        break;
        
      case 'summary':
        formattedData = this.getDataSummary(data);
        break;
        
      default:
        formattedData = JSON.stringify(data, null, 2);
    }

    return {
      prefix: parts.join(' '),
      data: formattedData
    };
  }

  outputToConsole(level, message, data) {
    const { prefix, data: formattedData } = message;
    
    const fullMessage = prefix ? `${prefix}\n${formattedData}` : formattedData;
    
    switch (level) {
      case 'error':
        console.error(fullMessage);
        break;
      case 'warn':
        console.warn(fullMessage);
        break;
      case 'debug':
        console.debug(fullMessage);
        break;
      case 'info':
        console.info(fullMessage);
        break;
      case 'log':
      default:
        console.log(fullMessage);
        break;
    }

    // Also emit to any attached debuggers or loggers
    this.emitLogEvent(level, fullMessage, data);
  }

  getDataSummary(data) {
    if (data === null) return 'null';
    if (data === undefined) return 'undefined';
    
    const type = Array.isArray(data) ? 'array' : typeof data;
    
    switch (type) {
      case 'string':
        return `String (${data.length} chars): "${data.slice(0, 50)}${data.length > 50 ? '...' : ''}"`;
        
      case 'number':
        return `Number: ${data}`;
        
      case 'boolean':
        return `Boolean: ${data}`;
        
      case 'array':
        return `Array (${data.length} items): [${data.slice(0, 3).map(item => 
          typeof item === 'string' ? `"${item}"` : String(item)
        ).join(', ')}${data.length > 3 ? '...' : ''}]`;
        
      case 'object':
        const keys = Object.keys(data);
        return `Object (${keys.length} keys): {${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`;
        
      default:
        return `${type}: ${String(data).slice(0, 100)}`;
    }
  }

  emitLogEvent(level, message, data) {
    // Emit log event for any listeners (debugging tools, log collectors, etc.)
    const logEvent = {
      timestamp: new Date().toISOString(),
      nodeId: this.id,
      nodeType: this.type,
      level,
      message,
      data
    };

    // In a real implementation, this would emit to an event system
    // For now, we'll just store it for potential debugging
    if (!global.flowForgeLogs) global.flowForgeLogs = [];
    global.flowForgeLogs.push(logEvent);
    
    // Keep only last 1000 logs to prevent memory issues
    if (global.flowForgeLogs.length > 1000) {
      global.flowForgeLogs = global.flowForgeLogs.slice(-1000);
    }
  }
}

export default ConsoleOutput;

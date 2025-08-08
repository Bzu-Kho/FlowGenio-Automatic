// 📝 Set Variable Node
// Sets and manipulates variables in the workflow

import BaseNode from '../base/BaseNode.js';

class SetVariable extends BaseNode {
  constructor(config = {}) {
    super('SetVariable', {
      ...config,
      category: 'data',
      icon: 'settings',
      description: 'Set and manipulate workflow variables',
    });
  }

  defineInputs() {
    return [
      {
        name: 'input',
        type: 'any',
        required: false,
        description: 'Input data to process',
      },
    ];
  }

  defineOutputs() {
    return [
      {
        name: 'output',
        type: 'object',
        description: 'Output with set variables',
      },
    ];
  }

  defineProperties() {
    return {
      variables: {
        type: 'array',
        displayName: 'Variables',
        description: 'Variables to set',
        default: [
          {
            name: 'variable1',
            value: '',
            type: 'string',
            operation: 'set',
          },
        ],
        items: {
          name: {
            type: 'string',
            displayName: 'Variable Name',
            required: true,
          },
          value: {
            type: 'string',
            displayName: 'Value',
            description: 'Variable value or expression',
          },
          type: {
            type: 'select',
            displayName: 'Type',
            default: 'string',
            options: [
              { value: 'string', label: 'String' },
              { value: 'number', label: 'Number' },
              { value: 'boolean', label: 'Boolean' },
              { value: 'object', label: 'Object' },
              { value: 'array', label: 'Array' },
              { value: 'expression', label: 'Expression' },
            ],
          },
          operation: {
            type: 'select',
            displayName: 'Operation',
            default: 'set',
            options: [
              { value: 'set', label: 'Set' },
              { value: 'append', label: 'Append' },
              { value: 'prepend', label: 'Prepend' },
              { value: 'increment', label: 'Increment' },
              { value: 'decrement', label: 'Decrement' },
            ],
          },
        },
      },
      keepExisting: {
        type: 'boolean',
        displayName: 'Keep Existing Data',
        description: 'Keep existing data from input and merge with variables',
        default: true,
      },
      outputFormat: {
        type: 'select',
        displayName: 'Output Format',
        description: 'How to structure the output',
        default: 'merge',
        options: [
          { value: 'merge', label: 'Merge with input' },
          { value: 'variables_only', label: 'Variables only' },
          { value: 'wrapped', label: 'Wrap in data property' },
        ],
      },
    };
  }

  async execute(context) {
    try {
      const inputData = context.getInputData('input') || {};
      const variables = this.getProperty('variables', []);
      const keepExisting = this.getProperty('keepExisting', true);
      const outputFormat = this.getProperty('outputFormat', 'merge');

      this.log('info', `Setting ${variables.length} variables`, { outputFormat });

      const processedVariables = {};

      // Process each variable
      for (const variable of variables) {
        if (!variable.name) continue;

        try {
          const processedValue = await this.processVariable(variable, inputData, context);
          processedVariables[variable.name] = processedValue;

          this.log('debug', `Set variable: ${variable.name}`, {
            value: processedValue,
            type: variable.type,
          });
        } catch (error) {
          this.log('warn', `Failed to set variable: ${variable.name}`, { error: error.message });
          // Continue with other variables
        }
      }

      // Build output based on format
      let output;
      switch (outputFormat) {
        case 'variables_only':
          output = processedVariables;
          break;

        case 'wrapped':
          output = {
            data: keepExisting ? { ...inputData, ...processedVariables } : processedVariables,
            variables: Object.keys(processedVariables),
            timestamp: new Date().toISOString(),
          };
          break;

        case 'merge':
        default:
          output = keepExisting ? { ...inputData, ...processedVariables } : processedVariables;
          break;
      }

      this.log('info', `Variables set successfully`, {
        count: Object.keys(processedVariables).length,
      });

      return { output };
    } catch (error) {
      this.log('error', 'Set variable execution failed', { error: error.message });
      throw this.createError(`Set Variable execution failed: ${error.message}`, 'VARIABLE_ERROR');
    }
  }

  async processVariable(variable, inputData, context) {
    const { name, value, type, operation } = variable;

    // Get current value from context or input data
    const currentValue = context.getVariable(name) || inputData[name];

    // Process the new value
    let processedValue = await this.processValue(value, type, inputData, context);

    // Apply operation
    switch (operation) {
      case 'set':
        return processedValue;

      case 'append':
        if (Array.isArray(currentValue)) {
          return [...currentValue, processedValue];
        } else if (typeof currentValue === 'string' && typeof processedValue === 'string') {
          return currentValue + processedValue;
        } else {
          return [currentValue, processedValue].filter((v) => v !== null && v !== undefined);
        }

      case 'prepend':
        if (Array.isArray(currentValue)) {
          return [processedValue, ...currentValue];
        } else if (typeof currentValue === 'string' && typeof processedValue === 'string') {
          return processedValue + currentValue;
        } else {
          return [processedValue, currentValue].filter((v) => v !== null && v !== undefined);
        }

      case 'increment':
        const currentNum = Number(currentValue) || 0;
        const incrementBy = Number(processedValue) || 1;
        return currentNum + incrementBy;

      case 'decrement':
        const currentNum2 = Number(currentValue) || 0;
        const decrementBy = Number(processedValue) || 1;
        return currentNum2 - decrementBy;

      default:
        return processedValue;
    }
  }

  async processValue(value, type, inputData, context) {
    // Handle expressions (references to input data or other variables)
    if (type === 'expression' || String(value).startsWith('{{')) {
      return this.evaluateExpression(value, inputData, context);
    }

    // Type conversion
    switch (type) {
      case 'string':
        return String(value);

      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Cannot convert "${value}" to number`);
        }
        return num;

      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'true' || lower === '1' || lower === 'yes') return true;
          if (lower === 'false' || lower === '0' || lower === 'no') return false;
        }
        return Boolean(value);

      case 'object':
        if (typeof value === 'object') return value;
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (error) {
            throw new Error(`Cannot parse "${value}" as JSON object`);
          }
        }
        return {};

      case 'array':
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch (error) {
            // Split by comma as fallback
            return value.split(',').map((v) => v.trim());
          }
        }
        return [value];

      default:
        return value;
    }
  }

  evaluateExpression(expression, inputData, context) {
    try {
      // Remove curly braces if present
      const cleanExpression = expression.replace(/\{\{|\}\}/g, '').trim();

      // Simple field reference (e.g., "data.name")
      if (cleanExpression.includes('.')) {
        return this.getFieldValue(inputData, cleanExpression);
      }

      // Variable reference (e.g., "variableName")
      if (context.getVariable && context.getVariable(cleanExpression) !== undefined) {
        return context.getVariable(cleanExpression);
      }

      // Input field reference
      if (inputData[cleanExpression] !== undefined) {
        return inputData[cleanExpression];
      }

      // Fallback to original value
      return expression;
    } catch (error) {
      this.log('warn', 'Expression evaluation failed', { expression, error: error.message });
      return expression;
    }
  }

  getFieldValue(data, fieldPath) {
    try {
      const fields = fieldPath.split('.');
      let value = data;

      for (const field of fields) {
        if (value === null || value === undefined) return null;
        value = value[field];
      }

      return value;
    } catch (error) {
      return null;
    }
  }
}

export default SetVariable;

// 🔀 If/Else Logic Node
// Conditional branching for workflows

import BaseNode from '../base/BaseNode.js';

class IfElse extends BaseNode {
  constructor(config = {}) {
    super('IfElse', {
      ...config,
      category: 'logic',
      icon: 'git-branch',
      description: 'Conditional logic with if/else branching',
    });
  }

  defineInputs() {
    return [
      {
        name: 'input',
        type: 'any',
        required: true,
        description: 'Data to evaluate',
      },
    ];
  }

  defineOutputs() {
    return [
      {
        name: 'true',
        type: 'any',
        description: 'Output when condition is true',
      },
      {
        name: 'false',
        type: 'any',
        description: 'Output when condition is false',
      },
    ];
  }

  defineProperties() {
    return {
      condition: {
        type: 'select',
        displayName: 'Condition',
        description: 'Type of condition to evaluate',
        default: 'exists',
        options: [
          { value: 'exists', label: 'Value exists' },
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not equals' },
          { value: 'greater_than', label: 'Greater than' },
          { value: 'less_than', label: 'Less than' },
          { value: 'contains', label: 'Contains' },
          { value: 'starts_with', label: 'Starts with' },
          { value: 'ends_with', label: 'Ends with' },
          { value: 'is_empty', label: 'Is empty' },
          { value: 'is_number', label: 'Is number' },
          { value: 'is_string', label: 'Is string' },
          { value: 'custom', label: 'Custom expression' },
        ],
      },
      field: {
        type: 'string',
        displayName: 'Field Path',
        description: 'Path to the field to evaluate (e.g., data.name)',
        placeholder: 'data.field',
      },
      value: {
        type: 'string',
        displayName: 'Compare Value',
        description: 'Value to compare against',
        placeholder: 'comparison value',
      },
      customExpression: {
        type: 'string',
        displayName: 'Custom Expression',
        description: 'JavaScript expression to evaluate (use "data" variable)',
        placeholder: 'data.value > 100 && data.status === "active"',
      },
      passThrough: {
        type: 'boolean',
        displayName: 'Pass Through Data',
        description: 'Pass input data to output (vs just boolean result)',
        default: true,
      },
    };
  }

  async execute(context) {
    try {
      const inputData = context.getInputData('input');
      const condition = this.getProperty('condition', 'exists');
      const field = this.getProperty('field', '');
      const compareValue = this.getProperty('value', '');
      const customExpression = this.getProperty('customExpression', '');
      const passThrough = this.getProperty('passThrough', true);

      this.log('info', `Evaluating condition: ${condition}`, { field, compareValue });

      // Get field value from input data
      const fieldValue = this.getFieldValue(inputData, field);

      // Evaluate condition
      const conditionResult = await this.evaluateCondition(
        condition,
        fieldValue,
        compareValue,
        customExpression,
        inputData,
      );

      this.log('info', `Condition result: ${conditionResult}`, { fieldValue, compareValue });

      // Prepare output data
      const outputData = passThrough
        ? inputData
        : {
            result: conditionResult,
            field: field,
            fieldValue: fieldValue,
            compareValue: compareValue,
            timestamp: new Date().toISOString(),
          };

      // Return on appropriate output
      if (conditionResult) {
        return { true: outputData };
      } else {
        return { false: outputData };
      }
    } catch (error) {
      this.log('error', 'Condition evaluation failed', { error: error.message });
      throw this.createError(`If/Else execution failed: ${error.message}`, 'CONDITION_ERROR');
    }
  }

  getFieldValue(data, fieldPath) {
    if (!fieldPath) return data;

    try {
      // Support dot notation (e.g., "data.user.name")
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

  async evaluateCondition(condition, fieldValue, compareValue, customExpression, fullData) {
    switch (condition) {
      case 'exists':
        return fieldValue !== null && fieldValue !== undefined;

      case 'equals':
        return this.compareValues(fieldValue, compareValue, '===');

      case 'not_equals':
        return this.compareValues(fieldValue, compareValue, '!==');

      case 'greater_than':
        return this.compareValues(fieldValue, compareValue, '>');

      case 'less_than':
        return this.compareValues(fieldValue, compareValue, '<');

      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());

      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(compareValue).toLowerCase());

      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(compareValue).toLowerCase());

      case 'is_empty':
        return (
          !fieldValue ||
          (Array.isArray(fieldValue) && fieldValue.length === 0) ||
          (typeof fieldValue === 'object' && Object.keys(fieldValue).length === 0) ||
          String(fieldValue).trim() === ''
        );

      case 'is_number':
        return !isNaN(Number(fieldValue)) && !isNaN(parseFloat(fieldValue));

      case 'is_string':
        return typeof fieldValue === 'string';

      case 'custom':
        return this.evaluateCustomExpression(customExpression, fullData);

      default:
        throw new Error(`Unknown condition type: ${condition}`);
    }
  }

  compareValues(value1, value2, operator) {
    // Try to convert to numbers if both look like numbers
    const num1 = Number(value1);
    const num2 = Number(value2);

    if (!isNaN(num1) && !isNaN(num2)) {
      switch (operator) {
        case '===':
          return num1 === num2;
        case '!==':
          return num1 !== num2;
        case '>':
          return num1 > num2;
        case '<':
          return num1 < num2;
        case '>=':
          return num1 >= num2;
        case '<=':
          return num1 <= num2;
      }
    }

    // String comparison
    switch (operator) {
      case '===':
        return value1 === value2;
      case '!==':
        return value1 !== value2;
      case '>':
        return String(value1) > String(value2);
      case '<':
        return String(value1) < String(value2);
      case '>=':
        return String(value1) >= String(value2);
      case '<=':
        return String(value1) <= String(value2);
      default:
        return false;
    }
  }

  evaluateCustomExpression(expression, data) {
    try {
      // Simple and safe expression evaluator
      // In production, consider using a proper expression parser
      const Function = eval;
      const func = new Function('data', `return ${expression}`);
      return Boolean(func(data));
    } catch (error) {
      this.log('warn', 'Custom expression evaluation failed', { expression, error: error.message });
      return false;
    }
  }
}

export default IfElse;

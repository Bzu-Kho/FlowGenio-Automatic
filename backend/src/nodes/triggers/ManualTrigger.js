// 🚀 Manual Trigger Node
// Triggers workflow execution manually

import BaseNode from '../base/BaseNode.js';

class ManualTrigger extends BaseNode {
  constructor(config = {}) {
    super('ManualTrigger', {
      ...config,
      category: 'trigger',
      icon: 'play',
      description: 'Manually trigger workflow execution'
    });
  }

  defineInputs() {
    return []; // Triggers don't have inputs
  }

  defineOutputs() {
    return [
      {
        name: 'output',
        type: 'object',
        description: 'Trigger execution data'
      }
    ];
  }

  defineProperties() {
    return {
      triggerData: {
        type: 'object',
        displayName: 'Trigger Data',
        description: 'Data to pass when triggered',
        default: {}
      },
      description: {
        type: 'string',
        displayName: 'Description',
        description: 'Description of this trigger',
        default: 'Manual trigger'
      }
    };
  }

  async execute(context) {
    try {
      this.log('info', 'Manual trigger executed');
      
      const triggerData = this.getProperty('triggerData', {});
      const description = this.getProperty('description', 'Manual trigger');
      
      const output = {
        trigger: 'manual',
        timestamp: new Date().toISOString(),
        description,
        data: triggerData,
        executionId: context.executionId || 'manual-' + Date.now()
      };

      return {
        output: output
      };
    } catch (error) {
      throw this.createError(`Manual trigger failed: ${error.message}`);
    }
  }

  async trigger(customData = {}) {
    // Special method for manual triggering
    const triggerData = this.getProperty('triggerData', {});
    
    return {
      output: {
        trigger: 'manual',
        timestamp: new Date().toISOString(),
        data: { ...triggerData, ...customData },
        executionId: 'manual-' + Date.now()
      }
    };
  }
}

export default ManualTrigger;

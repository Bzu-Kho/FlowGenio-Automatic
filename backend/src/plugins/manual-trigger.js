// Manual Trigger Node Plugin
const manualTriggerNode = {
  id: 'manual.trigger',
  version: '1.0.0',
  category: 'trigger',
  icon: 'play',
  description: 'Manually trigger workflow execution',
  inputs: [],
  outputs: [{ name: 'output', type: 'object', description: 'Trigger execution data' }],
  properties: {
    triggerData: { type: 'object', default: {}, description: 'Data to pass when triggered' },
    description: {
      type: 'string',
      default: 'Manual trigger',
      description: 'Description of this trigger',
    },
  },
  async run(ctx) {
    return { output: ctx.properties.triggerData };
  },
};

export default {
  name: 'manual-trigger',
  nodes: [manualTriggerNode],
  hooks: {},
};

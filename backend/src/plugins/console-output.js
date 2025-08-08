// Console Output Node Plugin
const consoleOutputNode = {
  id: 'console.output',
  version: '1.0.0',
  category: 'action',
  icon: 'terminal',
  description: 'Output data to console for debugging',
  inputs: [
    { name: 'input', type: 'any', required: true, description: 'Data to output to console' },
  ],
  outputs: [
    { name: 'output', type: 'object', description: 'Pass-through data with console metadata' },
  ],
  properties: {
    logLevel: {
      type: 'select',
      default: 'info',
      options: ['log', 'info', 'warn', 'error', 'debug'],
      description: 'Console log level',
    },
  },
  async run(ctx) {
    const level = ctx.properties.logLevel || 'info';
    // eslint-disable-next-line no-console
    console[level](ctx.input);
    return { output: { ...ctx.input, _console: true } };
  },
};

export default {
  name: 'console-output',
  nodes: [consoleOutputNode],
  hooks: {},
};

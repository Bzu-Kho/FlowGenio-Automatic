// Example core node plugin
const httpRequestNode = {
  id: 'http.request',
  version: '1.0.0',
  category: 'data',
  inputs: [{ name: 'url', type: 'string', required: true }],
  outputs: [{ name: 'response', type: 'object' }],
  run: async (ctx) => {
    // Dummy implementation
    return { response: { status: 200, data: 'ok' } };
  }
};

export default {
  name: 'core-nodes',
  nodes: [httpRequestNode],
  hooks: {
    onLoad: () => { /* ... */ }
  }
};

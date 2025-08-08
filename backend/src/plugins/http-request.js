// HTTP Request Node Plugin
const httpRequestNode = {
  id: 'http.request',
  version: '1.0.0',
  category: 'data',
  icon: 'globe',
  description: 'Send HTTP requests to external APIs',
  inputs: [{ name: 'input', type: 'object', required: false, description: 'Optional data to include in request' }],
  outputs: [
    { name: 'output', type: 'object', description: 'HTTP response data' },
    { name: 'error', type: 'object', description: 'Error information if request fails' }
  ],
  properties: {
    url: { type: 'string', required: true, description: 'Target URL for the request' }
  },
  async run(ctx) {
    // Dummy implementation
    return { output: { status: 200, data: 'ok' } };
  }
};

export default {
  name: 'http-request',
  nodes: [httpRequestNode],
  hooks: {}
};

// Basic API tests for FlowForge backend
import assert from 'assert';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

describe('FlowForge API', () => {
  it('should return healthy status', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
  });

  it('should list available nodes', async () => {
    const res = await fetch(`${BASE_URL}/api/nodes`);
    const data = await res.json();
    assert.ok(Array.isArray(data.nodes));
    assert.ok(data.nodes.length > 0);
  });

  it('should execute a simple workflow', async () => {
    const workflow = {
      id: 'test-wf',
      nodes: [
        { id: '1', type: 'manual.trigger', data: {}, position: { x: 0, y: 0 } },
        { id: '2', type: 'console.output', data: {}, position: { x: 100, y: 0 } },
      ],
      connections: [{ source: '1', target: '2', sourcePort: 'output', targetPort: 'input' }],
    };
    const res = await fetch(`${BASE_URL}/api/workflows/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow, triggerData: { foo: 'bar' } }),
    });
    const data = await res.json();
    assert.ok(data);
    assert.strictEqual(data.status, 'completed');
  });
});

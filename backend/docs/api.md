# FlowForge Backend API Documentation

## Health Check

- **GET** `/health`
  - Returns: `{ status, version, timestamp }`

## Nodes

- **GET** `/api/nodes`
  - Returns: `{ nodes: NodeDefinition[] }`

## Workflow Execution

- **POST** `/api/workflows/execute`
  - Body: `{ workflow, triggerData?, options? }`
  - Returns: Workflow execution result

## Executions

- **GET** `/api/executions?limit=50`
  - Returns: `{ executions: Execution[] }`
- **GET** `/api/executions/active`
  - Returns: `{ executions: Execution[] }`

## Error Handling

- All endpoints return `{ error, details? }` on failure.

---

### NodeDefinition

- `id`: string
- `type`: string
- `category`: string
- `icon`: string
- `description`: string
- ...

### Execution

- `id`: string
- `workflowId`: string
- `status`: string
- `startTime`: string
- `endTime`: string
- `duration`: number
- `results`: any
- ...

---

For more details, see the orchestrator and engine source code.

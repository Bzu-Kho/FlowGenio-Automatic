// Domain Events for FlowForge
export class DomainEvent {
  constructor(type, payload = {}) {
    this.type = type;
    this.payload = payload;
    this.occurredAt = new Date();
  }
}

// Example events
export class WorkflowStarted extends DomainEvent {
  constructor(workflowId, runId) {
    super('workflow.started', { workflowId, runId });
  }
}

export class NodeCompleted extends DomainEvent {
  constructor(nodeId, runId, output) {
    super('node.completed', { nodeId, runId, output });
  }
}

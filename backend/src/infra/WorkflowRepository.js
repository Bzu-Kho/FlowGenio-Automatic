// In-memory WorkflowRepository (replace with DB-backed in production)
import { Repository } from './Repository.js';

class WorkflowRepository extends Repository {
  constructor() {
    super();
    this.workflows = new Map();
  }

  async findById(id) {
    return this.workflows.get(id) || null;
  }

  async save(workflow) {
    if (!workflow.id) throw new Error('Workflow must have an id');
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async findAll() {
    return Array.from(this.workflows.values());
  }
}

const workflowRepository = new WorkflowRepository();
export default workflowRepository;

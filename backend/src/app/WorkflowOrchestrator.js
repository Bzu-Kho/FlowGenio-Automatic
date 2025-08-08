// WorkflowOrchestrator: Handles workflow execution and management
import workflowEngine from '../engine/WorkflowEngine.js';
import workflowRepository from '../infra/WorkflowRepository.js';

class WorkflowOrchestrator {
  async executeWorkflow(workflow, triggerData = {}, options = {}) {
    // Optionally persist workflow before execution
    await workflowRepository.save(workflow);
    return workflowEngine.executeWorkflow(workflow, triggerData, options);
  }

  async getExecutions(limit = 50) {
    return workflowEngine.getExecutionHistory(limit);
  }

  async getActiveExecutions() {
    return workflowEngine.getActiveExecutions();
  }
}

const workflowOrchestrator = new WorkflowOrchestrator();
export default workflowOrchestrator;

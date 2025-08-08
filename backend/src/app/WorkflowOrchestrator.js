// WorkflowOrchestrator: Handles workflow execution for API
import workflowEngine from '../engine/WorkflowEngine.js';

class WorkflowOrchestrator {
  static async execute(workflow, triggerData, options) {
    return await workflowEngine.executeWorkflow(workflow, triggerData, options);
  }
}

export default WorkflowOrchestrator;

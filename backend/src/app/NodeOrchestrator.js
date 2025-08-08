// NodeOrchestrator: Handles node listing and metadata for API
import nodeRegistry from '../engine/registry/NodeRegistry.js';

class NodeOrchestrator {
  static listNodes() {
    return nodeRegistry.getAllNodes();
  }
}

export default NodeOrchestrator;

// NodeOrchestrator: Handles node management and discovery
import nodeRegistry from '../engine/registry/NodeRegistry.js';
import nodeRepository from '../infra/NodeRepository.js';

class NodeOrchestrator {
  async listNodes() {
    // Optionally sync registry to repository
    const nodes = nodeRegistry.getAllNodes();
    for (const node of nodes) {
      await nodeRepository.save(node);
    }
    return nodes;
  }

  async registerNode(nodeDef) {
    nodeRegistry.registerNode(nodeDef.id, nodeDef);
    await nodeRepository.save(nodeDef);
    return nodeDef;
  }
}

const nodeOrchestrator = new NodeOrchestrator();
export default nodeOrchestrator;

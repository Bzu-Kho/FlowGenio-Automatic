// NodeRepository: Abstracts node persistence (if needed)
class NodeRepository {
  async save(node) {
    // TODO: Implement DB save logic
    throw new Error('Not implemented');
  }

  async getById(id) {
    // TODO: Implement DB fetch logic
    throw new Error('Not implemented');
  }

  async list() {
    // TODO: Implement DB list logic
    throw new Error('Not implemented');
  }
}

export default new NodeRepository();

// In-memory NodeRepository (replace with DB-backed in production)
import { Repository } from './Repository.js';

class NodeRepository extends Repository {
  constructor() {
    super();
    this.nodes = new Map();
  }

  async findById(id) {
    return this.nodes.get(id) || null;
  }

  async save(node) {
    if (!node.id) throw new Error('Node must have an id');
    this.nodes.set(node.id, node);
    return node;
  }

  async findAll() {
    return Array.from(this.nodes.values());
  }
}

const nodeRepository = new NodeRepository();
export default nodeRepository;

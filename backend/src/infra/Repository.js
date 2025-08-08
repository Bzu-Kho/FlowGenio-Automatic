// Repository abstraction for persistence (future: swap SQLite/Postgres)
export class Repository {
  constructor() {
    // Implement connection/init logic
  }
  async findById(id) {
    throw new Error('Not implemented');
  }
  async save(entity) {
    throw new Error('Not implemented');
  }
  async findAll() {
    throw new Error('Not implemented');
  }
}

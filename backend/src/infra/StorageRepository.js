// In-memory StorageRepository (replace with S3, GCS, or FS-backed in production)
import { Repository } from './Repository.js';

class StorageRepository extends Repository {
  constructor() {
    super();
    this.storage = new Map();
  }

  async saveFile(key, data) {
    this.storage.set(key, data);
    return { key, size: data.length };
  }

  async getFile(key) {
    return this.storage.get(key) || null;
  }

  async deleteFile(key) {
    return this.storage.delete(key);
  }

  async listFiles() {
    return Array.from(this.storage.keys());
  }
}

const storageRepository = new StorageRepository();
export default storageRepository;

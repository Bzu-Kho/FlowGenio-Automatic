// In-memory SecretRepository (replace with Vault, AWS Secrets Manager, etc. in production)
import { Repository } from './Repository.js';

class SecretRepository extends Repository {
  constructor() {
    super();
    this.secrets = new Map();
  }

  async saveSecret(key, value) {
    this.secrets.set(key, value);
    return { key };
  }

  async getSecret(key) {
    return this.secrets.get(key) || null;
  }

  async deleteSecret(key) {
    return this.secrets.delete(key);
  }

  async listSecrets() {
    return Array.from(this.secrets.keys());
  }
}

const secretRepository = new SecretRepository();
export default secretRepository;

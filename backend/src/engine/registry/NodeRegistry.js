// NodeRegistry - Plugin-ready, event-driven
class NodeRegistry {
  constructor() {
    this.nodes = new Map();
    this.plugins = [];
    this.initialized = false;
  }

  initialize() {
  if (this.initialized) return;
  // All core nodes and plugins are loaded via PluginLoader
  this.initialized = true;
  }

  registerNode(type, nodeClass) {
    this.nodes.set(type, nodeClass);
  }

  registerPlugin(plugin) {
    if (plugin.nodes) {
      for (const nodeDef of plugin.nodes) {
        this.registerNode(nodeDef.id, nodeDef);
      }
    }
    this.plugins.push(plugin);
    if (plugin.hooks && plugin.hooks.onLoad) plugin.hooks.onLoad();
  }

  getNode(type) {
    return this.nodes.get(type);
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }
}

const nodeRegistry = new NodeRegistry();
export default nodeRegistry;

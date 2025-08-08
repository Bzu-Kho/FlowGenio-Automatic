// PluginLoader for FlowForge - loads plugins from /plugins directory
import fs from 'fs';
import path from 'path';

class PluginLoader {
  constructor(pluginDir = path.resolve('src/plugins')) {
    this.pluginDir = pluginDir;
    this.plugins = [];
  }

  async loadAll(nodeRegistry) {
    if (!fs.existsSync(this.pluginDir)) return;
    const files = fs.readdirSync(this.pluginDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      // Windows: convert to file:// URL for dynamic import
      let pluginPath = path.join(this.pluginDir, file);
      if (!pluginPath.startsWith('file://')) {
        pluginPath = 'file://' + pluginPath.replace(/\\/g, '/');
      }
      const pluginModule = await import(pluginPath);
      if (pluginModule.default) {
        nodeRegistry.registerPlugin(pluginModule.default);
        this.plugins.push(pluginModule.default);
        console.log(`[PluginLoader] Loaded plugin: ${pluginModule.default.name}`);
      }
    }
  }
}

const pluginLoader = new PluginLoader();
export default pluginLoader;

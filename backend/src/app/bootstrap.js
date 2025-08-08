// Bootstrap file to initialize registry, plugins, event bus, etc.
import nodeRegistry from '../engine/registry/NodeRegistry.js';
import pluginLoader from '../engine/registry/PluginLoader.js';
import logger from '../observability/logger.js';

export async function bootstrap() {
  nodeRegistry.initialize();
  await pluginLoader.loadAll(nodeRegistry);
  const loadedPlugins = pluginLoader.plugins.map((p) => p.name);
  const loadedNodeIds = nodeRegistry.getAllNodes().map((n) => n.id);
  logger.info('Bootstrap complete', {
    plugins: loadedPlugins,
    nodes: loadedNodeIds,
  });
}

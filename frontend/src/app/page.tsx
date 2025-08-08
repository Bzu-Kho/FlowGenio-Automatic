'use client';

import { useState } from 'react';
import {
  Play,
  Zap,
  Database,
  GitBranch,
  Settings,
  Terminal,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useMyLogic } from '../hooks/useMyLogic';
import dynamic from 'next/dynamic';
import type { Node, Edge } from 'reactflow';
import NodePaletteItem from '../components/NodePaletteItem';

// Dynamically import the flow editor to avoid SSR issues
const FlowEditor = dynamic(() => import('../components/FlowEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center">Loading FlowGenio...</div>
  ),
});

const MiniMapViewer = dynamic(() => import('../components/MiniMapViewer'), {
  ssr: false,
});

export default function FlowGenioPage() {
  const { isClient, mode, setMode, FlowGenioExpertChat } = useMyLogic();
  const [workflowNodes, setWorkflowNodes] = useState<Node[]>([]);
  const [workflowEdges, setWorkflowEdges] = useState<Edge[]>([]);

  const handleWorkflowChange = (nodes: Node[], edges: Edge[]) => {
    setWorkflowNodes(nodes);
    setWorkflowEdges(edges);
  };

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading FlowGenio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">FlowGenio</h1>
              <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">v1.0.0</span>
            </div>
          </div>
          {/* Theme toggle */}
          <div className="ml-6 flex items-center space-x-2">
            <button
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${mode === 'light' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
              onClick={() => setMode('light')}
              title="Light mode"
            >
              <Sun className="w-5 h-5 text-yellow-500" />
            </button>
            <button
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${mode === 'dark' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
              onClick={() => setMode('dark')}
              title="Dark mode"
            >
              <Moon className="w-5 h-5 text-blue-400" />
            </button>
            <button
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${mode === 'system' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
              onClick={() => setMode('system')}
              title="System mode"
            >
              <Monitor className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Backend Connected</span>
            </div>
            <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Execute Flow</span>
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Node Palette Sidebar */}
        <div className="w-80 bg-white dark:bg-[#171717] border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Node Palette</h2>
            {/* Node Categories */}
            <div className="space-y-4">
              {/* Trigger Flows */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Trigger Flows</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem
                    icon={<Play className="w-4 h-4" />}
                    title="Schedule Trigger"
                    description="Schedule-based workflow trigger"
                    category="trigger"
                  />
                  <NodePaletteItem
                    icon={<Terminal className="w-4 h-4" />}
                    title="Webhook"
                    description="HTTP webhook trigger"
                    category="trigger"
                  />
                  <NodePaletteItem
                    icon={<Play className="w-4 h-4" />}
                    title="Manual Trigger"
                    description="Start workflow manually"
                    category="trigger"
                  />
                </div>
              </div>
              {/* API Calls */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">API Calls</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem
                    icon={<Database className="w-4 h-4" />}
                    title="HTTP Request"
                    description="Make REST API calls"
                    category="api"
                  />
                  <NodePaletteItem
                    icon={<Database className="w-4 h-4" />}
                    title="GraphQL"
                    description="Execute GraphQL queries"
                    category="api"
                  />
                </div>
              </div>
              {/* Data Transform */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Data Transform</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem
                    icon={<Settings className="w-4 h-4" />}
                    title="Edit Fields (Set)"
                    description="Set and modify field values"
                    category="transform"
                  />
                  <NodePaletteItem
                    icon={<Settings className="w-4 h-4" />}
                    title="JSON Transform"
                    description="Transform JSON data structure"
                    category="transform"
                  />
                </div>
              </div>
              {/* Conditional Logic */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <GitBranch className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Conditional Logic</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem
                    icon={<GitBranch className="w-4 h-4" />}
                    title="IF"
                    description="Conditional branching logic"
                    category="logic"
                  />
                  <NodePaletteItem
                    icon={<GitBranch className="w-4 h-4" />}
                    title="Switch"
                    description="Multi-condition branching"
                    category="logic"
                  />
                </div>
              </div>
              {/* Advanced Scripting */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Terminal className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Advanced Scripting</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem
                    icon={<Terminal className="w-4 h-4" />}
                    title="Code (JavaScript)"
                    description="Execute custom JavaScript code"
                    category="scripting"
                  />
                  <NodePaletteItem
                    icon={<Terminal className="w-4 h-4" />}
                    title="Code (Python)"
                    description="Execute custom Python code"
                    category="scripting"
                  />
                </div>
              </div>
              {/* Flow Control */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Flow Control</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem
                    icon={<Zap className="w-4 h-4" />}
                    title="Wait"
                    description="Add delays and rate limiting"
                    category="control"
                  />
                  <NodePaletteItem
                    icon={<Zap className="w-4 h-4" />}
                    title="Retry"
                    description="Retry failed operations"
                    category="control"
                  />
                </div>
              </div>
              {/* Debug & Monitor */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Monitor className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Debug & Monitor</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem
                    icon={<Monitor className="w-4 h-4" />}
                    title="Vista Executions"
                    description="View execution logs"
                    category="debug"
                  />
                  <NodePaletteItem
                    icon={<Terminal className="w-4 h-4" />}
                    title="Debug"
                    description="Debug workflow execution"
                    category="debug"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content with persistent bottom panel */}
        <div className="flex-1 flex flex-col h-full">
          {/* Workflow Editor Area */}
          <div className="flex-1 min-h-0">
            <FlowEditor onWorkflowChange={handleWorkflowChange} />
          </div>
          {/* Persistent Bottom Panel: Expert Chat + MiniMap */}
          <div className="w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#171717] h-[320px] shadow-xl z-20 flex">
            {/* Expert Assistant Chat */}
            <div className="flex-1">
              <FlowGenioExpertChat />
            </div>
            {/* Mini-map */}
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Workflow Overview</h3>
              </div>
              <div className="w-full h-64 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                {workflowNodes.length > 0 ? (
                  <MiniMapViewer nodes={workflowNodes} edges={workflowEdges} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Add nodes to see workflow overview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

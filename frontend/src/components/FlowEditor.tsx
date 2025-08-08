'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  Background,
  Controls,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from './ThemeProvider';

import {
  Play,
  GitBranch,
  Database,
  Settings,
  Terminal,
  Zap,
  Plus,
  MessageCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// Custom Node Components
const nodeTypes = {
  ManualTrigger: CustomNode,
  HttpRequest: CustomNode,
  IfElse: CustomNode,
  SetVariable: CustomNode,
  ConsoleOutput: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'ManualTrigger',
    position: { x: 100, y: 100 },
    data: {
      title: 'Manual Trigger',
      type: 'ManualTrigger',
      category: 'trigger',
      icon: 'Play',
      description: 'Start workflow manually',
    },
  },
];

const initialEdges: Edge[] = [];

interface FlowEditorProps {
  onWorkflowChange?: (nodes: Node[], edges: Edge[]) => void;
}

function FlowEditor({ onWorkflowChange }: FlowEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Notify parent component when workflow changes
  useEffect(() => {
    if (onWorkflowChange) {
      onWorkflowChange(nodes, edges);
    }
  }, [nodes, edges, onWorkflowChange]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeData = event.dataTransfer.getData('application/reactflow');

      if (typeof nodeData === 'undefined' || !nodeData || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const parsedData = JSON.parse(nodeData);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${parsedData.type}-${Date.now()}`,
        type: parsedData.type,
        position,
        data: {
          title: parsedData.title,
          type: parsedData.type,
          category: getNodeCategory(parsedData.type),
          icon: getNodeIcon(parsedData.type),
          description: parsedData.description,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const executeWorkflow = async () => {
    try {
      const workflow = {
        id: 'test-workflow',
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.data.type,
          data: node.data,
          position: node.position,
        })),
        connections: edges.map((edge) => ({
          source: edge.source,
          target: edge.target,
          sourcePort: edge.sourceHandle || 'output',
          targetPort: edge.targetHandle || 'input',
        })),
      };

      const response = await fetch('http://localhost:3001/api/workflows/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow,
          triggerData: { message: 'Test execution' },
        }),
      });

      const result = await response.json();
      console.log('Workflow execution result:', result);
      alert('Workflow executed successfully! Check console for details.');
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      alert('Failed to execute workflow. Make sure backend is running on port 3001.');
    }
  };

  return (
    <div className="h-full relative bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#aaa" gap={16} className="dark:bg-[#0a0a0a]" />
          <Controls className="dark:bg-gray-800 dark:border-gray-600" />
        </ReactFlow>
      </div>

      {/* Floating Execute Button */}
      <button
        onClick={executeWorkflow}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
      >
        <Play className="w-4 h-4" />
        <span>Execute Flow</span>
      </button>

      {/* Node Properties Panel */}
      {selectedNode && (
        <NodePropertiesPanel
          node={selectedNode}
          setNodes={setNodes}
          setSelectedNode={setSelectedNode}
        />
      )}
    </div>
  );

  // --- Node Properties Panel ---
  // This component auto-generates a form based on the node's properties schema

  interface NodePropertiesPanelProps {
    node: Node;
    setNodes: Dispatch<SetStateAction<Node[]>>;
    setSelectedNode: Dispatch<SetStateAction<Node | null>>;
  }

  function NodePropertiesPanel({
    node,
    setNodes,
    setSelectedNode,
  }: NodePropertiesPanelProps) {
    // Example: get node definition from a static map or API (for demo, use node.data.properties if present)
    // In a real app, fetch the full node definition from backend or registry
    const nodeDef = node.data.definition || node;
    const properties = nodeDef.data?.properties || nodeDef.properties || {};

    // Handle property change
    const handlePropChange = (key: string, value: unknown) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, properties: { ...n.data.properties, [key]: value } } }
            : n,
        ),
      );
      setSelectedNode({
        ...node,
        data: {
          ...node.data,
          properties: { ...node.data.properties, [key]: value },
        },
      });
    };

    // Render input for each property type

    const renderInput = (key: string, prop: { type?: string; description?: string; options?: string[]; default?: unknown }) => {
      const value = node.data?.properties?.[key] ?? prop.default ?? '';
      switch (prop.type) {
        case 'string':
          return (
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
              value={value}
              onChange={(e) => handlePropChange(key, e.target.value)}
              placeholder={prop.description}
            />
          );
        case 'number':
          return (
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
              value={value}
              onChange={(e) => handlePropChange(key, parseFloat(e.target.value))}
              placeholder={prop.description}
            />
          );
        case 'boolean':
          return (
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handlePropChange(key, e.target.checked)}
            />
          );
        case 'select':
          return (
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
              value={value}
              onChange={(e) => handlePropChange(key, e.target.value)}
            >
              {Array.isArray(prop.options) &&
                prop.options.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
            </select>
          );
        case 'array':
          return (
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
              value={Array.isArray(value) ? value.join(', ') : ''}
              onChange={(e) =>
                handlePropChange(
                  key,
                  e.target.value.split(',').map((v: string) => v.trim()),
                )
              }
              placeholder={prop.description}
            />
          );
        case 'object':
          return (
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm font-mono"
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : ''}
              onChange={(e) => {
                try {
                  handlePropChange(key, JSON.parse(e.target.value));
                } catch {
                  // ignore parse error
                }
              }}
              placeholder={prop.description}
            />
          );
        default:
          return (
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
              value={value}
              onChange={(e) => handlePropChange(key, e.target.value)}
            />
          );
      }
    };

    return (
      <div className="absolute bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Node Properties</h3>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Node Type</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">{node.data.type}</p>
          </div>
          {/* Auto-generated property fields */}
          {Object.entries(properties).map(([key, prop]) => {
            const typedProp = prop as { displayName?: string; description?: string };
            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {typedProp.displayName || key}
                </label>
                {renderInput(key, typedProp)}
                {typedProp.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{typedProp.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

// Custom Node Component
function CustomNode({ data }: { data: { title?: string; category?: string; icon?: string } }) {
  const icon = getIconComponent(data.icon || 'Zap');
  const color = getNodeColor(data.category || 'utility');

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-2 ${color.border} min-w-[150px]`}
    >
      <div className="flex items-center space-x-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.bg} text-white`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{data.title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{data.category}</div>
        </div>
      </div>

      {/* Input/Output handles would be added here in a real implementation */}
    </div>
  );
}

// Utility functions
function getNodeCategory(type: string): string {
  const categories: Record<string, string> = {
    ManualTrigger: 'trigger',
    HttpRequest: 'data',
    IfElse: 'logic',
    SetVariable: 'data',
    ConsoleOutput: 'action',
  };
  return categories[type] || 'utility';
}

function getNodeIcon(type: string): string {
  const icons: Record<string, string> = {
    ManualTrigger: 'Play',
    HttpRequest: 'Database',
    IfElse: 'GitBranch',
    SetVariable: 'Settings',
    ConsoleOutput: 'Terminal',
  };
  return icons[type] || 'Zap';
}

function getIconComponent(iconName: string) {
  const icons: Record<string, React.ReactNode> = {
    Play: <Play className="w-4 h-4 text-white" />,
    Database: <Database className="w-4 h-4 text-white" />,
    GitBranch: <GitBranch className="w-4 h-4 text-white" />,
    Settings: <Settings className="w-4 h-4 text-white" />,
    Terminal: <Terminal className="w-4 h-4 text-white" />,
    Zap: <Zap className="w-4 h-4 text-white" />,
  };
  return icons[iconName] || icons.Zap;
}

function getNodeColor(category: string) {
  const colors: Record<string, { bg: string; border: string }> = {
    trigger: { bg: 'bg-blue-600', border: 'border-blue-300' },      // Trigger Flows
    api: { bg: 'bg-green-600', border: 'border-green-300' },        // API Calls
    transform: { bg: 'bg-purple-600', border: 'border-purple-300' }, // Data Transform
    logic: { bg: 'bg-yellow-600', border: 'border-yellow-300' },    // Conditional Logic
    scripting: { bg: 'bg-orange-600', border: 'border-orange-300' }, // Advanced Scripting
    control: { bg: 'bg-indigo-600', border: 'border-indigo-300' },  // Flow Control
    debug: { bg: 'bg-red-600', border: 'border-red-300' },          // Debug & Monitor
    utility: { bg: 'bg-gray-600', border: 'border-gray-300' },      // Default/Utility
  };
  return colors[category] || colors.utility;
}

// Wrapper with ReactFlowProvider

export default function FlowEditorWrapper({ onWorkflowChange }: FlowEditorProps = {}) {
  const [fullscreen, setFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // F11 key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        setFullscreen((f) => !f);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Fullscreen effect
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (fullscreen) {
      if (el.requestFullscreen) el.requestFullscreen();
    } else {
      if (document.fullscreenElement) document.exitFullscreen();
    }
  }, [fullscreen]);

  return (
    <div
      ref={wrapperRef}
      className={`relative h-full w-full bg-white dark:bg-[#171717] ${fullscreen ? 'z-50' : ''}`}
    >
      {/* Lateral buttons */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col space-y-3 z-30">
        <button
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
          title="Añadir nodo"
          onClick={() => alert('Add node functionality coming soon')}
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          className="p-2 bg-gray-700 hover:bg-gray-500 text-white rounded-full shadow-lg"
          title="Mostrar/Ocultar chat agente (no implementado)"
          onClick={() => {}}
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button
          className="p-2 bg-gray-800 hover:bg-gray-600 text-white rounded-full shadow-lg"
          title={fullscreen ? 'Exit fullscreen (F11)' : 'Fullscreen (F11)'}
          onClick={() => setFullscreen((f) => !f)}
        >
          {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>
      {/* Main workflow editor */}
      <ReactFlowProvider>
        <FlowEditor onWorkflowChange={onWorkflowChange} />
      </ReactFlowProvider>
    </div>
  );
}

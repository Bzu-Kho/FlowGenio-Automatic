'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
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
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Play, GitBranch, Database, Settings, Terminal, Zap } from 'lucide-react';

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
      description: 'Start workflow manually'
    },
  },
];

const initialEdges: Edge[] = [];

function FlowEditor() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
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

      if (typeof nodeData === 'undefined' || !nodeData || !reactFlowBounds) {
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
    [reactFlowInstance]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const executeWorkflow = async () => {
    try {
      const workflow = {
        id: 'test-workflow',
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.data.type,
          data: node.data,
          position: node.position
        })),
        connections: edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          sourcePort: edge.sourceHandle || 'output',
          targetPort: edge.targetHandle || 'input'
        }))
      };

      const response = await fetch('http://localhost:3001/api/workflows/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow,
          triggerData: { message: 'Test execution' }
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
    <div className="h-full relative">
      <div 
        className="h-full" 
        ref={reactFlowWrapper}
      >
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
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Floating Execute Button */}
      <button
        onClick={executeWorkflow}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg"
      >
        <Play className="w-4 h-4" />
        <span>Execute Flow</span>
      </button>

      {/* Node Properties Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Node Properties</h3>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Node Type
              </label>
              <p className="text-sm text-gray-600">{selectedNode.data.type}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={selectedNode.data.title}
                onChange={(e) => {
                  setNodes(nds => 
                    nds.map(node => 
                      node.id === selectedNode.id 
                        ? { ...node, data: { ...node.data, title: e.target.value } }
                        : node
                    )
                  );
                  setSelectedNode({
                    ...selectedNode,
                    data: { ...selectedNode.data, title: e.target.value }
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Enter node title"
                title="Node title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={selectedNode.data.description}
                onChange={(e) => {
                  setNodes(nds => 
                    nds.map(node => 
                      node.id === selectedNode.id 
                        ? { ...node, data: { ...node.data, description: e.target.value } }
                        : node
                    )
                  );
                  setSelectedNode({
                    ...selectedNode,
                    data: { ...selectedNode.data, description: e.target.value }
                  });
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Enter node description"
                title="Node description"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Node Component
function CustomNode({ data }: { data: any }) {
  const icon = getIconComponent(data.icon);
  const color = getNodeColor(data.category);

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 ${color.border} min-w-[150px]`}>
      <div className="flex items-center space-x-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.bg}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 text-sm">{data.title}</div>
          <div className="text-xs text-gray-500">{data.category}</div>
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
    trigger: { bg: 'bg-blue-600', border: 'border-blue-300' },
    logic: { bg: 'bg-green-600', border: 'border-green-300' },
    data: { bg: 'bg-purple-600', border: 'border-purple-300' },
    ai: { bg: 'bg-orange-600', border: 'border-orange-300' },
    action: { bg: 'bg-red-600', border: 'border-red-300' },
    utility: { bg: 'bg-gray-600', border: 'border-gray-300' },
  };
  return colors[category] || colors.utility;
}

// Wrapper with ReactFlowProvider
export default function FlowEditorWrapper() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}

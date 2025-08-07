'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Play, Zap, Database, GitBranch, Settings, Terminal } from 'lucide-react';

// Dynamically import the flow editor to avoid SSR issues
const FlowEditor = dynamic(() => import('../components/FlowEditor'), { 
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center">Loading FlowForge...</div>
});

export default function FlowForgePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FlowForge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FlowForge</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">v1.0.0</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Backend Connected</span>
            </div>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Execute Flow</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Node Palette Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Node Palette</h2>
            
            {/* Node Categories */}
            <div className="space-y-4">
              {/* Triggers */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Play className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium text-gray-700">Triggers</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem 
                    icon={<Play className="w-4 h-4" />}
                    title="Manual Trigger"
                    description="Start workflow manually"
                    color="bg-blue-100 text-blue-600"
                  />
                </div>
              </div>

              {/* Logic */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <GitBranch className="w-4 h-4 text-green-600" />
                  <h3 className="font-medium text-gray-700">Logic & Flow</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem 
                    icon={<GitBranch className="w-4 h-4" />}
                    title="If/Else"
                    description="Conditional branching"
                    color="bg-green-100 text-green-600"
                  />
                </div>
              </div>

              {/* Data */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  <h3 className="font-medium text-gray-700">Data</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem 
                    icon={<Database className="w-4 h-4" />}
                    title="HTTP Request"
                    description="Make HTTP requests"
                    color="bg-purple-100 text-purple-600"
                  />
                  <NodePaletteItem 
                    icon={<Settings className="w-4 h-4" />}
                    title="Set Variable"
                    description="Set workflow variables"
                    color="bg-purple-100 text-purple-600"
                  />
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Terminal className="w-4 h-4 text-red-600" />
                  <h3 className="font-medium text-gray-700">Actions</h3>
                </div>
                <div className="space-y-2">
                  <NodePaletteItem 
                    icon={<Terminal className="w-4 h-4" />}
                    title="Console Output"
                    description="Debug output to console"
                    color="bg-red-100 text-red-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Editor */}
        <div className="flex-1">
          <FlowEditor />
        </div>
      </div>
    </div>
  );
}

// Node Palette Item Component
function NodePaletteItem({ 
  icon, 
  title, 
  description, 
  color 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div 
      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/reactflow', JSON.stringify({
          type: title.replace(/\s+/g, '').replace('/', ''),
          title,
          description
        }));
      }}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-500 truncate">{description}</p>
        </div>
      </div>
    </div>
  );
}

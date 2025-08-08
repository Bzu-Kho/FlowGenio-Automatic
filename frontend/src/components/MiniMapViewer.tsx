'use client';

import React from 'react';
import ReactFlow, { MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

interface MiniMapViewerProps {
  nodes: Node[];
  edges: Edge[];
}

const MiniMapViewer: React.FC<MiniMapViewerProps> = ({ nodes, edges }) => {
  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        className="!bg-transparent"
      >
        <MiniMap 
          className="!bg-white dark:!bg-gray-700 !border-gray-200 dark:!border-gray-600 !w-full !h-full !relative !top-0 !right-0 !bottom-0 !left-0"
          nodeBorderRadius={2}
          nodeStrokeColor="#94a3b8"
          nodeColor={(node) => {
            switch (node.type) {
              case 'ManualTrigger': return '#3b82f6';
              case 'HttpRequest': return '#10b981';
              case 'IfElse': return '#f59e0b';
              case 'SetVariable': return '#8b5cf6';
              case 'ConsoleOutput': return '#ef4444';
              default: return '#6b7280';
            }
          }}
          maskColor="rgba(59, 130, 246, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};

export default MiniMapViewer;

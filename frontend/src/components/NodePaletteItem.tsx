import React from 'react';

interface NodePaletteItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  category?: string;
}

// Function to get node colors based on category (same as in FlowEditor)
function getNodeColor(category: string) {
  const colors: Record<string, { bg: string; border: string; hoverBg: string }> = {
    trigger: { bg: 'bg-blue-600', border: 'border-blue-300', hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/30' },      // Trigger Flows
    api: { bg: 'bg-green-600', border: 'border-green-300', hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/30' },        // API Calls
    transform: { bg: 'bg-purple-600', border: 'border-purple-300', hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/30' }, // Data Transform
    logic: { bg: 'bg-yellow-600', border: 'border-yellow-300', hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30' },    // Conditional Logic
    scripting: { bg: 'bg-orange-600', border: 'border-orange-300', hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/30' }, // Advanced Scripting
    control: { bg: 'bg-indigo-600', border: 'border-indigo-300', hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30' },  // Flow Control
    debug: { bg: 'bg-red-600', border: 'border-red-300', hoverBg: 'hover:bg-red-50 dark:hover:bg-red-900/30' },          // Debug & Monitor
    utility: { bg: 'bg-gray-600', border: 'border-gray-300', hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-900/30' },      // Default/Utility
  };
  return colors[category] || colors.utility;
}

const NodePaletteItem: React.FC<NodePaletteItemProps> = ({ icon, title, description, category = 'utility' }) => {
  const color = getNodeColor(category);
  
  return (
    <div
      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${color.hoverBg} transition-colors`}
    >
      <div className={`w-8 h-8 flex items-center justify-center rounded ${color.bg} text-white`}>
        {icon}
      </div>
      <div>
        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{title}</div>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>}
      </div>
    </div>
  );
};

export default NodePaletteItem;

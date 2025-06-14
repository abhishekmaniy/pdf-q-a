import React from 'react';
import { FileText, MessageSquare, Upload } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function Layout({ children, sidebar }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PDF Q&A</h1>
              <p className="text-sm text-gray-500">Ask anything about your documents</p>
            </div>
          </div>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">
          {sidebar}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
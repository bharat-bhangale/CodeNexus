"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="layout-container">
      <div className="layout-topbar flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-primary-500 animate-pulse-slow"></div>
          <h1 className="text-sm font-semibold tracking-wide text-gray-100">CodeNexus</h1>
        </div>
        <div className="text-xs text-gray-400">Next.js + TS Edition</div>
      </div>

      <div className="layout-content flex">
        <div className="layout-sidebar w-64 border-r border-gray-800 p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Explorer</h2>
          {/* Sidebar content will go here */}
        </div>

        <div className="layout-editor flex-1 relative flex items-center justify-center">
          <div className="glass-panel p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
              Welcome to CodeNexus
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              The AI Code Editor That Thinks With You
            </p>
            <div className="flex justify-center gap-4">
              <button className="btn btn-primary">Start Coding</button>
              <button className="btn btn-secondary">Open Project</button>
            </div>
          </div>
        </div>

        <div className="w-80 border-l border-gray-800 flex flex-col">
          <div className="flex-1 p-4 border-b border-gray-800">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">AI Chat</h2>
            {/* Chat content will go here */}
          </div>
          <div className="h-1/3 p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Decision Memory</h2>
            {/* Memory content will go here */}
          </div>
        </div>
      </div>

      <div className="layout-bottombar flex items-center justify-between px-4 text-xs text-gray-400">
        <div className="flex gap-4">
          <span>Ready</span>
          <span>Next.js 15 App Router</span>
        </div>
        <div className="flex gap-4">
          <span>UTF-8</span>
          <span>TypeScript</span>
        </div>
      </div>
    </div>
  );
}

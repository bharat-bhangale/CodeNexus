'use client';

import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { useVisualizeStore } from '@/stores/visualizeStore';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Search,
} from 'lucide-react';

export default function GraphControls() {
  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();
  const searchQuery = useVisualizeStore((s) => s.searchQuery);
  const setSearchQuery = useVisualizeStore((s) => s.setSearchQuery);

  const handleReset = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
  }, [setViewport]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  return (
    <div className="viz-controls">
      <div className="viz-controls-search">
        <Search size={13} className="viz-controls-search-icon" />
        <input
          type="text"
          className="viz-controls-search-input"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search graph nodes"
          id="viz-search-input"
        />
      </div>
      <div className="viz-controls-buttons">
        <button
          className="viz-controls-btn"
          onClick={() => zoomIn({ duration: 200 })}
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          className="viz-controls-btn"
          onClick={() => zoomOut({ duration: 200 })}
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          className="viz-controls-btn"
          onClick={handleFitView}
          title="Fit View"
          aria-label="Fit View"
        >
          <Maximize2 size={14} />
        </button>
        <button
          className="viz-controls-btn"
          onClick={handleReset}
          title="Reset View"
          aria-label="Reset View"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}

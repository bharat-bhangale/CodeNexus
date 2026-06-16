'use client';

import type { Hotspot } from '@/stores/healthStore';
import { useEditorStore } from '@/stores/editorStore';
import { FileCode2 } from 'lucide-react';

interface HotspotListProps {
  hotspots: Hotspot[];
}

function getScoreColor(score: number): string {
  if (score >= 86) return 'var(--health-cyan, #22d3ee)';
  if (score >= 71) return 'var(--health-green, #22c55e)';
  if (score >= 51) return 'var(--health-amber, #f59e0b)';
  if (score >= 31) return 'var(--health-orange, #f97316)';
  return 'var(--health-red, #ef4444)';
}

export default function HotspotList({ hotspots }: HotspotListProps) {
  const openFiles = useEditorStore((s) => s.openFiles);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);

  const handleClick = (filePath: string) => {
    // Try to activate the file if it's already open
    const existing = openFiles.find((f) => f.path === filePath);
    if (existing) {
      setActiveFile(existing.id);
    }
    // Otherwise just highlight — full navigation would need fileApi
  };

  if (hotspots.length === 0) {
    return (
      <div className="hotspot-empty">
        <p>No hotspots detected — great!</p>
      </div>
    );
  }

  return (
    <div className="hotspot-list" id="hotspot-list">
      {hotspots.map((hs, i) => {
        const color = getScoreColor(hs.score);
        const fileName = hs.file.split('/').pop() || hs.file;

        return (
          <button
            key={i}
            className="hotspot-item"
            onClick={() => handleClick(hs.file)}
            title={`${hs.file}\n${hs.topIssue}`}
          >
            <div className="hotspot-rank" style={{ color }}>
              #{i + 1}
            </div>
            <div className="hotspot-info">
              <div className="hotspot-file">
                <FileCode2 size={12} />
                <span>{fileName}</span>
              </div>
              <div className="hotspot-issue">{hs.topIssue}</div>
            </div>
            <div className="hotspot-meta">
              <span className="hotspot-score" style={{ color }}>
                {hs.score}
              </span>
              <span className="hotspot-issue-count">
                {hs.issues} issue{hs.issues !== 1 ? 's' : ''}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

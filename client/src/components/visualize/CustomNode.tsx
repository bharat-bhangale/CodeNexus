'use client';

import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { FileCode2, FileJson, FileType, FileText, File, Box, Braces } from 'lucide-react';
import NodeTooltip from './NodeTooltip';

function getNodeIcon(nodeType: string, language?: string) {
  if (nodeType === 'component') return <Box size={16} />;
  if (nodeType === 'function') return <Braces size={16} />;

  switch (language) {
    case 'javascript':
    case 'typescript':
      return <FileCode2 size={16} />;
    case 'json':
      return <FileJson size={16} />;
    case 'css':
    case 'scss':
      return <FileType size={16} />;
    case 'markdown':
      return <FileText size={16} />;
    default:
      return <File size={16} />;
  }
}

function getNodeColor(nodeType: string, language?: string): string {
  if (nodeType === 'component') return '#06b6d4';
  if (nodeType === 'function') return '#8b5cf6';
  if (nodeType === 'variable') return '#f59e0b';

  switch (language) {
    case 'javascript':
      return '#f7df1e';
    case 'typescript':
      return '#3178c6';
    case 'css':
      return '#264de4';
    case 'json':
      return '#f5a623';
    case 'markdown':
      return '#519aba';
    default:
      return '#6366f1';
  }
}

function CustomNode({ data, selected }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const color = getNodeColor(data.nodeType, data.language);
  const dimmed = data.dimmed;

  return (
    <div
      className={`viz-node ${selected ? 'viz-node-selected' : ''} ${dimmed ? 'viz-node-dimmed' : ''}`}
      style={{
        borderColor: selected ? color : 'var(--border-default)',
        boxShadow: hovered && !dimmed
          ? `0 0 16px ${color}44, 0 0 4px ${color}22`
          : selected
            ? `0 0 12px ${color}33`
            : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="viz-handle" />
      <div className="viz-node-inner">
        <span className="viz-node-icon" style={{ color }}>
          {getNodeIcon(data.nodeType, data.language)}
        </span>
        <span className="viz-node-label">{data.label}</span>
      </div>
      {data.badge && (
        <span className="viz-node-badge" style={{ background: color }}>
          {data.badge}
        </span>
      )}
      <Handle type="source" position={Position.Bottom} className="viz-handle" />
      {hovered && !dimmed && (
        <NodeTooltip
          label={data.label}
          nodeType={data.nodeType}
          language={data.language}
          path={data.path}
          startLine={data.startLine}
          endLine={data.endLine}
          metadata={data.metadata}
        />
      )}
    </div>
  );
}

export default memo(CustomNode);

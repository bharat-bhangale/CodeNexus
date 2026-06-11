---
name: build-visualization
description: Creates an interactive React Flow graph visualization for CodeNexus's Explain My Code feature — custom nodes, custom edges, dagre layout, and export functionality.
user-invocable: true
---

# Build Visualization

## Input Required
- **Visualization type**: `dependency`, `call-graph`, `component-tree`, `data-flow`

## Steps

### Step 1 — Create the custom node component
**Path:** `client/src/components/visualize/nodes/{Type}Node.jsx`

```jsx
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FileCode, FunctionSquare, Component, Database } from 'lucide-react';

const iconMap = {
  file: FileCode,
  function: FunctionSquare,
  component: Component,
  data: Database,
};

const {Type}Node = memo(({ data, selected }) => {
  const Icon = iconMap[data.nodeType] || FileCode;

  return (
    <div
      className={`viz-node viz-node--${data.nodeType} ${selected ? 'viz-node--selected' : ''}`}
      id={`viz-node-${data.id}`}
      tabIndex={0}
      aria-label={`${data.nodeType}: ${data.label}`}
    >
      <Handle type="target" position={Position.Top} className="viz-handle" />
      <div className="viz-node__content">
        <Icon size={16} className="viz-node__icon" />
        <span className="viz-node__label">{data.label}</span>
        {data.badge && <span className="viz-node__badge">{data.badge}</span>}
      </div>
      <Handle type="source" position={Position.Bottom} className="viz-handle" />
    </div>
  );
});

{Type}Node.displayName = '{Type}Node';
export default {Type}Node;
```

Node CSS (add to `client/src/styles/visualize.css`):
```css
.viz-node {
  min-width: 120px;
  height: 48px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.viz-node:hover {
  transform: scale(1.05);
  box-shadow: 0 0 12px var(--accent-primary-alpha);
  border-color: var(--accent-primary);
}
.viz-node--selected {
  border-color: var(--accent-primary);
  box-shadow: 0 0 16px var(--accent-primary-alpha);
}
```

### Step 2 — Create the custom edge component
**Path:** `client/src/components/visualize/edges/{Type}Edge.jsx`

```jsx
import { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';

const {Type}Edge = memo(({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      <path
        id={id}
        className={`viz-edge ${selected ? 'viz-edge--selected' : ''}`}
        d={edgePath}
        strokeDasharray={data?.animated ? '5 5' : 'none'}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className="viz-edge__label"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

{Type}Edge.displayName = '{Type}Edge';
export default {Type}Edge;
```

### Step 3 — Create the graph component
**Path:** `client/src/components/visualize/{Type}Graph.jsx`

```jsx
import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState,
} from 'reactflow';
import dagre from 'dagre';
import {Type}Node from './nodes/{Type}Node';
import {Type}Edge from './edges/{Type}Edge';
import 'reactflow/dist/style.css';

const nodeTypes = { '{type}': {Type}Node };
const edgeTypes = { '{type}': {Type}Edge };

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

  nodes.forEach((node) => g.setNode(node.id, { width: 150, height: 48 }));
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const pos = g.node(node.id);
      return { ...node, position: { x: pos.x - 75, y: pos.y - 24 } };
    }),
    edges,
  };
};

const {Type}Graph = ({ rawNodes = [], rawEdges = [] }) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(rawNodes, rawEdges),
    [rawNodes, rawEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onNodeClick = useCallback((event, node) => {
    if (node.data.filePath) {
      // Navigate to file in editor
      window.dispatchEvent(new CustomEvent('navigate-to-file', {
        detail: { filePath: node.data.filePath, line: node.data.line },
      }));
    }
  }, []);

  return (
    <div className="viz-canvas" id="viz-{type}-graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
      >
        <Background variant="dots" gap={16} size={1} color="var(--border-subtle)" />
        <Controls showInteractive={false} />
        <MiniMap nodeColor="var(--accent-primary)" maskColor="var(--bg-overlay)" />
      </ReactFlow>
    </div>
  );
};

export default {Type}Graph;
```

### Step 4 — Create the backend graph generator
**Path:** `server/src/services/GraphGenerator.js` (add method)

```javascript
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

export const generate{Type}Graph = (sourceCode, filePath) => {
  const ast = parser.parse(sourceCode, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  const nodes = [];
  const edges = [];

  traverse(ast, {
    // Extract relevant AST information based on graph type
    ImportDeclaration(path) {
      // For dependency graphs
    },
    CallExpression(path) {
      // For call graphs
    },
    // etc.
  });

  return { nodes, edges };
};
```

### Step 5 — Add export functionality
```javascript
import { toPng, toSvg } from 'html-to-image';

export const exportGraph = async (elementId, format = 'png') => {
  const element = document.getElementById(elementId);
  const fn = format === 'svg' ? toSvg : toPng;
  const dataUrl = await fn(element, { backgroundColor: '#0d1117' });
  // trigger download
};
```

## Rules
- ✅ Use React Flow 11, NOT vis.js or cytoscape
- ✅ Use dagre for hierarchical layout computation
- ✅ All nodes must be clickable → navigate to source code in editor
- ✅ Canvas background: dot grid pattern
- ✅ Include: zoom controls, reset/fit view, minimap, search
- ✅ Export support: PNG and SVG via html-to-image
- ✅ Custom nodes: 120×48px minimum, rounded 8px, icon + label
- ✅ Hover effect: scale(1.05) with accent glow shadow

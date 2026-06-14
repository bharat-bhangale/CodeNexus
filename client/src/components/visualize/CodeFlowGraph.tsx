'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeMouseHandler,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import GraphControls from './GraphControls';
import { useVisualizeStore } from '@/stores/visualizeStore';
import { useEditorStore } from '@/stores/editorStore';
import { fetchFileContent } from '@/services/fileApi';
import { detectLanguage } from '@/utils/languageDetector';

const nodeTypes = { custom: CustomNode };

function CodeFlowGraphInner() {
  const graphNodes = useVisualizeStore((s) => s.nodes);
  const graphEdges = useVisualizeStore((s) => s.edges);
  const searchQuery = useVisualizeStore((s) => s.searchQuery);
  const selectNode = useVisualizeStore((s) => s.selectNode);
  const openFile = useEditorStore((s) => s.openFile);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const { fitView } = useReactFlow();

  // Transform store nodes → React Flow nodes
  const nodes: Node[] = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return graphNodes.map((n) => {
      const matches = !query || n.label.toLowerCase().includes(query);
      return {
        id: n.id,
        type: 'custom',
        position: n.position,
        data: {
          label: n.label,
          nodeType: n.type,
          language: n.language,
          path: n.path,
          startLine: n.startLine,
          endLine: n.endLine,
          metadata: n.metadata,
          dimmed: query ? !matches : false,
          badge: n.type === 'component' ? 'C' : n.type === 'function' ? 'ƒ' : undefined,
        },
      };
    });
  }, [graphNodes, searchQuery]);

  // Transform store edges → React Flow edges
  const edges: Edge[] = useMemo(() => {
    return graphEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.animated ?? true,
      type: 'smoothstep',
      style: {
        stroke: 'var(--accent-primary)',
        strokeWidth: 1.5,
        opacity: 0.7,
      },
      labelStyle: {
        fill: 'var(--text-muted)',
        fontSize: 10,
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: 'var(--bg-surface)',
        fillOpacity: 0.9,
      },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 3,
    }));
  }, [graphEdges]);

  // Handle node click → select node
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // Handle node double-click → open file in editor
  const handleNodeDoubleClick: NodeMouseHandler = useCallback(
    async (_event, node) => {
      const data = node.data;
      if (!data.path) return;

      // Check if already open
      const editorState = useEditorStore.getState();
      const existing = editorState.openFiles.find((f) => f.path === data.path);
      if (existing) {
        setActiveFile(existing.id);
        return;
      }

      // Try to fetch file content from the file API by searching for it
      try {
        // We need the file ID — search by path in open files or fetch from the file tree
        const { fileTree } = await import('@/stores/fileStore').then((m) => ({
          fileTree: m.useFileStore.getState().fileTree,
        }));

        const findNode = (nodes: any[], path: string): any => {
          for (const n of nodes) {
            if (n.path === path) return n;
            if (n.children) {
              const found = findNode(n.children, path);
              if (found) return found;
            }
          }
          return null;
        };

        const fileNode = findNode(fileTree, data.path);
        if (fileNode) {
          const fileData = await fetchFileContent(fileNode.id);
          openFile({
            id: fileNode.id,
            name: fileData.name,
            path: fileData.path,
            content: fileData.content,
            language: fileData.language || detectLanguage(fileData.name),
          });
        }
      } catch (err) {
        console.error('Failed to open file from graph:', err);
      }
    },
    [openFile, setActiveFile]
  );

  return (
    <div className="viz-graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border-subtle)" gap={20} size={1} />
        <Controls
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          className="viz-react-flow-controls"
        />
        <MiniMap
          nodeColor={(n) => {
            const type = n.data?.nodeType;
            if (type === 'component') return '#06b6d4';
            if (type === 'function') return '#8b5cf6';
            return '#6366f1';
          }}
          maskColor="rgba(10, 10, 15, 0.7)"
          className="viz-minimap"
        />
      </ReactFlow>
      <GraphControls />
    </div>
  );
}

export default function CodeFlowGraph() {
  return (
    <ReactFlowProvider>
      <CodeFlowGraphInner />
    </ReactFlowProvider>
  );
}

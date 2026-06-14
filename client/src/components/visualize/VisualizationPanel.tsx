'use client';

import { useCallback, useRef } from 'react';
import { useVisualizeStore, type VizType, type VizScope } from '@/stores/visualizeStore';
import { useEditorStore } from '@/stores/editorStore';
import { generateExplanation } from '@/services/explainApi';
import CodeFlowGraph from './CodeFlowGraph';
import { toPng, toSvg } from 'html-to-image';
import {
  Network,
  GitFork,
  Box,
  ArrowRightLeft,
  Play,
  Download,
  FileImage,
  FileCode2,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const vizTypes: { id: VizType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'dependency_graph',
    label: 'Dependencies',
    icon: <Network size={14} />,
    description: 'Import relationships between files',
  },
  {
    id: 'call_graph',
    label: 'Call Graph',
    icon: <GitFork size={14} />,
    description: 'Function call chains',
  },
  {
    id: 'component_tree',
    label: 'Components',
    icon: <Box size={14} />,
    description: 'React component hierarchy',
  },
  {
    id: 'data_flow',
    label: 'Data Flow',
    icon: <ArrowRightLeft size={14} />,
    description: 'Variable flow through code',
  },
];

const scopeOptions: { id: VizScope; label: string }[] = [
  { id: 'project', label: 'Entire Project' },
  { id: 'file', label: 'Current File' },
];

export default function VisualizationPanel() {
  const vizType = useVisualizeStore((s) => s.vizType);
  const scope = useVisualizeStore((s) => s.scope);
  const isLoading = useVisualizeStore((s) => s.isLoading);
  const error = useVisualizeStore((s) => s.error);
  const summary = useVisualizeStore((s) => s.summary);
  const hasGenerated = useVisualizeStore((s) => s.hasGenerated);
  const nodes = useVisualizeStore((s) => s.nodes);
  const edges = useVisualizeStore((s) => s.edges);
  const setVizType = useVisualizeStore((s) => s.setVizType);
  const setScope = useVisualizeStore((s) => s.setScope);
  const setResult = useVisualizeStore((s) => s.setResult);
  const setLoading = useVisualizeStore((s) => s.setLoading);
  const setError = useVisualizeStore((s) => s.setError);
  const graphRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeFile = useEditorStore.getState().getActiveFile();
      const filePath = scope === 'file' && activeFile ? activeFile.path : undefined;

      const result = await generateExplanation({
        type: vizType,
        scope,
        filePath,
      });

      setResult(result.nodes, result.edges, result.summary);
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message || err?.message || 'Failed to generate visualization';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [vizType, scope, setResult, setLoading, setError]);

  const handleExportPNG = useCallback(async () => {
    const el = graphRef.current?.querySelector('.react-flow') as HTMLElement | null;
    if (!el) return;

    try {
      const dataUrl = await toPng(el, {
        backgroundColor: '#0a0a0f',
        quality: 1,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `codenexus-${vizType}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  }, [vizType]);

  const handleExportSVG = useCallback(async () => {
    const el = graphRef.current?.querySelector('.react-flow') as HTMLElement | null;
    if (!el) return;

    try {
      const dataUrl = await toSvg(el, { backgroundColor: '#0a0a0f' });
      const link = document.createElement('a');
      link.download = `codenexus-${vizType}.svg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('SVG export failed:', err);
    }
  }, [vizType]);

  return (
    <div className="viz-panel" id="viz-panel">
      {/* Header */}
      <div className="viz-panel-header">
        <div className="viz-panel-title">
          <Network size={16} />
          <span>Explain My Code</span>
        </div>
      </div>

      {/* Type Selector */}
      <div className="viz-type-selector">
        {vizTypes.map((vt) => (
          <button
            key={vt.id}
            className={`viz-type-btn ${vizType === vt.id ? 'viz-type-btn-active' : ''}`}
            onClick={() => setVizType(vt.id)}
            title={vt.description}
            aria-label={vt.label}
            id={`viz-type-${vt.id}`}
          >
            {vt.icon}
            <span>{vt.label}</span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="viz-controls-bar">
        <select
          className="viz-scope-select"
          value={scope}
          onChange={(e) => setScope(e.target.value as VizScope)}
          aria-label="Visualization scope"
          id="viz-scope-select"
        >
          {scopeOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          className="viz-generate-btn"
          onClick={handleGenerate}
          disabled={isLoading}
          id="viz-generate-btn"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="viz-spinner" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Graph Area */}
      <div className="viz-graph-area" ref={graphRef}>
        {error && (
          <div className="viz-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!hasGenerated && !isLoading && !error && (
          <div className="viz-empty">
            <div className="viz-empty-icon">
              <Network size={36} />
            </div>
            <h4 className="viz-empty-title">Visualize Your Code</h4>
            <p className="viz-empty-desc">
              Select a visualization type and click Generate to see an interactive graph of your
              codebase.
            </p>
          </div>
        )}

        {hasGenerated && nodes.length === 0 && !isLoading && (
          <div className="viz-empty">
            <p className="viz-empty-desc">No data found for this visualization type.</p>
          </div>
        )}

        {hasGenerated && nodes.length > 0 && <CodeFlowGraph />}
      </div>

      {/* Summary & Export */}
      {hasGenerated && summary && (
        <div className="viz-summary">
          <div className="viz-summary-header">
            <Sparkles size={14} />
            <span>Analysis Summary</span>
          </div>
          <p className="viz-summary-text">{summary}</p>
          <div className="viz-summary-stats">
            <span className="viz-stat">
              <strong>{nodes.length}</strong> nodes
            </span>
            <span className="viz-stat-sep">·</span>
            <span className="viz-stat">
              <strong>{edges.length}</strong> edges
            </span>
          </div>
          <div className="viz-export-buttons">
            <button className="viz-export-btn" onClick={handleExportPNG} title="Export as PNG">
              <FileImage size={13} />
              <span>PNG</span>
            </button>
            <button className="viz-export-btn" onClick={handleExportSVG} title="Export as SVG">
              <FileCode2 size={13} />
              <span>SVG</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

interface NodeTooltipProps {
  label: string;
  nodeType: string;
  language?: string;
  path?: string;
  startLine?: number;
  endLine?: number;
  metadata?: Record<string, any>;
}

export default function NodeTooltip({
  label,
  nodeType,
  language,
  path,
  startLine,
  endLine,
  metadata,
}: NodeTooltipProps) {
  return (
    <div className="viz-tooltip" onClick={(e) => e.stopPropagation()}>
      <div className="viz-tooltip-header">{label}</div>
      <div className="viz-tooltip-body">
        {path && (
          <div className="viz-tooltip-row">
            <span className="viz-tooltip-key">Path</span>
            <span className="viz-tooltip-val">{path}</span>
          </div>
        )}
        <div className="viz-tooltip-row">
          <span className="viz-tooltip-key">Type</span>
          <span className="viz-tooltip-val">{nodeType}</span>
        </div>
        {language && (
          <div className="viz-tooltip-row">
            <span className="viz-tooltip-key">Language</span>
            <span className="viz-tooltip-val">{language}</span>
          </div>
        )}
        {startLine != null && (
          <div className="viz-tooltip-row">
            <span className="viz-tooltip-key">Lines</span>
            <span className="viz-tooltip-val">
              {endLine ? `${startLine}–${endLine}` : `${startLine}`}
            </span>
          </div>
        )}
        {metadata?.props && metadata.props.length > 0 && (
          <div className="viz-tooltip-row">
            <span className="viz-tooltip-key">Props</span>
            <span className="viz-tooltip-val">{metadata.props.join(', ')}</span>
          </div>
        )}
        {metadata?.params && metadata.params.length > 0 && (
          <div className="viz-tooltip-row">
            <span className="viz-tooltip-key">Params</span>
            <span className="viz-tooltip-val">{metadata.params.join(', ')}</span>
          </div>
        )}
        {metadata?.isAsync && (
          <div className="viz-tooltip-row">
            <span className="viz-tooltip-key">Async</span>
            <span className="viz-tooltip-val">Yes</span>
          </div>
        )}
      </div>
      <div className="viz-tooltip-footer">Double-click to open</div>
    </div>
  );
}

'use client';

import { useCallback, useEffect } from 'react';
import { useMemoryStore } from '@/stores/memoryStore';
import { fetchPatterns, fetchRules, createRule, deleteRule } from '@/services/memoryApi';
import {
  TrendingUp,
  Sparkles,
  Shield,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function PatternPanel() {
  const patterns = useMemoryStore((s) => s.patterns);
  const projectRules = useMemoryStore((s) => s.projectRules);
  const isLoading = useMemoryStore((s) => s.isLoading);
  const setPatterns = useMemoryStore((s) => s.setPatterns);
  const setRules = useMemoryStore((s) => s.setRules);
  const addRule = useMemoryStore((s) => s.addRule);
  const removeRule = useMemoryStore((s) => s.removeRule);
  const setLoading = useMemoryStore((s) => s.setLoading);
  const setError = useMemoryStore((s) => s.setError);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pats, rules] = await Promise.all([fetchPatterns(), fetchRules()]);
      setPatterns(pats);
      setRules(rules);
    } catch (err: any) {
      setError(err.message || 'Failed to load patterns');
    } finally {
      setLoading(false);
    }
  }, [setPatterns, setRules, setLoading, setError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRule = useCallback(
    async (pattern: (typeof patterns)[0]) => {
      try {
        const rule = await createRule({
          rule: pattern.description,
          category: pattern.type,
          sourcePatternId: pattern.id,
          sourceDecisionIds: pattern.exampleDecisionIds,
        });
        addRule(rule);
      } catch (err: any) {
        setError(err.message || 'Failed to create rule');
      }
    },
    [addRule, setError]
  );

  const handleDeleteRule = useCallback(
    async (ruleId: string) => {
      try {
        await deleteRule(ruleId);
        removeRule(ruleId);
      } catch (err: any) {
        setError(err.message || 'Failed to delete rule');
      }
    },
    [removeRule, setError]
  );

  function getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return '#22c55e';
    if (confidence >= 60) return '#f59e0b';
    return '#6366f1';
  }

  return (
    <div className="mem-patterns">
      {/* Patterns Section */}
      <div className="mem-patterns-section">
        <div className="mem-section-header">
          <TrendingUp size={14} />
          <span>Detected Patterns</span>
          <button className="mem-refresh-btn" onClick={loadData} disabled={isLoading}>
            {isLoading ? <Loader2 size={12} className="mem-spinner" /> : <Sparkles size={12} />}
          </button>
        </div>

        {patterns.length === 0 && !isLoading && (
          <div className="mem-empty-sm">
            <AlertCircle size={14} />
            <span>Record 3+ decisions to detect patterns</span>
          </div>
        )}

        <div className="mem-patterns-list">
          {patterns.map((pattern) => (
            <div key={pattern.id} className="mem-pattern-card">
              <div className="mem-pattern-header">
                <span className="mem-pattern-desc">{pattern.description}</span>
                <span
                  className="mem-pattern-confidence"
                  style={{ color: getConfidenceColor(pattern.confidence) }}
                >
                  {pattern.confidence}%
                </span>
              </div>
              <div className="mem-pattern-meta">
                <span className="mem-pattern-count">{pattern.occurrences} occurrences</span>
                {pattern.tags.length > 0 && (
                  <span className="mem-pattern-tags">
                    {pattern.tags.map((t) => (
                      <span key={t} className="mem-tag-sm">
                        {t}
                      </span>
                    ))}
                  </span>
                )}
              </div>
              <button
                className="mem-create-rule-btn"
                onClick={() => handleCreateRule(pattern)}
              >
                <Plus size={12} />
                <span>Create Rule</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Section */}
      <div className="mem-rules-section">
        <div className="mem-section-header">
          <Shield size={14} />
          <span>Project Rules ({projectRules.length})</span>
        </div>

        {projectRules.length === 0 && (
          <div className="mem-empty-sm">
            <span>No rules yet. Create rules from detected patterns above.</span>
          </div>
        )}

        <div className="mem-rules-list">
          {projectRules.map((rule) => (
            <div key={rule.id} className="mem-rule-card">
              <div className="mem-rule-text">{rule.rule}</div>
              <div className="mem-rule-footer">
                <span className="mem-rule-category">{rule.category}</span>
                <button
                  className="mem-rule-delete"
                  onClick={() => handleDeleteRule(rule.id)}
                  aria-label="Delete rule"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

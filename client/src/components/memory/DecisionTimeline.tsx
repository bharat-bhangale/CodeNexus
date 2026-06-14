'use client';

import { useCallback, useMemo } from 'react';
import { useMemoryStore } from '@/stores/memoryStore';
import DecisionCard from './DecisionCard';
import DecisionSearch from './DecisionSearch';
import {
  fetchDecisions,
  searchDecisions as searchApi,
  deleteDecision,
} from '@/services/memoryApi';
import { Loader2 } from 'lucide-react';

export default function DecisionTimeline() {
  const decisions = useMemoryStore((s) => s.decisions);
  const isLoading = useMemoryStore((s) => s.isLoading);
  const hasMore = useMemoryStore((s) => s.hasMore);
  const total = useMemoryStore((s) => s.total);
  const filters = useMemoryStore((s) => s.filters);
  const setDecisions = useMemoryStore((s) => s.setDecisions);
  const appendDecisions = useMemoryStore((s) => s.appendDecisions);
  const removeDecision = useMemoryStore((s) => s.removeDecision);
  const setFilters = useMemoryStore((s) => s.setFilters);
  const setLoading = useMemoryStore((s) => s.setLoading);
  const setError = useMemoryStore((s) => s.setError);

  const loadDecisions = useCallback(
    async (newFilters?: Record<string, any>, append = false) => {
      setLoading(true);
      try {
        const mergedFilters = { ...filters, ...newFilters };
        const result = await fetchDecisions(mergedFilters);
        if (append) {
          appendDecisions(result.decisions, result.total, result.hasMore);
        } else {
          setDecisions(result.decisions, result.total, result.hasMore);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load decisions');
      } finally {
        setLoading(false);
      }
    },
    [filters, setDecisions, appendDecisions, setLoading, setError]
  );

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        loadDecisions({ page: 1 });
        return;
      }
      setLoading(true);
      try {
        const results = await searchApi(query);
        setDecisions(results, results.length, false);
      } catch (err: any) {
        setError(err.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    },
    [loadDecisions, setDecisions, setLoading, setError]
  );

  const handleFilterChange = useCallback(
    (newFilters: Record<string, any>) => {
      setFilters({ ...newFilters, page: 1 });
      loadDecisions({ ...newFilters, page: 1 });
    },
    [setFilters, loadDecisions]
  );

  const handleLoadMore = useCallback(() => {
    const nextPage = (filters.page || 1) + 1;
    setFilters({ page: nextPage });
    loadDecisions({ page: nextPage }, true);
  }, [filters.page, setFilters, loadDecisions]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteDecision(id);
        removeDecision(id);
      } catch (err: any) {
        setError(err.message || 'Failed to delete');
      }
    },
    [removeDecision, setError]
  );

  // Group decisions by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof decisions> = {};
    for (const d of decisions) {
      const date = new Date(d.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(d);
    }
    return groups;
  }, [decisions]);

  return (
    <div className="mem-timeline">
      <DecisionSearch onSearch={handleSearch} onFilterChange={handleFilterChange} />

      <div className="mem-timeline-list">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mem-timeline-group">
            <div className="mem-timeline-date">{date}</div>
            {items.map((d) => (
              <DecisionCard key={d._id} decision={d} onDelete={handleDelete} />
            ))}
          </div>
        ))}

        {decisions.length === 0 && !isLoading && (
          <div className="mem-empty">
            <p>No decisions recorded yet.</p>
            <p className="mem-empty-hint">
              Record your first decision using the "Record" tab.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="mem-loading">
            <Loader2 size={18} className="mem-spinner" />
            <span>Loading...</span>
          </div>
        )}

        {hasMore && !isLoading && (
          <button className="mem-load-more" onClick={handleLoadMore}>
            Load More ({total - decisions.length} remaining)
          </button>
        )}
      </div>
    </div>
  );
}

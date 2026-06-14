'use client';

import { useState, useCallback } from 'react';
import { useMemoryStore } from '@/stores/memoryStore';
import { Search, Filter, X } from 'lucide-react';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'manual', label: 'Manual' },
  { value: 'intent_accept', label: 'Intent Accept' },
  { value: 'chat_apply', label: 'Chat Apply' },
  { value: 'review_fix', label: 'Review Fix' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'scaffold', label: 'Scaffold' },
  { value: 'pattern_rule', label: 'Pattern Rule' },
];

interface DecisionSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: Record<string, any>) => void;
}

export default function DecisionSearch({ onSearch, onFilterChange }: DecisionSearchProps) {
  const searchQuery = useMemoryStore((s) => s.searchQuery);
  const setSearchQuery = useMemoryStore((s) => s.setSearchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearch(value);
    },
    [setSearchQuery, onSearch]
  );

  const handleClear = useCallback(() => {
    setSearchQuery('');
    onSearch('');
  }, [setSearchQuery, onSearch]);

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setTypeFilter(value);
      onFilterChange({ type: value || undefined });
    },
    [onFilterChange]
  );

  const handleTagChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setTagFilter(value);
      onFilterChange({ tags: value || undefined });
    },
    [onFilterChange]
  );

  return (
    <div className="mem-search">
      <div className="mem-search-bar">
        <Search size={13} className="mem-search-icon" />
        <input
          type="text"
          className="mem-search-input"
          placeholder="Search decisions..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search decisions"
          id="mem-search-input"
        />
        {searchQuery && (
          <button className="mem-search-clear" onClick={handleClear} aria-label="Clear search">
            <X size={12} />
          </button>
        )}
        <button
          className={`mem-filter-toggle ${showFilters ? 'mem-filter-toggle-active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
        >
          <Filter size={13} />
        </button>
      </div>
      {showFilters && (
        <div className="mem-filters">
          <select
            className="mem-filter-select"
            value={typeFilter}
            onChange={handleTypeChange}
            aria-label="Filter by type"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="mem-filter-input"
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={handleTagChange}
            aria-label="Filter by tag"
          />
        </div>
      )}
    </div>
  );
}

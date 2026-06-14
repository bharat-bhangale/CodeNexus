'use client';

import { useState, useCallback } from 'react';
import { useMemoryStore } from '@/stores/memoryStore';
import { useEditorStore } from '@/stores/editorStore';
import { createDecision } from '@/services/memoryApi';
import { Send, FileCode2, Tag, Loader2, CheckCircle } from 'lucide-react';

export default function RecordDecisionForm() {
  const addDecision = useMemoryStore((s) => s.addDecision);
  const setError = useMemoryStore((s) => s.setError);
  const activeFile = useEditorStore((s) => s.getActiveFile());

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      setSaving(true);
      setSuccess(false);

      try {
        const tagList = tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);

        const codeContext: Record<string, any> = {};
        const affectedFiles: { path: string; name: string }[] = [];

        if (activeFile) {
          codeContext.filePath = activeFile.path;
          codeContext.fileName = activeFile.name;
          codeContext.language = activeFile.language;
          affectedFiles.push({ path: activeFile.path, name: activeFile.name });
        }

        const decision = await createDecision({
          title: title.trim(),
          description: description.trim(),
          type: 'manual',
          tags: tagList,
          codeContext,
          affectedFiles,
        });

        addDecision(decision);
        setTitle('');
        setDescription('');
        setTags('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      } catch (err: any) {
        setError(err.message || 'Failed to record decision');
      } finally {
        setSaving(false);
      }
    },
    [title, description, tags, activeFile, addDecision, setError]
  );

  return (
    <form className="mem-form" onSubmit={handleSubmit}>
      <div className="mem-form-header">
        <span>Record a Decision</span>
      </div>

      <div className="mem-form-group">
        <label className="mem-form-label" htmlFor="mem-title">
          Title *
        </label>
        <input
          id="mem-title"
          type="text"
          className="mem-form-input"
          placeholder="e.g., Use async/await over .then() chains"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <div className="mem-form-group">
        <label className="mem-form-label" htmlFor="mem-desc">
          Description
        </label>
        <textarea
          id="mem-desc"
          className="mem-form-textarea"
          placeholder="Why did you make this decision? What problem does it solve?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={2000}
        />
      </div>

      <div className="mem-form-group">
        <label className="mem-form-label" htmlFor="mem-tags">
          <Tag size={12} />
          Tags (comma-separated)
        </label>
        <input
          id="mem-tags"
          type="text"
          className="mem-form-input"
          placeholder="e.g., architecture, state-management, performance"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      {activeFile && (
        <div className="mem-form-context">
          <FileCode2 size={12} />
          <span>Context: {activeFile.name}</span>
        </div>
      )}

      <button
        type="submit"
        className="mem-form-submit"
        disabled={saving || !title.trim()}
      >
        {saving ? (
          <>
            <Loader2 size={14} className="mem-spinner" />
            <span>Saving...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle size={14} />
            <span>Saved!</span>
          </>
        ) : (
          <>
            <Send size={14} />
            <span>Record Decision</span>
          </>
        )}
      </button>
    </form>
  );
}

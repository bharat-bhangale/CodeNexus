'use client';

import type { RefObject } from 'react';
import { File, Folder } from 'lucide-react';

interface InlineFileInputProps {
  depth: number;
  type: 'file' | 'folder';
  initialValue?: string;
  placeholder?: string;
  error?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export default function InlineFileInput({
  depth,
  type,
  initialValue = '',
  placeholder,
  error,
  inputRef,
  onKeyDown,
  onBlur,
}: InlineFileInputProps) {
  return (
    <div
      className="file-node file-node-inline"
      style={{ paddingLeft: depth * 16 + 8 }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.stopPropagation()}
    >
      <span className="file-node-spacer" />
      <span className="file-node-icon">
        {type === 'folder' ? (
          <Folder size={16} style={{ color: '#dcb67a' }} />
        ) : (
          <File size={16} style={{ color: '#a1a1b5' }} />
        )}
      </span>
      <span className="file-node-input-wrapper">
        <input
          key={`${type}-${initialValue}`}
          ref={inputRef}
          className={`file-inline-input ${error ? 'file-inline-input-error' : ''}`}
          type="text"
          defaultValue={initialValue}
          placeholder={placeholder || (type === 'folder' ? 'Folder name...' : 'File name...')}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          onClick={(event) => event.stopPropagation()}
          autoFocus
        />
        {error && <span className="file-inline-error">{error}</span>}
      </span>
    </div>
  );
}

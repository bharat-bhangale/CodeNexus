import type { editor } from 'monaco-editor';

export const codenexusDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Keywords: soft purple
    { token: 'keyword', foreground: 'c792ea', fontStyle: 'italic' },
    { token: 'keyword.control', foreground: 'c792ea', fontStyle: 'italic' },
    { token: 'storage', foreground: 'c792ea', fontStyle: 'italic' },
    { token: 'storage.type', foreground: 'c792ea', fontStyle: 'italic' },

    // Strings: green
    { token: 'string', foreground: 'c3e88d' },
    { token: 'string.escape', foreground: '89ddff' },
    { token: 'string.regexp', foreground: 'f78c6c' },

    // Numbers: orange
    { token: 'number', foreground: 'f78c6c' },
    { token: 'constant.numeric', foreground: 'f78c6c' },

    // Functions: blue
    { token: 'entity.name.function', foreground: '82aaff' },
    { token: 'support.function', foreground: '82aaff' },
    { token: 'meta.function-call', foreground: '82aaff' },

    // Comments: muted blue-grey, italic
    { token: 'comment', foreground: '546e7a', fontStyle: 'italic' },
    { token: 'comment.block', foreground: '546e7a', fontStyle: 'italic' },
    { token: 'comment.line', foreground: '546e7a', fontStyle: 'italic' },

    // Types and classes: warm yellow
    { token: 'type', foreground: 'ffcb6b' },
    { token: 'entity.name.type', foreground: 'ffcb6b' },
    { token: 'support.type', foreground: 'ffcb6b' },
    { token: 'entity.name.class', foreground: 'ffcb6b' },

    // Tags (JSX/HTML): coral
    { token: 'tag', foreground: 'f07178' },
    { token: 'tag.id', foreground: 'f07178' },
    { token: 'tag.class', foreground: 'f07178' },
    { token: 'metatag', foreground: 'f07178' },

    // Attributes: peach
    { token: 'attribute.name', foreground: 'ffcb6b' },
    { token: 'attribute.value', foreground: 'c3e88d' },

    // Variables
    { token: 'variable', foreground: 'e4e4e7' },
    { token: 'variable.predefined', foreground: '82aaff' },
    { token: 'variable.parameter', foreground: 'e4e4e7' },

    // Operators
    { token: 'operator', foreground: '89ddff' },
    { token: 'delimiter', foreground: '89ddff' },
    { token: 'delimiter.bracket', foreground: 'a1a1b5' },

    // Constants
    { token: 'constant', foreground: 'f78c6c' },
    { token: 'constant.language', foreground: 'f78c6c' },

    // Decorators
    { token: 'annotation', foreground: 'c792ea' },
    { token: 'tag.decorator', foreground: '82aaff' },
  ],
  colors: {
    // Editor backgrounds
    'editor.background': '#0d0d14',
    'editor.foreground': '#e4e4e7',
    'editor.lineHighlightBackground': '#1a1a2e',
    'editor.lineHighlightBorder': '#1a1a2e00',

    // Selection
    'editor.selectionBackground': '#5865f240',
    'editor.inactiveSelectionBackground': '#5865f220',
    'editor.selectionHighlightBackground': '#5865f215',

    // Cursor
    'editorCursor.foreground': '#6366f1',

    // Whitespace
    'editorWhitespace.foreground': '#2a2a45',

    // Indent guides
    'editorIndentGuide.background': '#1e1e36',
    'editorIndentGuide.activeBackground': '#3a3a5c',

    // Line numbers
    'editorLineNumber.foreground': '#3a3a5c',
    'editorLineNumber.activeForeground': '#a1a1b5',

    // Gutter
    'editorGutter.background': '#0d0d14',

    // Scrollbar
    'scrollbar.shadow': '#00000040',
    'scrollbarSlider.background': '#252540aa',
    'scrollbarSlider.hoverBackground': '#3a3a5ccc',
    'scrollbarSlider.activeBackground': '#5a5a72cc',

    // Minimap
    'minimap.background': '#0d0d14',
    'minimapSlider.background': '#252540aa',
    'minimapSlider.hoverBackground': '#3a3a5ccc',

    // Editor widgets (autocomplete, find)
    'editorWidget.background': '#1a1a2e',
    'editorWidget.border': '#2a2a45',
    'editorSuggestWidget.background': '#1a1a2e',
    'editorSuggestWidget.border': '#2a2a45',
    'editorSuggestWidget.selectedBackground': '#252540',
    'editorSuggestWidget.highlightForeground': '#6366f1',

    // Bracket match
    'editorBracketMatch.background': '#5865f225',
    'editorBracketMatch.border': '#6366f1',

    // Find match
    'editor.findMatchBackground': '#f59e0b40',
    'editor.findMatchHighlightBackground': '#f59e0b20',

    // Overview ruler
    'editorOverviewRuler.border': '#1e1e36',

    // Peek view
    'peekView.border': '#6366f1',
    'peekViewEditor.background': '#0d0d14',
    'peekViewResult.background': '#1a1a2e',

    // Diff
    'diffEditor.insertedTextBackground': '#22c55e20',
    'diffEditor.removedTextBackground': '#ef444420',
  },
};

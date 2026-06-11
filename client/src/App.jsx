import { Code2, Sparkles, Brain, GitBranch } from 'lucide-react';

const App = () => {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'fadeIn 0.6s ease',
        }}
      >
        <Code2
          size={40}
          style={{ color: 'var(--accent-primary)' }}
        />
        <h1
          style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          CodeNexus
        </h1>
      </div>

      <p
        style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--text-secondary)',
          animation: 'fadeIn 0.8s ease',
        }}
      >
        The AI Code Editor That Thinks With You
      </p>

      <div
        style={{
          display: 'flex',
          gap: '2rem',
          marginTop: '1rem',
          animation: 'slideUp 0.6s ease 0.2s both',
        }}
      >
        {[
          { icon: Sparkles, label: 'Intent Mode', color: 'var(--accent-primary)' },
          { icon: Brain, label: 'Decision Memory', color: 'var(--accent-secondary)' },
          { icon: GitBranch, label: 'Visual Explain', color: 'var(--accent-tertiary)' },
        ].map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              transition: 'all var(--transition-base)',
            }}
          >
            <Icon size={16} style={{ color }} />
            {label}
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 'var(--space-6)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-muted)',
          animation: 'fadeIn 1s ease 0.5s both',
        }}
      >
        Phase 1 — Foundation • v0.1.0
      </div>
    </div>
  );
};

export default App;

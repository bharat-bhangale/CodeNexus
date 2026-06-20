'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Keyboard,
  Sparkles,
  X,
} from 'lucide-react';
import AuthProvider from '@/components/auth/AuthProvider';

type ToastVariant = 'success' | 'info' | 'warning';

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends ToastInput {
  id: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => undefined,
    };
  }
  return context;
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PolishProviders>{children}</PolishProviders>
    </AuthProvider>
  );
}

function PolishProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isBooting, setIsBooting] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = 'info' }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [
        ...current.slice(-3),
        { id, title, description, variant },
      ]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast]
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const toastEvent = event as CustomEvent<ToastInput>;
      if (toastEvent.detail?.title) {
        showToast(toastEvent.detail);
      }
    };

    window.addEventListener('codenexus:toast', handler);
    return () => window.removeEventListener('codenexus:toast', handler);
  }, [showToast]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        Boolean(target?.isContentEditable);

      if (event.key === 'Escape') {
        setShortcutsOpen(false);
        return;
      }

      if (event.key === 'F1') {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (event.key === '?' && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toastValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={toastValue}>
      <div className="app-route-shell">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            className="app-route-frame"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      <ShortcutDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <LoadingScreen visible={isBooting} />
    </ToastContext.Provider>
  );
}

function LoadingScreen({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="cn-loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          aria-label="Loading CodeNexus"
        >
          <motion.div
            className="cn-loading-mark"
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            N
          </motion.div>
          <motion.div
            className="cn-loading-wordmark"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
          >
            CodeNexus
          </motion.div>
          <motion.div
            className="cn-loading-bar"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="cn-toast-viewport" aria-live="polite" aria-relevant="additions">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            className={`cn-toast cn-toast-${toast.variant}`}
            key={toast.id}
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="cn-toast-icon">
              {toast.variant === 'success' && <CheckCircle2 size={17} />}
              {toast.variant === 'warning' && <AlertTriangle size={17} />}
              {toast.variant === 'info' && <Info size={17} />}
            </div>
            <div className="cn-toast-copy">
              <strong>{toast.title}</strong>
              {toast.description && <span>{toast.description}</span>}
            </div>
            <button
              className="cn-toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ShortcutDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const shortcutGroups = [
    {
      title: 'Workspace',
      shortcuts: [
        ['Ctrl+B', 'Toggle sidebar'],
        ['Ctrl+`', 'Toggle terminal'],
        ['Ctrl+S', 'Save active file'],
      ],
    },
    {
      title: 'AI Panels',
      shortcuts: [
        ['Ctrl+Shift+E', 'Open explain and visualize'],
        ['Ctrl+Shift+M', 'Open decision memory'],
        ['Ctrl+Shift+R', 'Run code review'],
        ['Ctrl+Shift+H', 'Open health dashboard'],
      ],
    },
    {
      title: 'Help',
      shortcuts: [
        ['?', 'Show this dialog'],
        ['F1', 'Open shortcut help'],
        ['Esc', 'Close dialogs'],
      ],
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cn-shortcuts-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="cn-shortcuts-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcut-dialog-title"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cn-shortcuts-header">
              <div>
                <span className="cn-shortcuts-kicker">
                  <Keyboard size={14} />
                  Command help
                </span>
                <h2 id="shortcut-dialog-title">Keyboard shortcuts</h2>
              </div>
              <button className="cn-shortcuts-close" onClick={onClose} aria-label="Close shortcuts">
                <X size={18} />
              </button>
            </div>

            <div className="cn-shortcuts-grid">
              {shortcutGroups.map((group) => (
                <section className="cn-shortcut-group" key={group.title}>
                  <h3>{group.title}</h3>
                  {group.shortcuts.map(([keys, label]) => (
                    <div className="cn-shortcut-row" key={keys}>
                      <kbd>{keys}</kbd>
                      <span>{label}</span>
                    </div>
                  ))}
                </section>
              ))}
            </div>

            <div className="cn-shortcuts-footer">
              <Sparkles size={14} />
              <span>Use Intent Mode when a shortcut is not enough.</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

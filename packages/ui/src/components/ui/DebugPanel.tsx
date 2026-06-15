import React from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollableOverlay } from '@/components/ui/ScrollableOverlay';
import { Icon } from "@/components/icon/Icon";

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'event';

interface LogEntry {
  id: number;
  timestamp: number;
  level: LogLevel;
  text: string;
}

interface DebugPanelProps {
  onClose?: () => void;
}

const MAX_LOG_ENTRIES = 500;

const formatTimestamp = (ts: number): string => {
  const d = new Date(ts);
  const pad = (n: number, width = 2) => n.toString().padStart(width, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
};

const formatValue = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value instanceof Error) {
    return `${value.name}: ${value.message}${value.stack ? `\n${value.stack}` : ''}`;
  }
  if (typeof value === 'function') {
    return `[Function ${value.name || 'anonymous'}]`;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return Object.prototype.toString.call(value);
  }
};

const getLevelColor = (level: LogLevel): string => {
  switch (level) {
    case 'error':
      return 'var(--status-error)';
    case 'warn':
      return 'var(--status-warning)';
    case 'info':
      return 'var(--status-info)';
    case 'event':
      return 'var(--status-warning)';
    case 'log':
    default:
      return 'var(--surface-muted-foreground)';
  }
};

const MetricCard: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  return (
    <div
      className="rounded-md p-2"
      style={{ backgroundColor: 'color-mix(in srgb, var(--surface-muted) 55%, transparent)' }}
    >
      <div className="typography-meta text-[var(--surface-muted-foreground)]">{label}</div>
      <div className="typography-markdown font-semibold text-[var(--surface-foreground)] break-all">{value}</div>
    </div>
  );
};

export const DebugPanel: React.FC<DebugPanelProps> = ({ onClose }) => {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [refreshCount, setRefreshCount] = React.useState(0);
  const [filter, setFilter] = React.useState<LogLevel | 'all'>('all');
  const logIdRef = React.useRef(0);

  const pushLog = React.useCallback((level: LogLevel, args: unknown[]) => {
    const text = args.map(formatValue).join(' ');
    setLogs((prev) => {
      const next: LogEntry[] = [
        ...prev,
        { id: logIdRef.current++, timestamp: Date.now(), level, text },
      ];
      if (next.length > MAX_LOG_ENTRIES) {
        next.splice(0, next.length - MAX_LOG_ENTRIES);
      }
      return next;
    });
  }, []);

  React.useEffect(() => {
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args: unknown[]) => {
      pushLog('log', args);
      originalLog.apply(console, args);
    };
    console.info = (...args: unknown[]) => {
      pushLog('info', args);
      originalInfo.apply(console, args);
    };
    console.warn = (...args: unknown[]) => {
      pushLog('warn', args);
      originalWarn.apply(console, args);
    };
    console.error = (...args: unknown[]) => {
      pushLog('error', args);
      originalError.apply(console, args);
    };

    const handleError = (event: ErrorEvent) => {
      pushLog('error', [`[window.error] ${event.message} (${event.filename}:${event.lineno})`]);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      pushLog('error', [`[unhandledrejection] ${formatValue(reason)}`]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    pushLog('event', ['[DebugPanel] Console capture started']);

    return () => {
      console.log = originalLog;
      console.info = originalInfo;
      console.warn = originalWarn;
      console.error = originalError;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [pushLog]);

  const handleClear = React.useCallback(() => {
    setLogs([]);
  }, []);

  const handleForceRefresh = React.useCallback(() => {
    setRefreshCount((count) => count + 1);
  }, []);

  const filteredLogs = React.useMemo(() => {
    if (filter === 'all') return logs;
    return logs.filter((entry) => entry.level === filter);
  }, [logs, filter]);

  const viewport = React.useMemo(() => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return { width: window.innerWidth, height: window.innerHeight };
  }, [refreshCount]);

  const localStorageSize = React.useMemo(() => {
    if (typeof window === 'undefined') return 0;
    try {
      let total = 0;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key !== null) {
          const value = window.localStorage.getItem(key) ?? '';
          total += key.length + value.length;
        }
      }
      return total;
    } catch {
      return 0;
    }
  }, [refreshCount]);

  const localStorageKeys = React.useMemo(() => {
    if (typeof window === 'undefined') return [] as string[];
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key !== null) keys.push(key);
      }
      return keys;
    } catch {
      return [];
    }
  }, [refreshCount]);

  return (
    <Card
      className="fixed bottom-4 right-4 z-50 flex w-[30rem] max-w-[calc(100vw-2rem)] flex-col p-4 shadow-none bottom-safe-area"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--surface-background) 94%, transparent)',
        maxHeight: 'calc(100vh - 2rem)',
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name="bug" className="h-4 w-4 text-[var(--surface-foreground)]" />
          <h3 className="typography-ui-label font-semibold text-[var(--surface-foreground)]">Debug Panel</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="xs"
            variant="ghost"
            onClick={handleForceRefresh}
            aria-label="Force UI refresh"
            title="Force UI refresh"
          >
            <Icon name="refresh" className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={handleClear}
            aria-label="Clear log"
            title="Clear log"
          >
            <Icon name="delete-bin" className="h-3.5 w-3.5" />
          </Button>
          {onClose ? (
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose} aria-label="Close debug panel">
              <Icon name="close" className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <MetricCard label="Re-renders" value={refreshCount} />
        <MetricCard label="Viewport" value={`${viewport.width}×${viewport.height}`} />
        <MetricCard label="localStorage" value={`${localStorageSize} B`} />
      </div>

      <div className="mb-2 flex items-center gap-1 typography-meta">
        <span className="text-[var(--surface-muted-foreground)]">Filter:</span>
        {(['all', 'log', 'info', 'warn', 'error'] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setFilter(level)}
            className={`rounded px-1.5 py-0.5 text-[11px] transition-colors ${
              filter === level
                ? 'bg-[var(--interactive-selection)] text-[var(--surface-foreground)]'
                : 'text-[var(--surface-muted-foreground)] hover:bg-[var(--interactive-hover)]'
            }`}
          >
            {level}
          </button>
        ))}
        <span className="ml-auto text-[var(--surface-muted-foreground)]">
          {filteredLogs.length} / {logs.length}
        </span>
      </div>

      <div
        className="flex-1 overflow-hidden rounded-md border border-[var(--interactive-border)]"
        style={{ backgroundColor: 'color-mix(in srgb, var(--surface-elevated) 88%, transparent)', minHeight: '12rem', maxHeight: '20rem' }}
      >
        <ScrollableOverlay outerClassName="h-full" className="h-full pr-1">
          {filteredLogs.length === 0 ? (
            <div className="p-3 typography-meta text-[var(--surface-muted-foreground)]">
              {logs.length === 0
                ? 'No log entries. Try console.log("hello") or trigger an action.'
                : 'No entries match the current filter.'}
            </div>
          ) : (
            <div className="space-y-0.5 p-2">
              {filteredLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 font-mono text-[11px] leading-snug"
                >
                  <span className="shrink-0 text-[var(--surface-muted-foreground)] tabular-nums">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <span
                    className="shrink-0 font-semibold uppercase"
                    style={{ color: getLevelColor(entry.level), width: '3.25rem' }}
                  >
                    {entry.level}
                  </span>
                  <span
                    className="whitespace-pre-wrap break-all text-[var(--surface-foreground)]"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {entry.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollableOverlay>
      </div>

      {localStorageKeys.length > 0 ? (
        <details className="mt-3 typography-meta">
          <summary className="cursor-pointer text-[var(--surface-muted-foreground)] hover:text-[var(--surface-foreground)]">
            localStorage keys ({localStorageKeys.length})
          </summary>
          <div className="mt-1 max-h-24 overflow-y-auto rounded-md border border-[var(--interactive-border)] p-2 font-mono text-[11px] text-[var(--surface-muted-foreground)]">
            {localStorageKeys.map((key) => (
              <div key={key} className="break-all">
                {key}
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </Card>
  );
};

DebugPanel.displayName = 'DebugPanel';

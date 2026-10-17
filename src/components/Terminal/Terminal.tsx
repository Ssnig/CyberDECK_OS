import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCyberDeck } from '../../context/CyberDeckContext';
import { AsciiBanner } from './AsciiBanner';
import { OutputItem } from './OutputItem';
import { getNode, resolvePath } from '../../services/vfs';
import { soundEngine } from '../../services/audio';
import { Terminal as TermIcon, CornerDownLeft, Maximize2, Trash2 } from 'lucide-react';

const AVAILABLE_COMMANDS = [
  'help', 'ls', 'cd', 'pwd', 'cat', 'grep', 'chmod', 'ps', 'kill',
  'decode', 'submit', 'clear', 'cls', 'whoami', 'uname', 'date',
  'echo', 'history', 'theme', 'matrix', 'reset-rig'
];

export const Terminal: React.FC = () => {
  const { vfs, cwd, history, rawHistory, runCommand, clearHistory, settings } = useCyberDeck();
  const [inputVal, setInputVal] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input automatically on mount and whenever clicking in container
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Sound on keypress
    if (settings.soundEnabled && settings.keyClickEnabled && e.key !== 'Enter') {
      soundEngine.playKeyClick();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (!inputVal.trim()) return;
      runCommand(inputVal);
      setInputVal('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rawHistory.length === 0) return;

      const nextIndex = historyIndex === -1 ? rawHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(rawHistory[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const nextIndex = historyIndex + 1;
      if (nextIndex >= rawHistory.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(rawHistory[nextIndex] || '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    }
  };

  const handleTabCompletion = useCallback(() => {
    const trimmed = inputVal.trimStart();
    if (!trimmed) return;

    const parts = trimmed.split(' ');

    // Command auto-completion
    if (parts.length === 1) {
      const match = AVAILABLE_COMMANDS.filter((c) => c.startsWith(parts[0].toLowerCase()));
      if (match.length === 1) {
        setInputVal(match[0] + ' ');
      }
      return;
    }

    // Argument / File / Directory auto-completion
    const lastToken = parts[parts.length - 1];
    const currentNode = getNode(vfs, cwd);

    if (currentNode && currentNode.children) {
      const entries = Object.keys(currentNode.children);
      const matches = entries.filter((e) => e.startsWith(lastToken));

      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        const isDir = currentNode.children[matches[0]]?.type === 'dir';
        setInputVal(parts.join(' ') + (isDir ? '/' : ' '));
      }
    }
  }, [inputVal, vfs, cwd]);

  return (
    <div
      onClick={handleContainerClick}
      className="flex flex-col h-full bg-cyber-bg/95 border border-cyber-border rounded-lg shadow-glow-border overflow-hidden select-text cursor-text"
    >
      {/* Terminal Title Bar */}
      <div className="h-9 px-3 bg-cyber-card border-b border-cyber-border flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-danger/70 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-warning/70 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-success/70 inline-block"></span>
          </div>
          <div className="flex items-center space-x-1.5 pl-2 text-xs font-mono text-cyber-muted">
            <TermIcon className="w-3.5 h-3.5 text-cyber-primary" />
            <span className="text-cyber-text font-semibold">operator@cyberdeck:</span>
            <span className="text-cyber-accent">{cwd}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-cyber-muted">
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearHistory();
            }}
            title="Clear Terminal (clear)"
            className="p-1 hover:text-cyber-text hover:bg-cyber-primaryDim rounded transition-colors text-[11px] flex items-center space-x-1"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">CLS</span>
          </button>
        </div>
      </div>

      {/* Terminal Scrollable Output Area */}
      <div
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-xs text-cyber-text scroll-smooth"
      >
        <AsciiBanner />

        {/* History log entries */}
        {history.map((item) => (
          <OutputItem key={item.id} item={item} />
        ))}

        {/* Current Active Input Line */}
        <div className="flex items-center space-x-2 text-xs font-mono mt-2 pt-1">
          <span className="text-cyber-secondary font-semibold shrink-0">operator@cyberdeck</span>
          <span className="text-cyber-muted shrink-0">:</span>
          <span className="text-cyber-accent font-medium shrink-0">{cwd}</span>
          <span className="text-cyber-primary font-bold shrink-0 glow-text">$</span>

          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
              className="w-full bg-transparent border-none outline-none text-cyber-text font-mono text-xs pr-4 glow-text focus:ring-0"
              placeholder=""
            />
          </div>
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

import React from 'react';
import { CommandHistoryItem } from '../../types';
import { AlertCircle, CheckCircle, Terminal as TerminalIcon } from 'lucide-react';

export const OutputItem: React.FC<{ item: CommandHistoryItem }> = ({ item }) => {
  return (
    <div className="mb-3 font-mono text-xs">
      {/* Command Prompt Line */}
      <div className="flex items-center space-x-2 text-cyber-muted text-[11px] mb-1">
        <span className="text-cyber-secondary font-semibold">operator@cyberdeck</span>
        <span className="text-cyber-muted">:</span>
        <span className="text-cyber-accent font-medium">{item.cwd}</span>
        <span className="text-cyber-primary font-bold">$</span>
        <span className="text-cyber-text font-bold">{item.command}</span>
      </div>

      {/* Output Content */}
      {item.outputContent && (
        <div className="pl-3 border-l-2 border-cyber-border/40 py-1">
          {item.outputType === 'error' ? (
            <div className="flex items-start space-x-2 text-cyber-danger bg-cyber-danger/10 p-2 rounded border border-cyber-danger/30">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                {typeof item.outputContent === 'string' ? item.outputContent : ''}
              </pre>
            </div>
          ) : item.outputType === 'success' ? (
            <div className="text-cyber-success bg-cyber-success/10 p-2.5 rounded border border-cyber-success/30 glow-border">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold uppercase tracking-wider text-[11px]">Command Executed Successfully</span>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-cyber-text leading-relaxed">
                {typeof item.outputContent === 'string' ? item.outputContent : ''}
              </pre>
            </div>
          ) : item.outputType === 'help' ? (
            <div className="bg-cyber-card/60 p-2.5 rounded border border-cyber-border/60 text-cyber-text">
              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-cyber-text/90">
                {typeof item.outputContent === 'string' ? item.outputContent : ''}
              </pre>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-[11px] text-cyber-text/90 leading-relaxed overflow-x-auto">
              {typeof item.outputContent === 'string' ? item.outputContent : ''}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

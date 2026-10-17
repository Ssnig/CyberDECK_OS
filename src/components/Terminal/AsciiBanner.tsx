import React from 'react';

export const AsciiBanner: React.FC = () => {
  return (
    <div className="font-mono text-xs select-none mb-4 leading-tight">
      <pre className="text-cyber-primary glow-text text-[11px] sm:text-xs overflow-x-auto">
{`   ______      __              ____             __      ____  _____
  / ____/_  __/ /_  ___  _____/ __ \\___  _____/ /__   / __ \\/ ___/
 / /   / / / / __ \\/ _ \\/ ___/ / / / _ \\/ ___/ //_/  / / / /\\__ \\ 
/ /___/ /_/ / /_/ /  __/ /  / /_/ /  __/ /__/ ,<    / /_/ /___/ / 
\\____/\\__, /_.___/\\___/_/  /_____/\\___/\\___/_/|_|   \\____//____/  
     /____/                                                       `}
      </pre>
      <div className="mt-2 text-cyber-muted border-t border-b border-cyber-border/40 py-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px]">
        <span>KERNEL: 6.8.0-cyberdeck-pro (x86_64)</span>
        <span>SECURITY SUBSYSTEM: ACTIVE</span>
        <span className="text-cyber-accent">TYPE 'help' FOR OPERATIONS</span>
      </div>
      <p className="mt-2 text-cyber-text/80 text-[11px]">
        Welcome, Operator. Simulated sandbox terminal is ready. Execute commands below or track active objectives in <span className="text-cyber-primary font-bold">Mission Control</span>.
      </p>
    </div>
  );
};

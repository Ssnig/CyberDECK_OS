import React, { useState } from 'react';
import { useCyberDeck } from '../../context/CyberDeckContext';
import { ShieldAlert, CheckCircle2, Lock, ChevronDown, ChevronRight, Send, HelpCircle, Award } from 'lucide-react';

export const MissionControl: React.FC = () => {
  const { missions, submitFlagDirect } = useCyberDeck();
  const [flagInput, setFlagInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [expandedMission, setExpandedMission] = useState<number | null>(1);
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});

  const completedCount = missions.filter((m) => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / missions.length) * 100);

  const toggleMission = (id: number) => {
    setExpandedMission(expandedMission === id ? null : id);
  };

  const toggleHint = (missionId: number, hintIdx: number) => {
    const key = `${missionId}-${hintIdx}`;
    setExpandedHints((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;

    const res = submitFlagDirect(flagInput);
    setFeedback(res);
    if (res.success) {
      setFlagInput('');
      // Automatically expand next active mission
      const nextIncomplete = missions.find((m) => !m.isCompleted);
      if (nextIncomplete) {
        setExpandedMission(nextIncomplete.id);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-bg/95 border border-cyber-border rounded-lg shadow-glow-border overflow-hidden font-mono text-xs select-none">
      {/* Panel Header */}
      <div className="h-9 px-3 bg-cyber-card border-b border-cyber-border flex items-center justify-between">
        <div className="flex items-center space-x-2 text-cyber-primary">
          <ShieldAlert className="w-4 h-4 text-cyber-primary animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-[11px] glow-text">
            Mission Control // CTF Operations
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-cyber-muted font-semibold">
          <span>{completedCount}/{missions.length} SOLVED</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="px-3 pt-2.5 pb-2 border-b border-cyber-border/40 bg-cyber-card/40">
        <div className="flex justify-between text-[10px] text-cyber-muted mb-1 font-semibold">
          <span>PROGRESSION STATUS</span>
          <span className="text-cyber-primary">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-cyber-card border border-cyber-border rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyber-secondary via-cyber-primary to-cyber-accent rounded-full transition-all duration-500 ease-out glow-border"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Missions Accordion List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {missions.map((mission) => {
          const isOpen = expandedMission === mission.id;

          return (
            <div
              key={mission.id}
              className={`border rounded transition-all duration-200 ${
                mission.isCompleted
                  ? 'border-cyber-success/50 bg-cyber-success/5'
                  : mission.isUnlocked
                  ? 'border-cyber-primary/60 bg-cyber-primaryDim/20 glow-border'
                  : 'border-cyber-border/40 bg-cyber-card/30 opacity-60'
              }`}
            >
              {/* Mission Card Header */}
              <button
                onClick={() => mission.isUnlocked && toggleMission(mission.id)}
                disabled={!mission.isUnlocked}
                className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-cyber-primaryDim/30 transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  {mission.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-cyber-success shrink-0" />
                  ) : mission.isUnlocked ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-primary shrink-0 animate-ping inline-block" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-cyber-muted shrink-0" />
                  )}

                  <span className="text-[10px] font-bold text-cyber-muted uppercase shrink-0">
                    [{mission.code}]
                  </span>
                  <span className="font-semibold text-cyber-text text-[11px] truncate">
                    {mission.title}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {mission.isCompleted ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-success/20 text-cyber-success border border-cyber-success/40 font-bold">
                      CLEARED
                    </span>
                  ) : mission.isUnlocked ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/40 font-bold animate-pulse">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-muted/20 text-cyber-muted border border-cyber-muted/40">
                      LOCKED
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-cyber-muted" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-cyber-muted" />
                  )}
                </div>
              </button>

              {/* Expanded Mission Content */}
              {isOpen && (
                <div className="px-3 pb-3 pt-1 border-t border-cyber-border/40 space-y-2 select-text">
                  <p className="text-[11px] text-cyber-text/90 leading-relaxed">
                    {mission.description}
                  </p>

                  <div className="p-2 rounded bg-black/40 border border-cyber-border/60">
                    <div className="text-[10px] text-cyber-accent font-bold uppercase mb-1">
                      Objective:
                    </div>
                    <div className="text-[11px] text-cyber-text">
                      {mission.objective}
                    </div>
                  </div>

                  {/* Expandable Hints */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] text-cyber-muted uppercase font-bold flex items-center space-x-1">
                      <HelpCircle className="w-3 h-3 text-cyber-warning" />
                      <span>Declassified Intel Hints:</span>
                    </div>

                    {mission.hints.map((hint, hIdx) => {
                      const hintKey = `${mission.id}-${hIdx}`;
                      const isHintOpen = !!expandedHints[hintKey];

                      return (
                        <div key={hIdx} className="border border-cyber-border/40 rounded bg-black/30">
                          <button
                            onClick={() => toggleHint(mission.id, hIdx)}
                            className="w-full px-2 py-1 text-left flex items-center justify-between text-[10px] text-cyber-muted hover:text-cyber-text"
                          >
                            <span>Intel #{hIdx + 1}</span>
                            <span>{isHintOpen ? '[-] HIDE' : '[+] DECRYPT'}</span>
                          </button>
                          {isHintOpen && (
                            <div className="px-2 py-1.5 border-t border-cyber-border/40 text-[10px] text-cyber-warning font-mono bg-cyber-warning/5">
                              {hint}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {mission.isCompleted && (
                    <div className="p-2 rounded bg-cyber-success/15 border border-cyber-success/40 text-cyber-success text-[10px] flex items-center justify-between font-bold">
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>CAPTURED FLAG:</span>
                      </div>
                      <span className="font-mono text-[11px] text-cyber-text bg-black/60 px-2 py-0.5 rounded border border-cyber-success/40">
                        {mission.flag}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flag Submission Footer */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-cyber-card border-t border-cyber-border space-y-1.5">
        <div className="flex items-center space-x-1.5">
          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            placeholder="submit FLAG{...}"
            className="flex-1 bg-black/60 border border-cyber-border rounded px-2.5 py-1 text-xs text-cyber-text font-mono placeholder-cyber-muted focus:outline-none focus:border-cyber-primary"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-cyber-primary text-black font-bold text-xs rounded hover:bg-cyber-accent transition-colors flex items-center space-x-1"
          >
            <Send className="w-3 h-3" />
            <span>SUBMIT</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`text-[10px] px-2 py-1 rounded border font-mono ${
              feedback.success
                ? 'bg-cyber-success/15 text-cyber-success border-cyber-success/40'
                : 'bg-cyber-danger/15 text-cyber-danger border-cyber-danger/40'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
};

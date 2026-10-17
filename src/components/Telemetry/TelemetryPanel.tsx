import React, { useRef, useEffect } from 'react';
import { useCyberDeck } from '../../context/CyberDeckContext';
import { Activity, Cpu, HardDrive, Wifi, AlertTriangle } from 'lucide-react';

export const TelemetryPanel: React.FC = () => {
  const { telemetry, processes } = useCyberDeck();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // History buffers for waveforms
  const historyRef = useRef<{
    cpu: number[];
    mem: number[];
    net: number[];
  }>({
    cpu: new Array(60).fill(15),
    mem: new Array(60).fill(25),
    net: new Array(60).fill(10),
  });

  const hasRogue = processes.some((p) => p.isRogue || p.command.includes('xmrig'));

  // Push new telemetry points
  useEffect(() => {
    historyRef.current.cpu.push(telemetry.cpu);
    historyRef.current.cpu.shift();

    historyRef.current.mem.push(telemetry.memory);
    historyRef.current.mem.shift();

    historyRef.current.net.push(telemetry.network);
    historyRef.current.net.shift();
  }, [telemetry]);

  // 60 FPS Render loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;

    const render = () => {
      offset = (offset + 0.5) % 20;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw oscilloscope grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      // Vertical lines moving
      for (let x = -offset; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw helper function for sparkline wave
      const drawWave = (data: number[], strokeStyle: string, fillStyle?: string) => {
        if (data.length < 2) return;
        ctx.beginPath();
        const step = width / (data.length - 1);

        data.forEach((val, i) => {
          // Normalize 0-100 to canvas height (inverted)
          const y = height - (val / 100) * (height - 8) - 4;
          const x = i * step;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });

        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        if (fillStyle) {
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          ctx.fillStyle = fillStyle;
          ctx.fill();
        }
      };

      // Draw Network Wave (cyan/blue)
      drawWave(historyRef.current.net, 'rgba(56, 189, 248, 0.7)');

      // Draw Memory Wave (amber/purple)
      drawWave(historyRef.current.mem, 'rgba(234, 179, 8, 0.7)');

      // Draw CPU Wave (primary green or danger red if rogue miner)
      if (hasRogue) {
        drawWave(historyRef.current.cpu, 'rgba(244, 63, 94, 0.95)', 'rgba(244, 63, 94, 0.15)');
      } else {
        drawWave(historyRef.current.cpu, 'rgba(0, 255, 102, 0.9)', 'rgba(0, 255, 102, 0.12)');
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [hasRogue]);

  return (
    <div className="flex flex-col font-mono text-xs select-none">
      {/* Metric badges */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* CPU */}
        <div
          className={`p-2 rounded border transition-colors ${
            hasRogue
              ? 'bg-cyber-danger/10 border-cyber-danger/50 text-cyber-danger'
              : 'bg-black/40 border-cyber-border text-cyber-text'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-cyber-muted mb-0.5">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-cyber-primary" />
              <span>CORE LOAD</span>
            </span>
            {hasRogue && (
              <span className="text-[9px] px-1 bg-cyber-danger text-white rounded font-bold animate-pulse">
                SPIKE
              </span>
            )}
          </div>
          <div className="text-sm font-bold tracking-wider">
            {telemetry.cpu.toFixed(1)}%
          </div>
        </div>

        {/* MEMORY */}
        <div className="p-2 rounded border bg-black/40 border-cyber-border text-cyber-text">
          <div className="flex items-center justify-between text-[10px] text-cyber-muted mb-0.5">
            <span className="flex items-center space-x-1">
              <HardDrive className="w-3 h-3 text-cyber-secondary" />
              <span>RAM ALLOC</span>
            </span>
          </div>
          <div className="text-sm font-bold tracking-wider text-cyber-secondary">
            {telemetry.memory.toFixed(1)}%
          </div>
        </div>

        {/* NETWORK I/O */}
        <div className="p-2 rounded border bg-black/40 border-cyber-border text-cyber-text">
          <div className="flex items-center justify-between text-[10px] text-cyber-muted mb-0.5">
            <span className="flex items-center space-x-1">
              <Wifi className="w-3 h-3 text-cyber-accent" />
              <span>PACKET I/O</span>
            </span>
          </div>
          <div className="text-sm font-bold tracking-wider text-cyber-accent">
            {telemetry.network.toFixed(0)} <span className="text-[10px]">KB/s</span>
          </div>
        </div>
      </div>

      {/* Canvas Oscilloscope */}
      <div className="relative h-24 w-full bg-black/80 rounded border border-cyber-border/70 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={360}
          height={96}
          className="w-full h-full block"
        />
        <div className="absolute top-1 left-2 flex items-center space-x-2 text-[9px] text-cyber-muted">
          <span className="flex items-center space-x-1">
            <span className={`w-1.5 h-1.5 rounded-full ${hasRogue ? 'bg-cyber-danger' : 'bg-cyber-primary'}`} />
            <span>CPU</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span>RAM</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>NET</span>
          </span>
        </div>

        {hasRogue && (
          <div className="absolute bottom-1 right-2 flex items-center space-x-1 text-[9px] text-cyber-danger bg-cyber-danger/20 px-1.5 py-0.5 rounded border border-cyber-danger/40 animate-pulse font-bold">
            <AlertTriangle className="w-3 h-3" />
            <span>ANOMALY IN RUNNING PROCESS TABLE</span>
          </div>
        )}
      </div>
    </div>
  );
};

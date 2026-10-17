// Web Audio API Retro Sound Synthesizer

class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private humGain: GainNode | null = null;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private isMuted: boolean = false;
  private ambientActive: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.humGain) {
      this.humGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    } else if (!muted && this.ambientActive && this.humGain && this.ctx) {
      this.humGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    }
  }

  // Realistic mechanical keyboard click
  public playKeyClick(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Noise component for mechanical switch click
      const bufferSize = ctx.sampleRate * 0.018; // ~18ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 400, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // Subtle mechanical thud
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(140 + Math.random() * 20, now);
      thud.frequency.exponentialRampToValueAtTime(45, now + 0.025);

      thudGain.gain.setValueAtTime(0.06, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      thud.connect(thudGain);
      thudGain.connect(ctx.destination);

      thud.start(now);
      thud.stop(now + 0.025);
    } catch {
      // AudioContext fallback
    }
  }

  // Carriage Return / Enter key press
  public playEnterKey(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // Triumphant 8-bit CTF mission complete fanfare
  public playFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio: C5 (523), E5 (659), G5 (784), C6 (1046), E6 (1318), G6 (1568)
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      const stepTime = 0.09;

      notes.forEach((freq, idx) => {
        const startTime = now + idx * stepTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === notes.length - 1 ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        const duration = idx === notes.length - 1 ? 0.45 : 0.12;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {}
  }

  // Negative buzzer on error/invalid command
  public playError(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(85, now + 0.15);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // Power-down pitch drop when killing rogue process
  public playProcessTerminated(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Soft ambient 60Hz CRT power hum
  public toggleAmbientHum(enable: boolean): void {
    this.ambientActive = enable;
    const ctx = this.getContext();
    if (!ctx) return;

    if (!enable) {
      if (this.humGain) {
        this.humGain.gain.setValueAtTime(0, ctx.currentTime);
      }
      return;
    }

    if (this.isMuted) return;

    try {
      if (!this.humGain) {
        this.humGain = ctx.createGain();
        this.humGain.gain.setValueAtTime(0.012, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(240, ctx.currentTime);

        this.humOsc1 = ctx.createOscillator();
        this.humOsc1.type = 'sine';
        this.humOsc1.frequency.setValueAtTime(60, ctx.currentTime);

        this.humOsc2 = ctx.createOscillator();
        this.humOsc2.type = 'sine';
        this.humOsc2.frequency.setValueAtTime(120, ctx.currentTime);

        this.humOsc1.connect(filter);
        this.humOsc2.connect(filter);
        filter.connect(this.humGain);
        this.humGain.connect(ctx.destination);

        this.humOsc1.start();
        this.humOsc2.start();
      } else {
        this.humGain.gain.setValueAtTime(0.012, ctx.currentTime);
      }
    } catch {}
  }
}

export const soundEngine = new RetroSoundEngine();

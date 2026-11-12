// Web Audio API sound generator for Anti-Theft Security Sounds

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenInterval: any = null;
  private isSirenPlaying = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Camera shutter sound
  playShutterSound() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Keypad click
  playKeypadClick() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch (e) {
      // Audio might be blocked until user gesture
    }
  }

  // Wrong PIN error buzz
  playErrorBuzz() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(130, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {
      // ignore
    }
  }

  // Unlock success chime
  playUnlockChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.22);
      });
    } catch (e) {
      // ignore
    }
  }

  // Loud Emergency Police / Security Siren
  startAlarmSiren(volume = 0.8) {
    if (this.isSirenPlaying) return;
    try {
      const ctx = this.getContext();
      this.isSirenPlaying = true;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(volume, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      this.sirenOsc = osc;
      this.sirenGain = gain;

      let high = false;
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.start();

      this.sirenInterval = setInterval(() => {
        if (!this.ctx || !this.sirenOsc) return;
        const targetFreq = high ? 650 : 1300;
        this.sirenOsc.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.35);
        high = !high;
      }, 400);
    } catch (e) {
      console.warn('Siren start error:', e);
    }
  }

  stopAlarmSiren() {
    if (!this.isSirenPlaying) return;
    try {
      if (this.sirenInterval) {
        clearInterval(this.sirenInterval);
        this.sirenInterval = null;
      }
      if (this.sirenGain && this.ctx) {
        this.sirenGain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      }
      setTimeout(() => {
        if (this.sirenOsc) {
          try {
            this.sirenOsc.stop();
            this.sirenOsc.disconnect();
          } catch {}
          this.sirenOsc = null;
        }
        this.isSirenPlaying = false;
      }, 120);
    } catch (e) {
      this.isSirenPlaying = false;
    }
  }

  isSirenActive(): boolean {
    return this.isSirenPlaying;
  }
}

export const sound = new SoundEngine();

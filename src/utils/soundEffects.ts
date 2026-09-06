// Web Audio API and Speech Synthesis engine for Transit and Campus Navigation
// Pure browser-native, zero external asset dependencies, zero network latency

class TransitSoundEngine {
  private audioCtx: AudioContext | null = null;
  private isSoundEnabled: boolean = true;
  private isVoiceEnabled: boolean = true;
  private lastAnnouncedStop: string | null = null;
  private lastAnnounceTime: number = 0;

  constructor() {
    // Try to load saved preferences from localStorage
    try {
      const savedSound = localStorage.getItem('transit_sound_enabled');
      if (savedSound !== null) this.isSoundEnabled = savedSound === 'true';

      const savedVoice = localStorage.getItem('transit_voice_enabled');
      if (savedVoice !== null) this.isVoiceEnabled = savedVoice === 'true';
    } catch {
      // localStorage may be unavailable
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
    try {
      localStorage.setItem('transit_sound_enabled', String(enabled));
    } catch {}
  }

  public getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
    try {
      localStorage.setItem('transit_voice_enabled', String(enabled));
    } catch {}
  }

  public getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  /**
   * Plays a customizable synthesized chime
   */
  public playTone(freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', peakGain: number = 0.25) {
    if (!this.isSoundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(peakGain, ctx.currentTime + startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration + 0.05);
    } catch {
      // AudioContext could be blocked by autoplay policies
    }
  }

  /**
   * Sound when arriving at regular highway/campus stop
   */
  public playStopArrival(
    stopName: string,
    vehicle: 'bike' | 'car' = 'car',
    isDestination: boolean = false,
    bypassDebounce: boolean = false
  ) {
    if (!this.isSoundEnabled) return;

    // Prevent spamming the same stop within 2.5 seconds (unless manual click)
    if (!bypassDebounce) {
      const now = Date.now();
      if (this.lastAnnouncedStop === stopName && now - this.lastAnnounceTime < 2500) {
        return;
      }
      this.lastAnnouncedStop = stopName;
      this.lastAnnounceTime = now;
    }

    if (isDestination) {
      this.playDestinationArrival(stopName);
      return;
    }

    if (vehicle === 'bike') {
      // Bike bicycle bell double ding
      this.playTone(1760, 0.0, 0.12, 'sine', 0.22); // A6
      this.playTone(2093, 0.14, 0.2, 'sine', 0.25); // C7
    } else {
      // Car / Transit chime: 2-tone melodic harmonic chime
      this.playTone(523.25, 0.0, 0.22, 'sine', 0.25); // C5
      this.playTone(659.25, 0.12, 0.22, 'sine', 0.22); // E5
      this.playTone(783.99, 0.24, 0.35, 'sine', 0.28); // G5
    }

    // Voice announcement
    if (this.isVoiceEnabled) {
      const cleanName = stopName.replace(/\(.*?\)/g, '').replace(/[^\w\s&]/gi, '').trim();
      this.speak(`Arrived at ${cleanName}`);
    }
  }

  /**
   * Toll Plaza FASTag processing beep
   */
  public playTollPlazaBeep() {
    if (!this.isSoundEnabled) return;
    this.playTone(1200, 0.0, 0.08, 'sine', 0.3);
    this.playTone(1600, 0.09, 0.15, 'sine', 0.35);

    if (this.isVoiceEnabled) {
      this.speak('Irungattukottai Toll Plaza FASTag pass');
    }
  }

  /**
   * Grand arrival at Saveetha Medical College or Final Destination
   */
  public playDestinationArrival(destinationName: string) {
    if (!this.isSoundEnabled) return;

    // 4-note ascending fanfare
    this.playTone(523.25, 0.0, 0.25, 'triangle', 0.28); // C5
    this.playTone(659.25, 0.15, 0.25, 'triangle', 0.28); // E5
    this.playTone(783.99, 0.30, 0.30, 'triangle', 0.32); // G5
    this.playTone(1046.5, 0.48, 0.65, 'sine', 0.38); // C6

    if (this.isVoiceEnabled) {
      const cleanName = destinationName.replace(/\(.*?\)/g, '').replace(/[^\w\s&]/gi, '').trim();
      this.speak(`You have reached your destination: ${cleanName}`);
    }
  }

  /**
   * Soft button click feedback
   */
  public playClick() {
    if (!this.isSoundEnabled) return;
    this.playTone(800, 0.0, 0.04, 'sine', 0.15);
  }

  /**
   * Text-to-speech announcement
   */
  public speak(text: string) {
    if (!this.isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterances
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error
    }
  }
}

export const transitSound = new TransitSoundEngine();

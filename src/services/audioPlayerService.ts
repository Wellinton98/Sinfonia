import { EqualizerBands, Track } from '../types/music';
import { generateMusicalTrackWav } from './audioSynthesizer';
import { dbService } from './indexedDbService';

export class AudioPlayerService {
  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private eqFilters: {
    bass?: BiquadFilterNode;
    lowMid?: BiquadFilterNode;
    mid?: BiquadFilterNode;
    highMid?: BiquadFilterNode;
    treble?: BiquadFilterNode;
  } = {};

  private currentBlobUrl: string | null = null;
  private isGenerating = false;
  private sleepTimerTimeoutId: any = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
  }

  private initAudioNodes() {
    if (this.audioCtx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);

      // Create 5-band EQ
      const bass = this.audioCtx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 60;

      const lowMid = this.audioCtx.createBiquadFilter();
      lowMid.type = 'peaking';
      lowMid.frequency.value = 250;
      lowMid.Q.value = 1.0;

      const mid = this.audioCtx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 1.0;

      const highMid = this.audioCtx.createBiquadFilter();
      highMid.type = 'peaking';
      highMid.frequency.value = 4000;
      highMid.Q.value = 1.0;

      const treble = this.audioCtx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 12000;

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Connect graph: Source -> Bass -> LowMid -> Mid -> HighMid -> Treble -> Analyser -> Destination
      this.sourceNode.connect(bass);
      bass.connect(lowMid);
      lowMid.connect(mid);
      mid.connect(highMid);
      highMid.connect(treble);
      treble.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);

      this.eqFilters = { bass, lowMid, mid, highMid, treble };
    } catch (err) {
      console.warn('Web Audio Context initialization warning (may activate on user gesture):', err);
    }
  }

  async resumeContext() {
    this.initAudioNodes();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  async loadTrack(track: Track): Promise<string> {
    await this.resumeContext();

    // Check if we have an offline cached blob in IndexedDB
    let blob = await dbService.getAudioBlob(track.id);

    if (!blob) {
      if (track.synthPreset) {
        this.isGenerating = true;
        try {
          blob = await generateMusicalTrackWav(track.synthPreset, track.duration || 65);
          // Save in IndexedDB so it's instantly available offline forever!
          await dbService.saveAudioBlob(track.id, blob);
        } finally {
          this.isGenerating = false;
        }
      }
    }

    if (blob) {
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }
      this.currentBlobUrl = URL.createObjectURL(blob);
      this.audio.src = this.currentBlobUrl;
      return this.currentBlobUrl;
    }

    return '';
  }

  async play() {
    await this.resumeContext();
    return this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  seek(seconds: number) {
    if (isFinite(seconds) && seconds >= 0) {
      this.audio.currentTime = seconds;
    }
  }

  setVolume(vol: number) {
    this.audio.volume = Math.max(0, Math.min(1, vol));
  }

  getVolume(): number {
    return this.audio.volume;
  }

  getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }

  isPaused(): boolean {
    return this.audio.paused;
  }

  setEqualizer(bands: EqualizerBands) {
    if (!this.eqFilters.bass) return;
    this.eqFilters.bass.gain.value = bands.bass;
    if (this.eqFilters.lowMid) this.eqFilters.lowMid.gain.value = bands.lowMid;
    if (this.eqFilters.mid) this.eqFilters.mid.gain.value = bands.mid;
    if (this.eqFilters.highMid) this.eqFilters.highMid.gain.value = bands.highMid;
    if (this.eqFilters.treble) this.eqFilters.treble.gain.value = bands.treble;
  }

  getFrequencyData(array: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(array as any);
    }
  }

  onTimeUpdate(handler: () => void) {
    this.audio.addEventListener('timeupdate', handler);
  }

  removeTimeUpdate(handler: () => void) {
    this.audio.removeEventListener('timeupdate', handler);
  }

  onEnded(handler: () => void) {
    this.audio.addEventListener('ended', handler);
  }

  onPlay(handler: () => void) {
    this.audio.addEventListener('play', handler);
  }

  onPause(handler: () => void) {
    this.audio.addEventListener('pause', handler);
  }

  setSleepTimer(minutes: number, onTrigger: () => void): void {
    this.clearSleepTimer();
    if (minutes <= 0) return;
    this.sleepTimerTimeoutId = setTimeout(() => {
      this.pause();
      onTrigger();
    }, minutes * 60 * 1000);
  }

  clearSleepTimer() {
    if (this.sleepTimerTimeoutId) {
      clearTimeout(this.sleepTimerTimeoutId);
      this.sleepTimerTimeoutId = null;
    }
  }

  getIsGenerating(): boolean {
    return this.isGenerating;
  }
}

export const audioPlayer = new AudioPlayerService();

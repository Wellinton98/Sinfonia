export interface LyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  genre: string;
  year: number;
  lyricsLRC: string;
  colorAccent: string;
  plays: number;
  isFavorite: boolean;
  synthPreset?: 'lofi' | 'synthwave' | 'bossa' | 'acoustic' | 'ambient';
  audioBlobUrl?: string;
  isOfflineAvailable?: boolean;
  fileSizeMB?: number;
  isLocalImport?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  gradient: string;
  trackIds: string[];
  createdAt: string;
  isSmart?: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type EqualizerPreset = 'flat' | 'bass-boost' | 'vocal' | 'acoustic' | 'night-soft';

export interface EqualizerBands {
  bass: number; // 60Hz (-12dB to +12dB)
  lowMid: number; // 250Hz
  mid: number; // 1kHz
  highMid: number; // 4kHz
  treble: number; // 12kHz
}

export type ActiveTab = 'home' | 'library' | 'playlists' | 'offline' | 'lyrics';

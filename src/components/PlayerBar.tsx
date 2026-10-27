import React, { useState } from 'react';
import {
  Download,
  Heart,
  ListMusic,
  Maximize2,
  Mic2,
  Moon,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';
import { RepeatMode, Track } from '../types/music';
import { VisualizerCanvas } from './VisualizerCanvas';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isOffline: boolean;
  sleepTimerRemaining: number | null; // in minutes
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: (trackId: string) => void;
  onOpenLyrics: () => void;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
  onOpenQueue: () => void;
  onOpenAddToPlaylist: (track: Track) => void;
  onDownloadOffline: (track: Track) => void;
  isDark: boolean;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffled,
  isOffline,
  sleepTimerRemaining,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onToggleFavorite,
  onOpenLyrics,
  onOpenEqualizer,
  onOpenSleepTimer,
  onOpenQueue,
  onOpenAddToPlaylist,
  onDownloadOffline,
  isDark,
}) => {
  const [isHoveringSlider, setIsHoveringSlider] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-colors border-t backdrop-blur-xl ${
        isDark
          ? 'bg-zinc-950/95 border-zinc-800/90 text-zinc-100 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]'
          : 'bg-white/95 border-stone-200/90 text-stone-900 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-22 flex items-center justify-between gap-4">
        {/* Left: Track Info & Quick Actions */}
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          {currentTrack ? (
            <>
              <div className="relative group shrink-0">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.album}
                  className="w-12 h-12 rounded-lg object-cover shadow-md transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={onOpenLyrics}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity text-white"
                  title="Ver letra em tempo real"
                >
                  <Mic2 className="w-4 h-4" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate hover:underline cursor-pointer" onClick={onOpenLyrics}>
                    {currentTrack.title}
                  </span>
                  {isOffline && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-emerald-500/15 text-emerald-400 shrink-0 border border-emerald-500/20"
                      title="Disponível offline sem internet"
                    >
                      OFFLINE
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                  {currentTrack.artist}
                </p>
              </div>

              {/* Heart Favorite & Playlist Button */}
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onToggleFavorite(currentTrack.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentTrack.isFavorite
                      ? 'text-rose-500'
                      : isDark
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                  title={currentTrack.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
                >
                  <Heart className={`w-4 h-4 ${currentTrack.isFavorite ? 'fill-rose-500' : ''}`} />
                </button>

                <button
                  onClick={() => onOpenAddToPlaylist(currentTrack)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-stone-400 hover:text-stone-700'
                  }`}
                  title="Adicionar à playlist"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {!isOffline && (
                  <button
                    onClick={() => onDownloadOffline(currentTrack)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'text-zinc-400 hover:text-indigo-400' : 'text-stone-400 hover:text-indigo-600'
                    }`}
                    title="Baixar para ouvir offline"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
              Nenhuma música selecionada
            </div>
          )}
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center max-w-xl w-full sm:w-2/4">
          <div className="flex items-center gap-3 sm:gap-4 mb-1">
            {/* Shuffle */}
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 rounded-md transition-colors ${
                isShuffled
                  ? 'text-indigo-500'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title={isShuffled ? 'Modo aleatório: Ligado' : 'Modo aleatório: Desligado'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              onClick={onPrevious}
              disabled={!currentTrack}
              className={`p-1.5 rounded-md transition-colors disabled:opacity-30 ${
                isDark ? 'text-zinc-300 hover:text-white' : 'text-stone-700 hover:text-stone-900'
              }`}
              title="Faixa anterior"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Play / Pause button */}
            <button
              onClick={onTogglePlay}
              disabled={!currentTrack}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 transition-transform active:scale-95 disabled:opacity-40"
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              disabled={!currentTrack}
              className={`p-1.5 rounded-md transition-colors disabled:opacity-30 ${
                isDark ? 'text-zinc-300 hover:text-white' : 'text-stone-700 hover:text-stone-900'
              }`}
              title="Próxima faixa"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Repeat */}
            <button
              onClick={onToggleRepeat}
              className={`p-1.5 rounded-md transition-colors relative ${
                repeatMode !== 'off'
                  ? 'text-indigo-500'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title={`Repetir: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Time slider */}
          <div
            className="w-full flex items-center gap-2 text-xs font-mono tabular-nums select-none"
            onMouseEnter={() => setIsHoveringSlider(true)}
            onMouseLeave={() => setIsHoveringSlider(false)}
          >
            <span className={`w-10 text-right ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 py-1.5 cursor-pointer flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime || 0}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1 bg-transparent appearance-none cursor-pointer accent-indigo-500 z-10"
              />
              {/* Custom Track Background */}
              <div
                className={`absolute inset-x-0 h-1 rounded-full ${
                  isDark ? 'bg-zinc-800' : 'bg-stone-200'
                }`}
              >
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <span className={`w-10 text-left ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Tools & Volume */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/4">
          {/* Visualizer canvas */}
          <div className="hidden xl:block">
            <VisualizerCanvas isPlaying={isPlaying} isDark={isDark} />
          </div>

          {/* Real-time Lyrics Button */}
          <button
            onClick={onOpenLyrics}
            className={`p-2 rounded-lg transition-all relative flex items-center gap-1 text-xs font-semibold ${
              isDark
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                : 'bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-200'
            }`}
            title="Letras em tempo real sincronizadas"
          >
            <Mic2 className="w-4 h-4 text-indigo-500" />
            <span className="hidden lg:inline">Letras</span>
          </button>

          {/* Equalizer */}
          <button
            onClick={onOpenEqualizer}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Equalizador de Áudio"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Sleep Timer */}
          <button
            onClick={onOpenSleepTimer}
            className={`p-2 rounded-lg transition-colors relative ${
              sleepTimerRemaining
                ? 'text-indigo-400 font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title={sleepTimerRemaining ? `Temporizador ativo: ${sleepTimerRemaining}m` : 'Temporizador de sono'}
          >
            <Moon className="w-4 h-4" />
            {sleepTimerRemaining && (
              <span className="absolute -top-1 -right-1 text-[9px] font-mono bg-indigo-600 text-white px-1 rounded-full">
                {sleepTimerRemaining}m
              </span>
            )}
          </button>

          {/* Queue Drawer */}
          <button
            onClick={onOpenQueue}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Fila de reprodução"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded transition-colors ${
                isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-stone-500 hover:text-stone-800'
              }`}
              title={isMuted ? 'Desmutar' : 'Mutar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

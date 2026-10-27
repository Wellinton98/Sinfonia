import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock,
  Edit3,
  Maximize2,
  Minimize2,
  Music2,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  X
} from 'lucide-react';
import { Track } from '../types/music';
import { findActiveLyricIndex, parseLRC } from '../services/lyricsParser';

interface LyricsViewProps {
  currentTrack: Track | null;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  onUpdateLyrics?: (trackId: string, newLrc: string) => void;
  onClose?: () => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  isDark: boolean;
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  currentTrack,
  currentTime,
  isPlaying,
  onSeek,
  onUpdateLyrics,
  onClose,
  isFullScreen = false,
  onToggleFullScreen,
  isDark,
}) => {
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedLrc, setEditedLrc] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const linesContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Parse current track lyrics
  const lyrics = useMemo(() => {
    if (!currentTrack?.lyricsLRC) return [];
    return parseLRC(currentTrack.lyricsLRC);
  }, [currentTrack?.lyricsLRC]);

  // Find active line with offset applied
  const effectiveTime = Math.max(0, currentTime + timeOffset);
  const activeIndex = useMemo(() => {
    return findActiveLyricIndex(lyrics, effectiveTime);
  }, [lyrics, effectiveTime]);

  // Auto-scroll when active line changes
  useEffect(() => {
    if (!autoScroll || !activeLineRef.current || !linesContainerRef.current) return;

    activeLineRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [activeIndex, autoScroll]);

  const handleStartEdit = () => {
    setEditedLrc(currentTrack?.lyricsLRC || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (currentTrack && onUpdateLyrics) {
      onUpdateLyrics(currentTrack.id, editedLrc);
    }
    setIsEditing(false);
  };

  if (!currentTrack) {
    return (
      <div className={`p-8 text-center flex flex-col items-center justify-center min-h-[300px] ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
        <Music2 className="w-12 h-12 mb-3 opacity-40 animate-pulse" />
        <p className="text-base font-medium">Nenhuma música em reprodução</p>
        <p className="text-xs mt-1 opacity-75">Selecione uma faixa para acompanhar a letra em tempo real.</p>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-zinc-900/90 text-zinc-100 border border-zinc-800' : 'bg-white/95 text-stone-900 border border-stone-200 shadow-xl'
      }`}
    >
      {/* Ambient background blur using album artwork */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none blur-3xl scale-125"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />

      {/* Top Header */}
      <div className={`relative z-10 flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-zinc-800/80' : 'border-stone-100'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.album}
            className="w-11 h-11 rounded-lg object-cover shadow-sm shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="truncate">
            <h3 className="text-sm font-semibold truncate leading-tight">{currentTrack.title}</h3>
            <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              {currentTrack.artist} · {currentTrack.album}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Real-time sync offset calibrator */}
          <div
            className={`flex items-center text-xs px-2.5 py-1 rounded-lg border ${
              isDark ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300' : 'bg-stone-100 border-stone-200 text-stone-700'
            }`}
            title="Ajuste fino de sincronia de tempo (+/- segundos)"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5 opacity-60" />
            <span className="font-mono tabular-nums mr-2">
              {timeOffset === 0 ? '0.0s' : `${timeOffset > 0 ? '+' : ''}${timeOffset.toFixed(1)}s`}
            </span>
            <button
              onClick={() => setTimeOffset((prev) => Math.round((prev - 0.5) * 10) / 10)}
              className="px-1.5 py-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded text-xs font-semibold"
              title="Atrasar letra em 0.5s"
            >
              -0.5
            </button>
            <button
              onClick={() => setTimeOffset((prev) => Math.round((prev + 0.5) * 10) / 10)}
              className="px-1.5 py-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded text-xs font-semibold ml-0.5"
              title="Adiantar letra em 0.5s"
            >
              +0.5
            </button>
            {timeOffset !== 0 && (
              <button
                onClick={() => setTimeOffset(0)}
                className="ml-1 p-0.5 hover:text-indigo-400"
                title="Resetar offset de sincronia"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Edit lyrics toggle */}
          <button
            onClick={() => (isEditing ? handleSaveEdit() : handleStartEdit())}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              isEditing
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
            title={isEditing ? 'Salvar letra' : 'Editar / Sincronizar letra'}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
              title={isFullScreen ? 'Sair de tela cheia' : 'Tela cheia'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* Close button if provided */}
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isEditing ? (
        <div className="relative z-10 flex-1 flex flex-col p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-indigo-400">
              Editor de Letras no Formato LRC
            </span>
            <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              Padrão [mm:ss.xx] Linha de texto
            </span>
          </div>
          <textarea
            value={editedLrc}
            onChange={(e) => setEditedLrc(e.target.value)}
            className={`w-full flex-1 p-4 rounded-xl font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${
              isDark ? 'bg-zinc-950/80 border-zinc-700 text-zinc-200' : 'bg-stone-50 border-stone-300 text-stone-800'
            }`}
            rows={14}
            placeholder="[00:05.00] Primeira estrofe da canção..."
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className={`px-4 py-2 rounded-lg text-xs font-medium ${
                isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={linesContainerRef}
          onScroll={() => {
            // If user manually scrolls away, temporarily relax auto-scroll
          }}
          className="relative z-10 flex-1 overflow-y-auto px-6 py-12 space-y-7 scroll-smooth"
        >
          {lyrics.length === 0 ? (
            <div className={`text-center py-20 ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
              <p className="text-sm font-medium">Esta faixa não possui letra cadastrada.</p>
              <button
                onClick={handleStartEdit}
                className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Adicionar Letra Sincronizada
              </button>
            </div>
          ) : (
            lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={`${line.time}-${idx}`}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`group cursor-pointer transition-all duration-300 transform select-none rounded-xl p-3 -mx-3 flex items-start gap-4 ${
                    isActive
                      ? `scale-[1.02] ${
                          isDark
                            ? 'text-white font-bold bg-indigo-950/40 border border-indigo-500/30 lyric-active'
                            : 'text-indigo-950 font-bold bg-indigo-50/80 border border-indigo-200'
                        }`
                      : isPast
                      ? isDark
                        ? 'text-zinc-500 hover:text-zinc-300 font-medium'
                        : 'text-stone-400 hover:text-stone-600 font-medium'
                      : isDark
                      ? 'text-zinc-400 hover:text-zinc-200 font-medium'
                      : 'text-stone-600 hover:text-stone-900 font-medium'
                  }`}
                >
                  {/* Timestamp seek affordance */}
                  <span
                    className={`font-mono text-xs tabular-nums mt-1 shrink-0 px-2 py-0.5 rounded transition-opacity ${
                      isActive
                        ? isDark
                          ? 'bg-indigo-600/40 text-indigo-200'
                          : 'bg-indigo-600 text-white'
                        : 'opacity-0 group-hover:opacity-100 bg-black/10 dark:bg-white/10 text-xs'
                    }`}
                  >
                    {Math.floor(line.time / 60)}:{String(Math.floor(line.time % 60)).padStart(2, '0')}
                  </span>

                  {/* Lyric line text */}
                  <div className="flex-1">
                    <p
                      className={`leading-snug transition-all ${
                        isActive
                          ? isFullScreen
                            ? 'text-2xl md:text-3xl tracking-tight'
                            : 'text-lg md:text-xl'
                          : isFullScreen
                          ? 'text-lg md:text-xl'
                          : 'text-sm md:text-base'
                      }`}
                    >
                      {line.text}
                    </p>
                    {line.translation && (
                      <p className={`text-xs mt-1 italic ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                        {line.translation}
                      </p>
                    )}
                  </div>

                  {/* Play jump icon on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer bar with quick auto-scroll indicator */}
      <div className={`relative z-10 px-6 py-2.5 flex items-center justify-between text-xs border-t ${isDark ? 'border-zinc-800/80 text-zinc-500' : 'border-stone-100 text-stone-400'}`}>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Toque em qualquer estrofe para pular a reprodução
        </span>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`hover:text-indigo-400 transition-colors font-medium ${autoScroll ? 'text-indigo-400' : ''}`}
        >
          {autoScroll ? 'Auto-rolagem: Ligada' : 'Auto-rolagem: Desligada'}
        </button>
      </div>
    </div>
  );
};

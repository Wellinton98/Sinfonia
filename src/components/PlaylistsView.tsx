import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  FolderPlus,
  Music,
  Play,
  Plus,
  Shuffle,
  Trash2,
  X
} from 'lucide-react';
import { Playlist, Track } from '../types/music';

interface PlaylistsViewProps {
  playlists: Playlist[];
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  offlineTrackIds: string[];
  selectedPlaylistId: string | null;
  onSelectPlaylistId: (id: string | null) => void;
  onOpenCreatePlaylist: () => void;
  onDeletePlaylist: (id: string) => void;
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onTogglePlay: () => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  onMoveTrackInPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  onDownloadAllInPlaylist: (playlist: Playlist) => void;
  isDark: boolean;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  tracks,
  currentTrack,
  isPlaying,
  offlineTrackIds,
  selectedPlaylistId,
  onSelectPlaylistId,
  onOpenCreatePlaylist,
  onDeletePlaylist,
  onPlayTrack,
  onTogglePlay,
  onRemoveTrackFromPlaylist,
  onMoveTrackInPlaylist,
  onDownloadAllInPlaylist,
  isDark,
}) => {
  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  // Get tracks belonging to the selected playlist in order
  const playlistTracks = currentPlaylist
    ? currentPlaylist.trackIds
        .map((id) => tracks.find((t) => t.id === id))
        .filter((t): t is Track => t !== undefined)
    : [];

  const totalDuration = playlistTracks.reduce((acc, t) => acc + t.duration, 0);
  const durationMin = Math.floor(totalDuration / 60);

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Playlists Personalizadas</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
            Organize suas músicas favoritas em coleções sob medida, salvas no navegador.
          </p>
        </div>

        <button
          onClick={onOpenCreatePlaylist}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto active:scale-95"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Nova Playlist</span>
        </button>
      </div>

      {/* Playlist Grid (Shelf selector) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {playlists.map((pl) => {
          const isSelected = selectedPlaylistId === pl.id;
          return (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylistId(pl.id)}
              className={`group cursor-pointer p-3 rounded-2xl border transition-all ${
                isSelected
                  ? 'ring-2 ring-indigo-500 bg-indigo-950/20'
                  : isDark
                  ? 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/70 hover:border-zinc-700'
                  : 'bg-white border-stone-200 hover:bg-stone-50 hover:shadow-sm'
              }`}
            >
              <div
                className={`w-full aspect-square rounded-xl bg-gradient-to-br ${pl.gradient} flex items-center justify-center text-white mb-2.5 shadow-sm relative overflow-hidden`}
              >
                <Music className="w-7 h-7 opacity-80" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-6 h-6 fill-white" />
                </div>
              </div>
              <h3 className="text-xs font-semibold truncate group-hover:text-indigo-400 transition-colors">
                {pl.name}
              </h3>
              <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                {pl.trackIds.length} {pl.trackIds.length === 1 ? 'música' : 'músicas'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Playlist Detailed View */}
      {currentPlaylist ? (
        <section
          className={`rounded-3xl border overflow-hidden transition-all ${
            isDark ? 'bg-zinc-900/40 border-zinc-800/90' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          {/* Header Banner */}
          <div
            className={`p-6 sm:p-8 bg-gradient-to-r ${currentPlaylist.gradient} text-white flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6`}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center shadow-2xl shrink-0">
                <Music className="w-12 h-12 text-white/90" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold opacity-80">
                  Playlist Personalizada
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                  {currentPlaylist.name}
                </h2>
                {currentPlaylist.description && (
                  <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-lg">
                    {currentPlaylist.description}
                  </p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-white/70 mt-2 font-mono">
                  <span>{playlistTracks.length} faixas</span>
                  <span>·</span>
                  <span>~{durationMin} min</span>
                </div>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {playlistTracks.length > 0 && (
                <>
                  <button
                    onClick={() => onPlayTrack(playlistTracks[0], playlistTracks)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg transition-transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Reproduzir Tudo</span>
                  </button>

                  <button
                    onClick={() => {
                      const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
                      onPlayTrack(shuffled[0], shuffled);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Aleatório</span>
                  </button>

                  <button
                    onClick={() => onDownloadAllInPlaylist(currentPlaylist)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
                    title="Baixar todas as músicas desta playlist para ouvir offline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Todas</span>
                  </button>
                </>
              )}

              <button
                onClick={() => onDeletePlaylist(currentPlaylist.id)}
                className="p-2.5 rounded-full bg-black/40 hover:bg-rose-600/80 text-white backdrop-blur-md transition-colors"
                title="Excluir playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Track List in Playlist */}
          <div className="p-4 sm:p-6">
            {playlistTracks.length === 0 ? (
              <div className={`text-center py-16 ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
                <p className="text-sm font-medium">Esta playlist ainda não tem músicas.</p>
                <p className="text-xs mt-1">
                  Vá até a aba "Início" e clique no ícone '+' para adicionar faixas aqui.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-inherit">
                {playlistTracks.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isOffline = offlineTrackIds.includes(track.id);

                  return (
                    <div
                      key={track.id}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-colors ${
                        isCurrent
                          ? isDark
                            ? 'bg-indigo-950/30'
                            : 'bg-indigo-50/70'
                          : isDark
                          ? 'hover:bg-zinc-800/40'
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={`w-5 text-xs font-mono text-center ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
                          {idx + 1}
                        </span>

                        <button
                          onClick={() => {
                            if (isCurrent) {
                              onTogglePlay();
                            } else {
                              onPlayTrack(track, playlistTracks);
                            }
                          }}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                            isCurrent && isPlaying
                              ? 'bg-indigo-600 text-white'
                              : isDark
                              ? 'bg-zinc-800 text-zinc-300 group-hover:bg-indigo-600 group-hover:text-white'
                              : 'bg-stone-100 text-stone-700 group-hover:bg-indigo-600 group-hover:text-white'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </button>

                        <img
                          src={track.coverUrl}
                          alt={track.album}
                          className="w-9 h-9 rounded-md object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              onClick={() => onPlayTrack(track, playlistTracks)}
                              className={`text-xs font-semibold truncate cursor-pointer hover:underline ${
                                isCurrent ? 'text-indigo-400' : ''
                              }`}
                            >
                              {track.title}
                            </p>
                            {isOffline && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/15 text-emerald-400">
                                OFFLINE
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      {/* Reorder and remove controls */}
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <span className={`text-xs font-mono tabular-nums mr-2 hidden sm:block ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                          {formatSecs(track.duration)}
                        </span>

                        {/* Move Up */}
                        <button
                          disabled={idx === 0}
                          onClick={() => onMoveTrackInPlaylist(currentPlaylist.id, idx, idx - 1)}
                          className="p-1 rounded text-zinc-500 hover:text-indigo-400 disabled:opacity-20"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          disabled={idx === playlistTracks.length - 1}
                          onClick={() => onMoveTrackInPlaylist(currentPlaylist.id, idx, idx + 1)}
                          className="p-1 rounded text-zinc-500 hover:text-indigo-400 disabled:opacity-20"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove from playlist */}
                        <button
                          onClick={() => onRemoveTrackFromPlaylist(currentPlaylist.id, track.id)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-500 ml-1"
                          title="Remover desta playlist"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className={`text-center py-12 rounded-2xl border ${isDark ? 'border-zinc-800 text-zinc-500' : 'border-stone-200 text-stone-400'}`}>
          <p className="text-sm">Selecione uma playlist acima para visualizar ou gerenciar suas músicas.</p>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Check,
  Clock,
  Download,
  FolderPlus,
  Headphones,
  Heart,
  Mic2,
  MoreVertical,
  Music2,
  Play,
  Plus,
  Search,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Playlist, Track } from '../types/music';

interface HomeViewProps {
  tracks: Track[];
  playlists: Playlist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  offlineTrackIds: string[];
  onPlayTrack: (track: Track, newQueue?: Track[]) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (trackId: string) => void;
  onDownloadOffline: (track: Track) => void;
  onOpenAddToPlaylist: (track: Track) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onOpenCreatePlaylist: () => void;
  onOpenLyrics: () => void;
  isDark: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  tracks,
  playlists,
  currentTrack,
  isPlaying,
  offlineTrackIds,
  onPlayTrack,
  onTogglePlay,
  onToggleFavorite,
  onDownloadOffline,
  onOpenAddToPlaylist,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  onOpenLyrics,
  isDark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Featured track (track 1 or current)
  const featured = currentTrack || tracks[0];

  const genres = ['all', 'offline', 'favorites', 'Lo-Fi', 'Synthwave', 'Bossa Nova', 'Acústico'];

  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedGenre === 'all') return true;
    if (selectedGenre === 'offline') return offlineTrackIds.includes(track.id);
    if (selectedGenre === 'favorites') return track.isFavorite;
    return track.genre.toLowerCase().includes(selectedGenre.toLowerCase());
  });

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-10 pb-28">
      {/* Hero Spotlight Section */}
      {featured && (
        <section
          className={`relative rounded-3xl overflow-hidden p-6 sm:p-10 border transition-all ${
            isDark
              ? 'bg-zinc-900/90 border-zinc-800 text-white shadow-2xl'
              : 'bg-white border-stone-200 text-stone-900 shadow-xl'
          }`}
        >
          {/* Subtle Ambient Color Backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-3xl scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${featured.coverUrl})` }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-semibold">
                <span className="text-indigo-400 uppercase tracking-widest text-[11px]">
                  Em Destaque
                </span>
                <span className="opacity-40">·</span>
                <span className={isDark ? 'text-zinc-400' : 'text-stone-500'}>{featured.genre}</span>
                <span className="opacity-40">·</span>
                <span className={isDark ? 'text-zinc-400' : 'text-stone-500'}>{featured.year}</span>
                {offlineTrackIds.includes(featured.id) && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Disponível Offline
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                {featured.title}
              </h1>

              <p className={`text-base max-w-xl ${isDark ? 'text-zinc-300' : 'text-stone-600'}`}>
                {featured.artist} — {featured.album}. Desfrute de áudio cristalino com letras sincronizadas em tempo real e reprodução offline contínua.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => {
                    if (currentTrack?.id === featured.id) {
                      onTogglePlay();
                    } else {
                      onPlayTrack(featured, tracks);
                    }
                  }}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <Play
                    className={`w-4 h-4 fill-white ${
                      currentTrack?.id === featured.id && isPlaying ? 'opacity-0' : ''
                    }`}
                  />
                  <span>
                    {currentTrack?.id === featured.id && isPlaying
                      ? 'Pausar Reprodução'
                      : 'Ouvir Agora'}
                  </span>
                </button>

                <button
                  onClick={onOpenLyrics}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-colors border ${
                    isDark
                      ? 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                      : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800'
                  }`}
                >
                  <Mic2 className="w-4 h-4 text-indigo-400" />
                  <span>Letra em Tempo Real</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(featured.id)}
                  className={`p-3 rounded-full border transition-colors ${
                    featured.isFavorite
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                      : isDark
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                      : 'bg-stone-100 border-stone-300 text-stone-700 hover:text-stone-900'
                  }`}
                  title={featured.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
                >
                  <Heart className={`w-4 h-4 ${featured.isFavorite ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Artwork Card */}
            <div className="relative group shrink-0">
              <img
                src={featured.coverUrl}
                alt={featured.album}
                className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl object-cover shadow-2xl transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-xs font-medium">Toque para acompanhar a letra</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Playlists Quick Shelf */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Suas Playlists Personalizadas</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              Crie coleções personalizadas para cada momento do seu dia.
            </p>
          </div>
          <button
            onClick={onOpenCreatePlaylist}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            <Plus className="w-4 h-4" /> Criar Playlist
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((pl) => {
            return (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl)}
                className={`group cursor-pointer p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
                  isDark
                    ? 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/70 hover:border-zinc-700'
                    : 'bg-white border-stone-200 hover:bg-stone-50 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-full aspect-video rounded-xl bg-gradient-to-br ${pl.gradient} flex items-center justify-center text-white mb-3 shadow-md relative overflow-hidden`}
                >
                  <Music2 className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                  <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold truncate group-hover:text-indigo-400 transition-colors">
                  {pl.name}
                </h3>
                <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                  {pl.description}
                </p>
                <div className={`mt-3 text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
                  {pl.trackIds.length} {pl.trackIds.length === 1 ? 'música' : 'músicas'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Catalog & Filter Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Catálogo de Músicas</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              Todas as músicas podem ser ouvidas offline através do armazenamento IndexedDB do navegador.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-stone-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar título, artista ou estilo..."
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                  : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>
        </div>

        {/* Filter Badges / Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((g) => {
            const isSelected = selectedGenre === g;
            const label =
              g === 'all'
                ? 'Todas as Músicas'
                : g === 'offline'
                ? 'Disponíveis Offline'
                : g === 'favorites'
                ? 'Favoritas'
                : g;

            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isDark
                    ? 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Track List Table */}
        <div
          className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          {filteredTracks.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
              <p className="text-sm font-medium">Nenhuma música encontrada para este filtro.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('all');
                }}
                className="mt-2 text-xs text-indigo-400 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="divide-y divide-inherit">
              {filteredTracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                const isOffline = offlineTrackIds.includes(track.id);

                return (
                  <div
                    key={track.id}
                    className={`group flex items-center justify-between p-3 sm:px-4 sm:py-3.5 transition-colors ${
                      isCurrent
                        ? isDark
                          ? 'bg-indigo-950/30'
                          : 'bg-indigo-50/70'
                        : isDark
                        ? 'hover:bg-zinc-800/40'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    {/* Track info and play trigger */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      {/* Play / Index Button */}
                      <button
                        onClick={() => {
                          if (isCurrent) {
                            onTogglePlay();
                          } else {
                            onPlayTrack(track, filteredTracks);
                          }
                        }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                          isCurrent && isPlaying
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : isDark
                            ? 'bg-zinc-800 text-zinc-300 group-hover:bg-indigo-600 group-hover:text-white'
                            : 'bg-stone-100 text-stone-700 group-hover:bg-indigo-600 group-hover:text-white'
                        }`}
                        title={isCurrent && isPlaying ? 'Pausar' : 'Reproduzir'}
                      >
                        {isCurrent && isPlaying ? (
                          <div className="flex items-center gap-0.5">
                            <span className="w-0.5 h-3 bg-white animate-pulse" />
                            <span className="w-0.5 h-4 bg-white animate-pulse delay-100" />
                            <span className="w-0.5 h-2 bg-white animate-pulse delay-200" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <img
                        src={track.coverUrl}
                        alt={track.album}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
                        referrerPolicy="no-referrer"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            onClick={() => onPlayTrack(track, filteredTracks)}
                            className={`text-sm font-semibold truncate cursor-pointer hover:underline ${
                              isCurrent ? 'text-indigo-400' : ''
                            }`}
                          >
                            {track.title}
                          </p>
                          {isOffline && (
                            <span
                              className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-emerald-500/15 text-emerald-400 shrink-0"
                              title="Salvo offline no IndexedDB"
                            >
                              OFFLINE
                            </span>
                          )}
                          {track.lyricsLRC && (
                            <button
                              onClick={onOpenLyrics}
                              className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 shrink-0 flex items-center gap-1"
                              title="Esta faixa possui letras sincronizadas"
                            >
                              <Mic2 className="w-2.5 h-2.5" /> LETRA
                            </button>
                          )}
                        </div>
                        <p className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                          {track.artist} · {track.album}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <span className={`hidden md:block text-xs font-mono tabular-nums ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                        {formatDuration(track.duration)}
                      </span>

                      {/* Download offline button */}
                      <button
                        onClick={() => onDownloadOffline(track)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isOffline
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : isDark
                            ? 'text-zinc-500 hover:text-indigo-400'
                            : 'text-stone-400 hover:text-indigo-600'
                        }`}
                        title={isOffline ? 'Salva offline no dispositivo' : 'Baixar para ouvir offline'}
                      >
                        {isOffline ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      </button>

                      {/* Favorite Heart */}
                      <button
                        onClick={() => onToggleFavorite(track.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          track.isFavorite
                            ? 'text-rose-500'
                            : isDark
                            ? 'text-zinc-500 hover:text-zinc-300'
                            : 'text-stone-400 hover:text-stone-600'
                        }`}
                        title={track.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
                      >
                        <Heart className={`w-4 h-4 ${track.isFavorite ? 'fill-rose-500' : ''}`} />
                      </button>

                      {/* Add to playlist */}
                      <button
                        onClick={() => onOpenAddToPlaylist(track)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-stone-400 hover:text-stone-600'
                        }`}
                        title="Adicionar à playlist"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

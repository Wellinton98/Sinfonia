import React from 'react';
import {
  Check,
  Clock,
  Download,
  FolderDown,
  HardDrive,
  Music,
  Play,
  Trash2,
  Upload,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Track } from '../types/music';

interface OfflineViewProps {
  tracks: Track[];
  offlineTrackIds: string[];
  currentTrack: Track | null;
  isPlaying: boolean;
  storageUsageMB: number;
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onTogglePlay: () => void;
  onDownloadOffline: (track: Track) => void;
  onRemoveOfflineAudio: (trackId: string) => void;
  onDownloadAll: () => void;
  onOpenImport: () => void;
  isDark: boolean;
}

export const OfflineView: React.FC<OfflineViewProps> = ({
  tracks,
  offlineTrackIds,
  currentTrack,
  isPlaying,
  storageUsageMB,
  onPlayTrack,
  onTogglePlay,
  onDownloadOffline,
  onRemoveOfflineAudio,
  onDownloadAll,
  onOpenImport,
  isDark,
}) => {
  const offlineTracks = tracks.filter((t) => offlineTrackIds.includes(t.id));

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-28">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <WifiOff className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Músicas Offline</h1>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
            Músicas salvas permanentemente no banco de dados local (IndexedDB) para reprodução sem internet.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onOpenImport}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar do Dispositivo</span>
          </button>

          {offlineTracks.length < tracks.length && (
            <button
              onClick={onDownloadAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Todas ({tracks.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Storage Indicator Card */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Armazenamento Local do Navegador (IndexedDB)</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              <strong className="text-emerald-400 font-mono font-medium">{storageUsageMB.toFixed(1)} MB</strong> em uso · {offlineTracks.length} faixas salvas localmente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span className={isDark ? 'text-zinc-300' : 'text-stone-700'}>
            Pronto para modo avião ou sem conexão
          </span>
        </div>
      </div>

      {/* Offline Track List */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-stone-200 shadow-sm'
        }`}
      >
        <div className={`p-4 border-b ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-stone-100 text-stone-500'} flex items-center justify-between text-xs`}>
          <span className="font-semibold uppercase tracking-wider">
            Faixas Disponíveis ({offlineTracks.length})
          </span>
          {offlineTracks.length > 0 && (
            <button
              onClick={() => onPlayTrack(offlineTracks[0], offlineTracks)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Reproduzir Músicas Offline
            </button>
          )}
        </div>

        {offlineTracks.length === 0 ? (
          <div className={`text-center py-16 ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
            <FolderDown className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Nenhuma música baixada offline ainda.</p>
            <p className="text-xs mt-1 max-w-sm mx-auto">
              Clique no botão "Baixar Todas" acima ou toque no ícone de download ao lado de qualquer música para salvá-la em seu dispositivo.
            </p>
            <button
              onClick={onDownloadAll}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              Baixar Músicas do Catálogo
            </button>
          </div>
        ) : (
          <div className="divide-y divide-inherit">
            {offlineTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;

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
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <button
                      onClick={() => {
                        if (isCurrent) {
                          onTogglePlay();
                        } else {
                          onPlayTrack(track, offlineTracks);
                        }
                      }}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                        isCurrent && isPlaying
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isDark
                          ? 'bg-zinc-800 text-zinc-300 group-hover:bg-indigo-600 group-hover:text-white'
                          : 'bg-stone-100 text-stone-700 group-hover:bg-indigo-600 group-hover:text-white'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
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
                          onClick={() => onPlayTrack(track, offlineTracks)}
                          className={`text-sm font-semibold truncate cursor-pointer hover:underline ${
                            isCurrent ? 'text-indigo-400' : ''
                          }`}
                        >
                          {track.title}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-emerald-500/15 text-emerald-400 shrink-0">
                          {track.fileSizeMB ? `${track.fileSizeMB} MB` : 'SALVA'}
                        </span>
                        {track.isLocalImport && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-indigo-500/15 text-indigo-400 shrink-0">
                            ARQUIVO LOCAL
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                        {track.artist} · {track.album}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-mono tabular-nums ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                      {formatDuration(track.duration)}
                    </span>

                    {/* Delete offline cache */}
                    <button
                      onClick={() => onRemoveOfflineAudio(track.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? 'text-zinc-500 hover:text-rose-400' : 'text-stone-400 hover:text-rose-500'
                      }`}
                      title="Remover do armazenamento offline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

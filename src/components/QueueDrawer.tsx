import React from 'react';
import { ListMusic, Play, Trash2, X } from 'lucide-react';
import { Track } from '../types/music';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  queue: Track[];
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  isDark: boolean;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  currentTrack,
  queue,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md h-full flex flex-col p-6 shadow-2xl transition-all border-l ${
          isDark ? 'bg-zinc-950 text-zinc-100 border-zinc-800' : 'bg-white text-stone-900 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold">Fila de Reprodução</h3>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={onClearQueue}
                className="text-xs text-rose-500 hover:text-rose-400 font-medium px-2 py-1 rounded"
              >
                Limpar Fila
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-100 text-stone-500'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Currently Playing Card */}
        {currentTrack && (
          <div className="mt-5">
            <span className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              Tocando Agora
            </span>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                isDark ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-indigo-50/80 border-indigo-200'
              }`}
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.album}
                className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-indigo-400">{currentTrack.title}</p>
                <p className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                  {currentTrack.artist}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div className="mt-6 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              A Seguir ({queue.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {queue.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
                <p className="text-xs">A fila de reprodução está vazia.</p>
                <p className="text-[11px] mt-1 opacity-70">
                  Adicione mais faixas a partir de qualquer playlist ou álbum.
                </p>
              </div>
            ) : (
              queue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  className={`group flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/70'
                      : 'bg-stone-50 border-stone-200/80 hover:bg-stone-100'
                  }`}
                >
                  <div
                    onClick={() => onPlayTrack(track)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.album}
                      className="w-10 h-10 rounded-md object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate group-hover:text-indigo-400 transition-colors">
                        {track.title}
                      </p>
                      <p className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromQueue(idx)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover da fila"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

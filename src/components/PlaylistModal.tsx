import React, { useState } from 'react';
import { Check, FolderPlus, Music, Sparkles, X } from 'lucide-react';
import { Playlist, Track } from '../types/music';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, gradient: string) => void;
  isDark: boolean;
}

const GRADIENT_PRESETS = [
  { name: 'Indigo Noite', value: 'from-indigo-600 via-purple-700 to-slate-900' },
  { name: 'Sunset Laranja', value: 'from-amber-500 via-orange-600 to-rose-900' },
  { name: 'Neon Cibernético', value: 'from-fuchsia-600 via-pink-600 to-violet-950' },
  { name: 'Esmeralda Calma', value: 'from-emerald-600 via-teal-700 to-slate-900' },
  { name: 'Azul Meia-Noite', value: 'from-blue-600 via-indigo-800 to-zinc-950' },
];

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isDark,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].value);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim(), selectedGradient);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all border ${
          isDark ? 'bg-zinc-900 text-zinc-100 border-zinc-800' : 'bg-white text-stone-900 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold">Nova Playlist Personalizada</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-100 text-stone-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              Nome da Playlist *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Músicas para Programar, Bossa Acústica..."
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark ? 'bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              Descrição (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a vibração e o clima desta seleção..."
              className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                isDark ? 'bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              Capa & Gradiente Visual
            </label>
            <div className="grid grid-cols-5 gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setSelectedGradient(preset.value)}
                  className={`h-11 rounded-xl bg-gradient-to-br ${preset.value} flex items-center justify-center transition-all ${
                    selectedGradient === preset.value ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={preset.name}
                >
                  {selectedGradient === preset.value && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-inherit">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-medium ${
                isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              Criar Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddToPlaylistModalProps {
  isOpen: boolean;
  track: Track | null;
  playlists: Playlist[];
  onClose: () => void;
  onToggleTrackInPlaylist: (playlistId: string, trackId: string) => void;
  onOpenCreatePlaylist: () => void;
  isDark: boolean;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  track,
  playlists,
  onClose,
  onToggleTrackInPlaylist,
  onOpenCreatePlaylist,
  isDark,
}) => {
  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all border ${
          isDark ? 'bg-zinc-900 text-zinc-100 border-zinc-800' : 'bg-white text-stone-900 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="min-w-0 pr-2">
            <h3 className="text-base font-semibold truncate">Adicionar à Playlist</h3>
            <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              {track.title} · {track.artist}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg shrink-0 ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-100 text-stone-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 max-h-60 overflow-y-auto space-y-2">
          {playlists.length === 0 ? (
            <p className={`text-xs text-center py-6 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
              Nenhuma playlist criada ainda. Crie uma abaixo!
            </p>
          ) : (
            playlists.map((pl) => {
              const isInPlaylist = pl.trackIds.includes(track.id);
              return (
                <div
                  key={pl.id}
                  onClick={() => onToggleTrackInPlaylist(pl.id, track.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isInPlaylist
                      ? isDark
                        ? 'bg-indigo-950/40 border border-indigo-500/30'
                        : 'bg-indigo-50 border border-indigo-200'
                      : isDark
                      ? 'hover:bg-zinc-800/80 border border-transparent'
                      : 'hover:bg-stone-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pl.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{pl.name}</p>
                      <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                        {pl.trackIds.length} {pl.trackIds.length === 1 ? 'música' : 'músicas'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      isInPlaylist ? 'bg-indigo-600 text-white' : 'border border-zinc-600'
                    }`}
                  >
                    {isInPlaylist && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-inherit flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenCreatePlaylist();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-400"
          >
            <FolderPlus className="w-4 h-4" /> Criar Nova Playlist
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

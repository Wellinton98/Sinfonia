import React, { useRef, useState } from 'react';
import { FileAudio, Music, Plus, Sparkles, Upload, X } from 'lucide-react';
import { Track } from '../types/music';
import { dbService } from '../services/indexedDbService';

interface ImportAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackImported: (track: Track) => void;
  isDark: boolean;
}

export const ImportAudioModal: React.FC<ImportAudioModalProps> = ({
  isOpen,
  onClose,
  onTrackImported,
  isDark,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('Arquivos do Dispositivo');
  const [lyrics, setLyrics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-extract title from file name
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const parts = cleanName.split(' - ');
      if (parts.length > 1) {
        setArtist(parts[0].trim());
        setTitle(parts[1].trim());
      } else {
        setTitle(cleanName);
        setArtist('Artista Local');
      }
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Por favor selecione um arquivo de áudio do seu dispositivo.');
      return;
    }

    setIsLoading(true);
    try {
      const trackId = `imported-${Date.now()}`;
      const fileSizeMB = Math.round((selectedFile.size / (1024 * 1024)) * 10) / 10;

      // Save raw audio blob in IndexedDB
      await dbService.saveAudioBlob(trackId, selectedFile);

      // Create Track metadata
      const newTrack: Track = {
        id: trackId,
        title: title.trim() || selectedFile.name,
        artist: artist.trim() || 'Artista Local',
        album: album.trim() || 'Arquivos Offline',
        duration: 180, // Default duration if not measured
        coverUrl: '/src/assets/images/album_midnight_vibes_1793144450565.jpg',
        genre: 'Música Offline',
        year: new Date().getFullYear(),
        colorAccent: 'from-indigo-600 to-cyan-900',
        plays: 0,
        isFavorite: false,
        lyricsLRC: lyrics.trim() || `[00:00.00] ${title.trim()}\n[00:05.00] Música importada para ouvir offline no Sinfonia`,
        isOfflineAvailable: true,
        fileSizeMB,
        isLocalImport: true,
      };

      onTrackImported(newTrack);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Erro ao salvar arquivo offline: ${err.message || 'Falha de leitura'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl transition-all border ${
          isDark ? 'bg-zinc-900 text-zinc-100 border-zinc-800' : 'bg-white text-stone-900 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold">Importar Música para Ouvir Offline</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-100 text-stone-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* File Picker Drag & Drop Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              selectedFile
                ? isDark
                  ? 'border-indigo-500/50 bg-indigo-950/20'
                  : 'border-indigo-400 bg-indigo-50/50'
                : isDark
                ? 'border-zinc-700 hover:border-zinc-500 bg-zinc-950/50'
                : 'border-stone-300 hover:border-stone-400 bg-stone-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
              className="hidden"
            />
            <FileAudio className="w-10 h-10 mx-auto text-indigo-500 mb-2 opacity-80" />
            {selectedFile ? (
              <div>
                <p className="text-sm font-semibold text-indigo-400 truncate">{selectedFile.name}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Arquivo de áudio pronto para salvar offline
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">Toque para selecionar um arquivo de áudio</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                  Suporta MP3, WAV, FLAC, M4A ou OGG do seu celular ou computador
                </p>
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                Título da Música *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Minha Canção"
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                Artista *
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ex: Nome do Artista"
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              Letra em Tempo Real (Formato LRC opcional)
            </label>
            <textarea
              rows={3}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="[00:05.00] Primeira frase da canção&#10;[00:10.00] Segunda frase sincronizada..."
              className={`w-full p-3 font-mono text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                isDark ? 'bg-zinc-950 border-zinc-700 text-white placeholder-zinc-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-inherit">
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
              disabled={isLoading || !selectedFile}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {isLoading ? 'Salvando Offline...' : 'Salvar no Dispositivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

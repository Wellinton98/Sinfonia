import React, { useRef, useState } from 'react';
import { FileAudio, FolderOpen, Music, Upload, X } from 'lucide-react';
import { Track } from '../types/music';
import { dbService } from '../services/indexedDbService';

interface ImportAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTracksImported: (tracks: Track[]) => Promise<void> | void;
  isDark: boolean;
}

const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|m4a|flac|aac|opus)$/i;
const DEFAULT_COVER = '/src/assets/images/album_midnight_vibes_1793144450565.jpg';

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    audio.src = url;
  });
}

function makeTrackId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const ImportAudioModal: React.FC<ImportAudioModalProps> = ({
  isOpen,
  onClose,
  onTracksImported,
  isDark,
}) => {
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [artist, setArtist] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const audioFiles = files
      .filter((file) => file.type.startsWith('audio/') || AUDIO_EXTENSIONS.test(file.name))
      .sort((a, b) => {
        const pathA = (a as File & { webkitRelativePath?: string }).webkitRelativePath || a.name;
        const pathB = (b as File & { webkitRelativePath?: string }).webkitRelativePath || b.name;
        return pathA.localeCompare(pathB, undefined, { numeric: true, sensitivity: 'base' });
      });

    if (audioFiles.length === 0) {
      setSelectedFiles([]);
      setErrorMsg('Não encontrei arquivos de áudio nessa pasta. Selecione uma pasta com MP3, WAV, FLAC, M4A ou OGG.');
      return;
    }

    const firstPath = (audioFiles[0] as File & { webkitRelativePath?: string }).webkitRelativePath || '';
    const detectedAlbum = firstPath.split('/').filter(Boolean)[0] || 'Meu Álbum';
    setSelectedFiles(audioFiles);
    setAlbumName(detectedAlbum);
    setArtist('');
    setErrorMsg('');
    setProgress('');
  };

  const handleClose = () => {
    if (isLoading) return;
    setSelectedFiles([]);
    setAlbumName('');
    setArtist('');
    setErrorMsg('');
    setProgress('');
    if (folderInputRef.current) folderInputRef.current.value = '';
    onClose();
  };

  const handleImport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFiles.length) {
      setErrorMsg('Selecione uma pasta que contenha músicas.');
      return;
    }
    if (!albumName.trim()) {
      setErrorMsg('Informe o nome do álbum.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    const importedTracks: Track[] = [];

    try {
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index];
        setProgress(`Importando ${index + 1} de ${selectedFiles.length}: ${file.name}`);

        const trackId = makeTrackId();
        await dbService.saveAudioBlob(trackId, file);

        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        const parts = cleanName.split(' - ');
        const hasArtistPrefix = parts.length > 1 && !/^\\d+$/.test(parts[0].trim());
        const fileArtist = hasArtistPrefix ? parts[0].trim() : artist.trim();
        const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : cleanName;

        importedTracks.push({
          id: trackId,
          title: title || cleanName,
          artist: fileArtist || 'Artista Local',
          album: albumName.trim(),
          duration: await getAudioDuration(file),
          coverUrl: DEFAULT_COVER,
          genre: 'Música Local',
          year: new Date().getFullYear(),
          colorAccent: 'from-indigo-600 to-cyan-900',
          plays: 0,
          isFavorite: false,
          lyricsLRC: '',
          isOfflineAvailable: true,
          fileSizeMB: Math.round((file.size / (1024 * 1024)) * 10) / 10,
          isLocalImport: true,
        });
      }

      await onTracksImported(importedTracks);
      setIsLoading(false);
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao importar as músicas.';
      setErrorMsg(`Não foi possível concluir a importação: ${message}`);
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  };

  const surface = isDark
    ? 'bg-zinc-900 text-zinc-100 border-zinc-800'
    : 'bg-white text-stone-900 border-stone-200';
  const muted = isDark ? 'text-zinc-400' : 'text-stone-500';
  const inputStyle = `w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border ${surface}`}>
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold">Importar álbum do dispositivo</h3>
          </div>
          <button onClick={handleClose} disabled={isLoading} className={`p-1 rounded-lg disabled:opacity-40 ${muted}`} aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleImport} className="mt-5 space-y-4">
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            disabled={isLoading}
            className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors disabled:opacity-50 ${selectedFiles.length ? 'border-indigo-500 bg-indigo-500/10' : isDark ? 'border-zinc-700 hover:border-zinc-500 bg-zinc-950/50' : 'border-stone-300 hover:border-stone-400 bg-stone-50'}`}
          >
            <input
              ref={folderInputRef}
              type="file"
              multiple
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac,.opus"
              className="hidden"
              onChange={handleFolderChange}
              {...({ webkitdirectory: '', directory: '' } as any)}
            />
            {selectedFiles.length ? (
              <>
                <Music className="w-10 h-10 mx-auto text-indigo-500 mb-2" />
                <p className="text-sm font-semibold text-indigo-400">{selectedFiles.length} músicas encontradas</p>
                <p className={`text-xs mt-1 ${muted}`}>Clique para escolher outra pasta</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto text-indigo-500 mb-2" />
                <p className="text-sm font-semibold">Selecionar pasta do álbum</p>
                <p className={`text-xs mt-1 ${muted}`}>Escolha uma pasta com seus arquivos de áudio</p>
              </>
            )}
          </button>

          {selectedFiles.length > 0 && (
            <div className={`rounded-xl p-3 text-xs ${isDark ? 'bg-zinc-950' : 'bg-stone-50'}`}>
              <p className="font-semibold mb-1">Prévia das faixas</p>
              <ul className={`space-y-1 ${muted}`}>
                {selectedFiles.slice(0, 4).map((file) => <li key={file.name} className="truncate">♫ {file.name}</li>)}
              </ul>
              {selectedFiles.length > 4 && <p className={`mt-1 ${muted}`}>e mais {selectedFiles.length - 4} faixas...</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className={`block text-xs font-semibold mb-1 ${muted}`}>Nome do álbum</span>
              <input value={albumName} onChange={(e) => setAlbumName(e.target.value)} placeholder="Ex: Meu álbum" className={inputStyle} required />
            </label>
            <label className="block">
              <span className={`block text-xs font-semibold mb-1 ${muted}`}>Artista (opcional)</span>
              <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artista padrão" className={inputStyle} />
            </label>
          </div>
          <p className={`text-xs ${muted}`}>Dica: nomes no formato “Artista - Música.mp3” são identificados automaticamente. Se o nome do artista não estiver no arquivo, usaremos o artista informado acima.</p>

          {progress && <p className="text-xs text-indigo-400">{progress}</p>}
          {errorMsg && <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-inherit">
            <button type="button" onClick={handleClose} disabled={isLoading} className={`px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-40 ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-700'}`}>Cancelar</button>
            <button type="submit" disabled={isLoading || !selectedFiles.length} className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50">
              {isLoading ? 'Importando...' : 'Importar álbum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import {
  FolderPlus,
  Heart,
  ListMusic,
  Mic2,
  Moon,
  Music,
  Play,
  Plus,
  Sliders,
  Sparkles,
  Sun,
  Upload,
  WifiOff
} from 'lucide-react';
import {
  ActiveTab,
  EqualizerBands,
  EqualizerPreset,
  Playlist,
  RepeatMode,
  Track
} from './types/music';
import { INITIAL_PLAYLISTS, INITIAL_TRACKS } from './data/initialCatalog';
import { dbService } from './services/indexedDbService';
import { audioPlayer } from './services/audioPlayerService';
import { generateMusicalTrackWav } from './services/audioSynthesizer';

// Components
import { Header } from './components/Header';
import { PlayerBar } from './components/PlayerBar';
import { HomeView } from './components/HomeView';
import { PlaylistsView } from './components/PlaylistsView';
import { OfflineView } from './components/OfflineView';
import { LyricsView } from './components/LyricsView';
import {
  AddToPlaylistModal,
  CreatePlaylistModal
} from './components/PlaylistModal';
import { EqualizerModal } from './components/EqualizerModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { QueueDrawer } from './components/QueueDrawer';
import { ImportAudioModal } from './components/ImportAudioModal';

const DEFAULT_EQ_BANDS: EqualizerBands = {
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  treble: 0,
};

export default function App() {
  // Theme state: Default to true (Night Mode / Modo Noturno)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('sinfonia_theme');
    if (saved) return saved === 'dark';
    return true; // Night mode default
  });

  // Music Catalog & Playlists
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [offlineTrackIds, setOfflineTrackIds] = useState<string[]>([]);
  const [storageUsageMB, setStorageUsageMB] = useState<number>(0);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Equalizer
  const [eqBands, setEqBands] = useState<EqualizerBands>(DEFAULT_EQ_BANDS);
  const [eqPreset, setEqPreset] = useState<EqualizerPreset>('flat');

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Modals & Drawers
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isLyricsFullScreen, setIsLyricsFullScreen] = useState(false);

  // Sleep timer interval ref
  const sleepIntervalRef = useRef<any>(null);

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sinfonia_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sinfonia_theme', 'light');
    }
  }, [isDark]);

  // Initial load from IndexedDB
  useEffect(() => {
    async function loadStoredData() {
      try {
        // Load custom playlists
        const savedPlaylists = await dbService.getPlaylists();
        if (savedPlaylists && savedPlaylists.length > 0) {
          setPlaylists(savedPlaylists);
        } else {
          await dbService.savePlaylists(INITIAL_PLAYLISTS);
        }

        // Load custom imported tracks
        const savedCustomTracks = await dbService.getCustomTracks();
        if (savedCustomTracks && savedCustomTracks.length > 0) {
          setTracks((prev) => [...savedCustomTracks, ...prev]);
        }

        // Load offline cached IDs
        const offlineIds = await dbService.getAllOfflineTrackIds();
        setOfflineTrackIds(offlineIds);

        // Calculate storage usage
        const { usageMB } = await dbService.getStorageEstimate();
        setStorageUsageMB(usageMB);

        // Pre-download initial track 1 for instant instant offline out-of-the-box readiness
        if (!offlineIds.includes('track-1')) {
          const blob = await generateMusicalTrackWav('lofi', 65);
          await dbService.saveAudioBlob('track-1', blob);
          setOfflineTrackIds((prev) => [...prev, 'track-1']);
        }
      } catch (err) {
        console.warn('Erro ao carregar dados do IndexedDB:', err);
      }
    }

    loadStoredData();
  }, []);

  // Sync AudioPlayer events
  useEffect(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(audioPlayer.getCurrentTime());
      const d = audioPlayer.getDuration();
      if (d && !isNaN(d) && isFinite(d)) {
        setDuration(d);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      if (repeatMode === 'one' && currentTrack) {
        audioPlayer.seek(0);
        audioPlayer.play();
      } else {
        handleNext();
      }
    };

    audioPlayer.onTimeUpdate(handleTimeUpdate);
    audioPlayer.onPlay(handlePlay);
    audioPlayer.onPause(handlePause);
    audioPlayer.onEnded(handleEnded);

    return () => {
      audioPlayer.removeTimeUpdate(handleTimeUpdate);
    };
  }, [currentTrack, repeatMode, queue]);

  // Handle Play a Track
  const handlePlayTrack = async (track: Track, newQueue?: Track[]) => {
    try {
      setCurrentTrack(track);
      if (newQueue) {
        // Queue consists of all other tracks in the list after this track
        const trackIndex = newQueue.findIndex((t) => t.id === track.id);
        const upcoming = trackIndex !== -1 ? newQueue.slice(trackIndex + 1) : newQueue;
        setQueue(upcoming);
      }

      await audioPlayer.loadTrack(track);
      await audioPlayer.play();
      setIsPlaying(true);

      // Increment play count
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, plays: t.plays + 1 } : t))
      );
    } catch (err) {
      console.error('Falha ao reproduzir áudio:', err);
    }
  };

  const handleTogglePlay = async () => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        handlePlayTrack(tracks[0], tracks);
      }
      return;
    }

    if (isPlaying) {
      audioPlayer.pause();
      setIsPlaying(false);
    } else {
      await audioPlayer.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      const restQueue = queue.slice(1);
      setQueue(restQueue);
      handlePlayTrack(nextTrack);
    } else if (repeatMode === 'all' && tracks.length > 0) {
      handlePlayTrack(tracks[0], tracks);
    } else {
      // Pick next in track list
      if (!currentTrack) return;
      const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
      if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
        handlePlayTrack(tracks[currentIndex + 1], tracks);
      }
    }
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      audioPlayer.seek(0);
      return;
    }
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      handlePlayTrack(tracks[currentIndex - 1], tracks);
    } else {
      audioPlayer.seek(0);
    }
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioPlayer.seek(seconds);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    audioPlayer.setVolume(vol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioPlayer.setVolume(volume || 0.85);
    } else {
      setIsMuted(true);
      audioPlayer.setVolume(0);
    }
  };

  const handleToggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const handleToggleShuffle = () => {
    setIsShuffled(!isShuffled);
    if (!isShuffled && queue.length > 1) {
      setQueue([...queue].sort(() => Math.random() - 0.5));
    }
  };

  const handleToggleFavorite = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  // Offline Download handler
  const handleDownloadOffline = async (track: Track) => {
    try {
      if (offlineTrackIds.includes(track.id)) return;

      let blob = await dbService.getAudioBlob(track.id);
      if (!blob && track.synthPreset) {
        blob = await generateMusicalTrackWav(track.synthPreset, track.duration || 65);
      }

      if (blob) {
        await dbService.saveAudioBlob(track.id, blob);
        setOfflineTrackIds((prev) => [...prev, track.id]);
        const { usageMB } = await dbService.getStorageEstimate();
        setStorageUsageMB(usageMB);
      }
    } catch (err) {
      console.error('Falha ao baixar faixa offline:', err);
    }
  };

  const handleRemoveOfflineAudio = async (trackId: string) => {
    try {
      await dbService.deleteAudioBlob(trackId);
      setOfflineTrackIds((prev) => prev.filter((id) => id !== trackId));
      const { usageMB } = await dbService.getStorageEstimate();
      setStorageUsageMB(usageMB);
    } catch (err) {
      console.error('Falha ao remover áudio offline:', err);
    }
  };

  const handleDownloadAll = async () => {
    for (const track of tracks) {
      if (!offlineTrackIds.includes(track.id)) {
        await handleDownloadOffline(track);
      }
    }
  };

  // Custom Playlist creation
  const handleCreatePlaylist = async (
    name: string,
    description: string,
    gradient: string
  ) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      gradient,
      trackIds: currentTrack ? [currentTrack.id] : [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newPlaylist, ...playlists];
    setPlaylists(updated);
    await dbService.savePlaylists(updated);
    setSelectedPlaylistId(newPlaylist.id);
    setActiveTab('playlists');
  };

  const handleDeletePlaylist = async (id: string) => {
    const updated = playlists.filter((p) => p.id !== id);
    setPlaylists(updated);
    await dbService.savePlaylists(updated);
    if (selectedPlaylistId === id) {
      setSelectedPlaylistId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleToggleTrackInPlaylist = async (playlistId: string, trackId: string) => {
    const updated = playlists.map((pl) => {
      if (pl.id !== playlistId) return pl;
      const exists = pl.trackIds.includes(trackId);
      const newIds = exists
        ? pl.trackIds.filter((id) => id !== trackId)
        : [...pl.trackIds, trackId];
      return { ...pl, trackIds: newIds };
    });

    setPlaylists(updated);
    await dbService.savePlaylists(updated);
  };

  const handleRemoveTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    handleToggleTrackInPlaylist(playlistId, trackId);
  };

  const handleMoveTrackInPlaylist = async (
    playlistId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    if (toIndex < 0 || toIndex >= pl.trackIds.length) return;

    const newIds = [...pl.trackIds];
    const [moved] = newIds.splice(fromIndex, 1);
    newIds.splice(toIndex, 0, moved);

    const updated = playlists.map((p) => (p.id === playlistId ? { ...p, trackIds: newIds } : p));
    setPlaylists(updated);
    await dbService.savePlaylists(updated);
  };

  const handleDownloadAllInPlaylist = async (playlist: Playlist) => {
    for (const trackId of playlist.trackIds) {
      const track = tracks.find((t) => t.id === trackId);
      if (track && !offlineTrackIds.includes(track.id)) {
        await handleDownloadOffline(track);
      }
    }
  };

  // Custom Local Track Import
  const handleTrackImported = async (newTrack: Track) => {
    const updatedTracks = [newTrack, ...tracks];
    setTracks(updatedTracks);
    setOfflineTrackIds((prev) => [...prev, newTrack.id]);

    const customOnly = updatedTracks.filter((t) => t.isLocalImport);
    await dbService.saveCustomTracks(customOnly);

    const { usageMB } = await dbService.getStorageEstimate();
    setStorageUsageMB(usageMB);

    // Auto-play imported track
    handlePlayTrack(newTrack, updatedTracks);
  };

  // Lyrics Update
  const handleUpdateLyrics = (trackId: string, newLrc: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, lyricsLRC: newLrc } : t))
    );
    if (currentTrack?.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, lyricsLRC: newLrc } : null));
    }
  };

  // Equalizer
  const handleChangeEqBand = (band: keyof EqualizerBands, val: number) => {
    const newBands = { ...eqBands, [band]: val };
    setEqBands(newBands);
    audioPlayer.setEqualizer(newBands);
  };

  const handleApplyEqPreset = (preset: EqualizerPreset) => {
    setEqPreset(preset);
    let newBands = DEFAULT_EQ_BANDS;
    if (preset === 'bass-boost') {
      newBands = { bass: 7, lowMid: 4, mid: -1, highMid: 1, treble: 3 };
    } else if (preset === 'vocal') {
      newBands = { bass: -2, lowMid: 1, mid: 5, highMid: 4, treble: 2 };
    } else if (preset === 'acoustic') {
      newBands = { bass: 3, lowMid: 2, mid: 1, highMid: 4, treble: 5 };
    } else if (preset === 'night-soft') {
      newBands = { bass: 2, lowMid: 1, mid: -1, highMid: -3, treble: -5 };
    }
    setEqBands(newBands);
    audioPlayer.setEqualizer(newBands);
  };

  // Sleep Timer
  const handleSetSleepTimer = (minutes: number) => {
    setSleepTimerRemaining(minutes);
    audioPlayer.setSleepTimer(minutes, () => {
      setIsPlaying(false);
      setSleepTimerRemaining(null);
    });

    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    sleepIntervalRef.current = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(sleepIntervalRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 60 * 1000);
  };

  const handleClearSleepTimer = () => {
    audioPlayer.clearSleepTimer();
    setSleepTimerRemaining(null);
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors selection:bg-indigo-600 selection:text-white ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-stone-50 text-stone-900'
      }`}
    >
      {/* 3-Zone Top Navigation Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenImport={() => setIsImportOpen(true)}
        offlineCount={offlineTrackIds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && (
          <HomeView
            tracks={tracks}
            playlists={playlists}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            offlineTrackIds={offlineTrackIds}
            onPlayTrack={handlePlayTrack}
            onTogglePlay={handleTogglePlay}
            onToggleFavorite={handleToggleFavorite}
            onDownloadOffline={handleDownloadOffline}
            onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
            onSelectPlaylist={(pl) => {
              setSelectedPlaylistId(pl.id);
              setActiveTab('playlists');
            }}
            onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
            onOpenLyrics={() => setActiveTab('lyrics')}
            isDark={isDark}
          />
        )}

        {activeTab === 'playlists' && (
          <PlaylistsView
            playlists={playlists}
            tracks={tracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            offlineTrackIds={offlineTrackIds}
            selectedPlaylistId={selectedPlaylistId || (playlists[0]?.id ?? null)}
            onSelectPlaylistId={setSelectedPlaylistId}
            onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
            onDeletePlaylist={handleDeletePlaylist}
            onPlayTrack={handlePlayTrack}
            onTogglePlay={handleTogglePlay}
            onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
            onMoveTrackInPlaylist={handleMoveTrackInPlaylist}
            onDownloadAllInPlaylist={handleDownloadAllInPlaylist}
            isDark={isDark}
          />
        )}

        {activeTab === 'offline' && (
          <OfflineView
            tracks={tracks}
            offlineTrackIds={offlineTrackIds}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            storageUsageMB={storageUsageMB}
            onPlayTrack={handlePlayTrack}
            onTogglePlay={handleTogglePlay}
            onDownloadOffline={handleDownloadOffline}
            onRemoveOfflineAudio={handleRemoveOfflineAudio}
            onDownloadAll={handleDownloadAll}
            onOpenImport={() => setIsImportOpen(true)}
            isDark={isDark}
          />
        )}

        {activeTab === 'lyrics' && (
          <div className="h-[calc(100vh-14rem)] max-w-4xl mx-auto pb-20">
            <LyricsView
              currentTrack={currentTrack || tracks[0]}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onSeek={handleSeek}
              onUpdateLyrics={handleUpdateLyrics}
              isDark={isDark}
              isFullScreen={isLyricsFullScreen}
              onToggleFullScreen={() => setIsLyricsFullScreen(!isLyricsFullScreen)}
            />
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-6 pb-28">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Biblioteca Completa</h1>
                <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                  Todas as faixas locais e predefinidas no Sinfonia ({tracks.length} músicas).
                </p>
              </div>
              <button
                onClick={() => setIsImportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500"
              >
                <Upload className="w-3.5 h-3.5" /> Importar do Computador/Celular
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handlePlayTrack(track, tracks)}
                  className={`group cursor-pointer p-3.5 rounded-2xl border transition-all hover:scale-[1.01] ${
                    isDark
                      ? 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/70 hover:border-zinc-700'
                      : 'bg-white border-stone-200 hover:bg-stone-50 hover:shadow-md'
                  }`}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-md">
                    <img
                      src={track.coverUrl}
                      alt={track.album}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold truncate group-hover:text-indigo-400 transition-colors">
                    {track.title}
                  </h3>
                  <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                    {track.artist}
                  </p>
                  <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-inherit">
                    <span className={isDark ? 'text-zinc-500' : 'text-stone-400'}>{track.genre}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddToPlaylistTrack(track);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      + Playlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Fullscreen Lyrics Overlay if toggled */}
      {isLyricsFullScreen && currentTrack && (
        <div className="fixed inset-0 z-50 p-4 sm:p-8 bg-zinc-950/95 backdrop-blur-2xl flex flex-col animate-fade-in">
          <LyricsView
            currentTrack={currentTrack}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSeek={handleSeek}
            onUpdateLyrics={handleUpdateLyrics}
            isDark={isDark}
            isFullScreen={true}
            onToggleFullScreen={() => setIsLyricsFullScreen(false)}
            onClose={() => setIsLyricsFullScreen(false)}
          />
        </div>
      )}

      {/* Fixed Sticky Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        repeatMode={repeatMode}
        isShuffled={isShuffled}
        isOffline={currentTrack ? offlineTrackIds.includes(currentTrack.id) : false}
        sleepTimerRemaining={sleepTimerRemaining}
        onTogglePlay={handleTogglePlay}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleRepeat={handleToggleRepeat}
        onToggleShuffle={handleToggleShuffle}
        onToggleFavorite={handleToggleFavorite}
        onOpenLyrics={() => setActiveTab('lyrics')}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onOpenQueue={() => setIsQueueOpen(true)}
        onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
        onDownloadOffline={handleDownloadOffline}
        isDark={isDark}
      />

      {/* Modals & Dialogs */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreate={handleCreatePlaylist}
        isDark={isDark}
      />

      <AddToPlaylistModal
        isOpen={!!addToPlaylistTrack}
        track={addToPlaylistTrack}
        playlists={playlists}
        onClose={() => setAddToPlaylistTrack(null)}
        onToggleTrackInPlaylist={handleToggleTrackInPlaylist}
        onOpenCreatePlaylist={() => {
          setAddToPlaylistTrack(null);
          setIsCreatePlaylistOpen(true);
        }}
        isDark={isDark}
      />

      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        bands={eqBands}
        onChangeBand={handleChangeEqBand}
        onApplyPreset={handleApplyEqPreset}
        currentPreset={eqPreset}
        isDark={isDark}
      />

      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        activeMinutes={sleepTimerRemaining}
        onSetTimer={handleSetSleepTimer}
        onClearTimer={handleClearSleepTimer}
        isDark={isDark}
      />

      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentTrack={currentTrack}
        queue={queue}
        onPlayTrack={handlePlayTrack}
        onRemoveFromQueue={(index) => setQueue((prev) => prev.filter((_, i) => i !== index))}
        onClearQueue={() => setQueue([])}
        isDark={isDark}
      />

      <ImportAudioModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onTrackImported={handleTrackImported}
        isDark={isDark}
      />
    </div>
  );
}

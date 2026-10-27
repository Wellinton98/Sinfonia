import React from 'react';
import {
  Download,
  FolderPlus,
  Headphones,
  Moon,
  Music,
  Sun,
  Upload
} from 'lucide-react';
import { ActiveTab } from '../types/music';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenImport: () => void;
  offlineCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  onOpenImport,
  offlineCount,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 transition-colors backdrop-blur-md border-b ${
        isDark
          ? 'bg-zinc-950/85 border-zinc-800/80 text-zinc-100'
          : 'bg-white/85 border-stone-200/90 text-stone-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">
              Sinfonia
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 Navigation links (single line, clean typography) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('home')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'home'
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-indigo-900 font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Início
            {activeTab === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('playlists')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'playlists'
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-indigo-900 font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Playlists
            {activeTab === 'playlists' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('offline')}
            className={`whitespace-nowrap transition-colors py-1 relative flex items-center gap-1.5 ${
              activeTab === 'offline'
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-indigo-900 font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Músicas Offline
            {offlineCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full font-mono tabular-nums bg-indigo-500/20 text-indigo-400">
                {offlineCount}
              </span>
            )}
            {activeTab === 'offline' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('lyrics')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'lyrics'
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-indigo-900 font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Letras em Tempo Real
            {activeTab === 'lyrics' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('library')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'library'
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-indigo-900 font-semibold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Biblioteca Completa
            {activeTab === 'library' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Actions - Theme toggle + Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dark / Light Mode Switch (Night Mode) */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg transition-colors border ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-amber-300 hover:bg-zinc-800'
                : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
            }`}
            title={isDark ? 'Ativar modo claro' : 'Ativar modo noturno'}
            aria-label="Alternar tema claro e noturno"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-sm shadow-indigo-600/30 whitespace-nowrap shrink-0 active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Músicas</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { RotateCcw, Sliders, X } from 'lucide-react';
import { EqualizerBands, EqualizerPreset } from '../types/music';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bands: EqualizerBands;
  onChangeBand: (band: keyof EqualizerBands, value: number) => void;
  onApplyPreset: (preset: EqualizerPreset) => void;
  currentPreset: EqualizerPreset;
  isDark: boolean;
}

const PRESETS: { id: EqualizerPreset; name: string; desc: string; bands: EqualizerBands }[] = [
  {
    id: 'flat',
    name: 'Plano (Neutro)',
    desc: 'Resposta equilibrada original',
    bands: { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 },
  },
  {
    id: 'bass-boost',
    name: 'Graves Potentes (Bass Boost)',
    desc: 'Enfatiza bumbos e linhas de sub-baixo',
    bands: { bass: 7, lowMid: 4, mid: -1, highMid: 1, treble: 3 },
  },
  {
    id: 'vocal',
    name: 'Vocais Nítidos',
    desc: 'Realça presença de voz e letras',
    bands: { bass: -2, lowMid: 1, mid: 5, highMid: 4, treble: 2 },
  },
  {
    id: 'acoustic',
    name: 'Acústico & Cordas',
    desc: 'Ideal para violão de nylon e folk',
    bands: { bass: 3, lowMid: 2, mid: 1, highMid: 4, treble: 5 },
  },
  {
    id: 'night-soft',
    name: 'Noturno Suave',
    desc: 'Reduz agudos estridentes para relaxar',
    bands: { bass: 2, lowMid: 1, mid: -1, highMid: -3, treble: -5 },
  },
];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  bands,
  onChangeBand,
  onApplyPreset,
  currentPreset,
  isDark,
}) => {
  if (!isOpen) return null;

  const bandConfigs: { key: keyof EqualizerBands; label: string; freq: string }[] = [
    { key: 'bass', label: 'Graves', freq: '60 Hz' },
    { key: 'lowMid', label: 'Médios Graves', freq: '250 Hz' },
    { key: 'mid', label: 'Médios', freq: '1 kHz' },
    { key: 'highMid', label: 'Médios Agudos', freq: '4 kHz' },
    { key: 'treble', label: 'Agudos', freq: '12 kHz' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl transition-all border ${
          isDark ? 'bg-zinc-900 text-zinc-100 border-zinc-800' : 'bg-white text-stone-900 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold">Equalizador Paramétrico de Áudio</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-100 text-stone-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets buttons */}
        <div className="mt-4">
          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
            Predefinições Recomendadas
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const isSelected = currentPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onApplyPreset(p.id)}
                  className={`px-3 py-2 text-left rounded-xl border text-xs transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold shadow-sm'
                      : isDark
                      ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <div className="truncate">{p.name}</div>
                  <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-indigo-200' : 'opacity-60'}`}>
                    {p.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5 Vertical Sliders */}
        <div className={`mt-6 p-5 rounded-2xl border ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-stone-50 border-stone-200'}`}>
          <div className="grid grid-cols-5 gap-3 items-end h-44">
            {bandConfigs.map(({ key, label, freq }) => {
              const val = bands[key];
              return (
                <div key={key} className="flex flex-col items-center justify-between h-full">
                  <span className="text-[11px] font-mono font-medium tabular-nums text-indigo-400">
                    {val > 0 ? `+${val}` : val} dB
                  </span>

                  <div className="relative flex items-center justify-center h-28 w-8">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={val}
                      onChange={(e) => onChangeBand(key, parseInt(e.target.value, 10))}
                      className="w-24 h-1.5 -rotate-90 origin-center bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="text-center mt-2">
                    <p className="text-[11px] font-semibold leading-tight">{label}</p>
                    <p className={`text-[9px] font-mono opacity-60 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                      {freq}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 mt-4 border-t border-inherit">
          <button
            onClick={() => onApplyPreset('flat')}
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Redefinir para Plano
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Aplicar Equalização
          </button>
        </div>
      </div>
    </div>
  );
};

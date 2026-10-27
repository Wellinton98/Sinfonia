import React from 'react';
import { Check, Clock, Moon, X } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMinutes: number | null;
  onSetTimer: (minutes: number) => void;
  onClearTimer: () => void;
  isDark: boolean;
}

const TIMER_OPTIONS = [
  { label: '15 Minutos', minutes: 15 },
  { label: '30 Minutos', minutes: 30 },
  { label: '45 Minutos', minutes: 45 },
  { label: '1 Hora (60 min)', minutes: 60 },
  { label: 'Fim da Música Atual', minutes: 2 },
];

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  activeMinutes,
  onSetTimer,
  onClearTimer,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl transition-all border ${
          isDark ? 'bg-zinc-900 text-zinc-100 border-zinc-800' : 'bg-white text-stone-900 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold">Temporizador de Sono</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-100 text-stone-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className={`text-xs mt-3 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
          A música pausará suavemente ao final do tempo selecionado. Ideal para noites de descanso.
        </p>

        <div className="mt-4 space-y-2">
          {TIMER_OPTIONS.map((opt) => {
            const isSelected = activeMinutes === opt.minutes;
            return (
              <button
                key={opt.label}
                onClick={() => {
                  onSetTimer(opt.minutes);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                    : isDark
                    ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 opacity-70" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>

        {activeMinutes && (
          <div className="mt-4 pt-3 border-t border-inherit">
            <button
              onClick={() => {
                onClearTimer();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              Desativar Temporizador
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

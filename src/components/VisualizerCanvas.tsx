import React, { useEffect, useRef } from 'react';
import { audioPlayer } from '../services/audioPlayerService';

interface VisualizerCanvasProps {
  isPlaying: boolean;
  barColor?: string;
  isDark?: boolean;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  isPlaying,
  barColor = '#6366f1',
  isDark = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isPlaying) {
        audioPlayer.getFrequencyData(dataArray);
      } else {
        // Subtle resting wave
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(0, dataArray[i] * 0.9);
        }
      }

      const barCount = 32;
      const barWidth = Math.max(2, (width / barCount) - 2);
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        // Average frequency slice
        const val = dataArray[i * 2] || 0;
        const percent = val / 255;
        const barHeight = Math.max(3, percent * (height - 6));

        // Gradient
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        if (isDark) {
          grad.addColorStop(0, barColor);
          grad.addColorStop(1, '#a855f7');
        } else {
          grad.addColorStop(0, '#4f46e5');
          grad.addColorStop(1, '#06b6d4');
        }

        ctx.fillStyle = grad;
        // Rounded top bars
        const y = height - barHeight;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();

        x += barWidth + 2;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, barColor, isDark]);

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={32}
      className="w-28 sm:w-36 h-8 rounded-md opacity-90 transition-opacity"
      aria-label="Visualizador de áudio em tempo real"
    />
  );
};

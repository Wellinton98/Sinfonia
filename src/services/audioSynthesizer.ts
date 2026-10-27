/**
 * Procedural offline music audio generator using OfflineAudioContext.
 * Renders complete, musically coherent tracks to stereo 16-bit WAV Blobs.
 */

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function bufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const wavBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(wavBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Interleave channels
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = channels[channel][i];
      // Clamping
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit PCM
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

// Note frequencies helper
const NOTE_FREQ: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.50
};

export async function generateMusicalTrackWav(
  preset: 'lofi' | 'synthwave' | 'bossa' | 'acoustic' | 'ambient',
  durationSec = 65
): Promise<Blob> {
  const sampleRate = 44100;
  const ctx = new OfflineAudioContext(2, sampleRate * durationSec, sampleRate);

  // Master bus
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.85, 0);

  // Fade in and fade out
  masterGain.gain.setValueAtTime(0.01, 0);
  masterGain.gain.exponentialRampToValueAtTime(0.85, 2.0);
  masterGain.gain.setValueAtTime(0.85, durationSec - 3.0);
  masterGain.gain.exponentialRampToValueAtTime(0.001, durationSec);
  masterGain.connect(ctx.destination);

  // Reverb simulation via delay network
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.28;
  const delayFeedback = ctx.createGain();
  delayFeedback.gain.value = 0.35;
  const delayFilter = ctx.createBiquadFilter();
  delayFilter.type = 'lowpass';
  delayFilter.frequency.value = 2400;

  delay.connect(delayFilter);
  delayFilter.connect(delayFeedback);
  delayFeedback.connect(delay);
  delayFilter.connect(masterGain);

  if (preset === 'lofi') {
    // Lo-Fi Beat: Warm rhodes chords + Vinyl noise + Laid back boom-bap drums + Sub bass
    const bpm = 80;
    const beatSec = 60 / bpm;
    const totalBeats = Math.floor(durationSec / beatSec);

    // Chords: Dm9 -> G13 -> Cmaj9 -> Am9
    const chordProgression = [
      ['D3', 'F3', 'A3', 'C4', 'E4'],
      ['G2', 'B3', 'F4', 'A4', 'E5'],
      ['C3', 'E3', 'G3', 'B3', 'D4'],
      ['A2', 'C3', 'E3', 'G3', 'B3'],
    ];
    const bassNotes = ['D2', 'G2', 'C2', 'A2'];

    // Play chords
    for (let beat = 0; beat < totalBeats; beat += 4) {
      const chordIndex = Math.floor((beat / 4) % chordProgression.length);
      const chord = chordProgression[chordIndex];
      const time = beat * beatSec;

      // Rhodes-style synth chords
      chord.forEach((note) => {
        const freq = NOTE_FREQ[note] || 261.63;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        // Sub harmonic
        const subOsc = ctx.createOscillator();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(freq * 0.5, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.06, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.015, time + beatSec * 3.6);
        gain.gain.linearRampToValueAtTime(0.0001, time + beatSec * 3.9);

        osc.connect(filter);
        subOsc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        gain.connect(delay);

        osc.start(time);
        subOsc.start(time);
        osc.stop(time + beatSec * 3.95);
        subOsc.stop(time + beatSec * 3.95);
      });

      // Bass note
      const bassNote = bassNotes[chordIndex];
      const bassFreq = NOTE_FREQ[bassNote] || 65.41;
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq, time);
      bassGain.gain.setValueAtTime(0.18, time);
      bassGain.gain.exponentialRampToValueAtTime(0.03, time + beatSec * 3.5);
      bassGain.gain.linearRampToValueAtTime(0.0001, time + beatSec * 3.9);
      bassOsc.connect(bassGain);
      bassGain.connect(masterGain);
      bassOsc.start(time);
      bassOsc.stop(time + beatSec * 3.95);
    }

    // Drums (Kick on 1 & 3, Snare/Rimshot on 2 & 4, soft swing hi-hats on 8ths)
    for (let beat = 0; beat < totalBeats; beat++) {
      const time = beat * beatSec;
      if (time >= durationSec - 1) break;

      // Kick drum on beat 0 and beat 2.5
      if (beat % 4 === 0 || (beat % 4 === 2 && Math.random() > 0.4)) {
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.frequency.setValueAtTime(130, time);
        kickOsc.frequency.exponentialRampToValueAtTime(42, time + 0.12);
        kickGain.gain.setValueAtTime(0.35, time);
        kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
        kickOsc.connect(kickGain);
        kickGain.connect(masterGain);
        kickOsc.start(time);
        kickOsc.stop(time + 0.3);
      }

      // Snare on beat 1 and 3 (0-indexed: beat 1 and 3 of every 4)
      if (beat % 4 === 1 || beat % 4 === 3) {
        // Noise snare
        const bufferSize = ctx.sampleRate * 0.15;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1100, time);
        const snareGain = ctx.createGain();
        snareGain.gain.setValueAtTime(0.16, time);
        snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

        noise.connect(filter);
        filter.connect(snareGain);
        snareGain.connect(masterGain);
        noise.start(time);
        noise.stop(time + 0.15);
      }

      // Hi-hats
      const hatTimes = [time, time + beatSec * 0.5];
      hatTimes.forEach((hTime) => {
        if (hTime >= durationSec - 0.5) return;
        const hatSize = ctx.sampleRate * 0.04;
        const hatBuffer = ctx.createBuffer(1, hatSize, ctx.sampleRate);
        const hData = hatBuffer.getChannelData(0);
        for (let i = 0; i < hatSize; i++) {
          hData[i] = (Math.random() * 2 - 1) * 0.12;
        }
        const hatSrc = ctx.createBufferSource();
        hatSrc.buffer = hatBuffer;
        const hFilter = ctx.createBiquadFilter();
        hFilter.type = 'highpass';
        hFilter.frequency.setValueAtTime(6500, hTime);
        const hGain = ctx.createGain();
        hGain.gain.setValueAtTime(0.04, hTime);
        hGain.gain.exponentialRampToValueAtTime(0.001, hTime + 0.035);

        hatSrc.connect(hFilter);
        hFilter.connect(hGain);
        hGain.connect(masterGain);
        hatSrc.start(hTime);
        hatSrc.stop(hTime + 0.04);
      });
    }

  } else if (preset === 'synthwave') {
    // Synthwave: Fast 115 BPM 16th-note driving bass + gated synth chords + melody lead
    const bpm = 115;
    const beatSec = 60 / bpm;
    const totalBeats = Math.floor(durationSec / beatSec);

    // Chords: Am -> F -> C -> G
    const chords = [
      ['A2', 'E3', 'A3', 'C4', 'E4'],
      ['F2', 'C3', 'F3', 'A3', 'C4'],
      ['C3', 'G3', 'C4', 'E4', 'G4'],
      ['G2', 'D3', 'G3', 'B3', 'D4'],
    ];
    const bassRoots = ['A2', 'F2', 'C2', 'G2'];

    // 16th-note driving synth bass
    for (let step = 0; step < totalBeats * 4; step++) {
      const stepTime = step * (beatSec / 4);
      if (stepTime >= durationSec - 1) break;
      const chordIndex = Math.floor((step / 16) % chords.length);
      const root = bassRoots[chordIndex];
      const freq = NOTE_FREQ[root] || 110;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, stepTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, stepTime);
      filter.Q.value = 4;

      gain.gain.setValueAtTime(0.12, stepTime);
      gain.gain.exponentialRampToValueAtTime(0.01, stepTime + beatSec * 0.22);
      gain.gain.linearRampToValueAtTime(0.0001, stepTime + beatSec * 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(stepTime);
      osc.stop(stepTime + beatSec * 0.25);
    }

    // Synth Pads
    for (let beat = 0; beat < totalBeats; beat += 4) {
      const chordIndex = Math.floor((beat / 4) % chords.length);
      const chord = chords[chordIndex];
      const time = beat * beatSec;

      chord.forEach((note) => {
        const freq = NOTE_FREQ[note] || 440;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.04, time + 0.3);
        gain.gain.setValueAtTime(0.04, time + beatSec * 3.4);
        gain.gain.exponentialRampToValueAtTime(0.001, time + beatSec * 3.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(delay);
        gain.connect(masterGain);

        osc.start(time);
        osc.stop(time + beatSec * 3.95);
      });
    }

    // Four on the floor kick + synth snare
    for (let beat = 0; beat < totalBeats; beat++) {
      const time = beat * beatSec;
      if (time >= durationSec - 1) break;

      // Kick every beat
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.frequency.setValueAtTime(160, time);
      kickOsc.frequency.exponentialRampToValueAtTime(45, time + 0.15);
      kickGain.gain.setValueAtTime(0.4, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
      kickOsc.connect(kickGain);
      kickGain.connect(masterGain);
      kickOsc.start(time);
      kickOsc.stop(time + 0.25);

      // Snare on beat 1 and 3
      if (beat % 2 === 1) {
        const snareOsc = ctx.createOscillator();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(220, time);
        snareOsc.frequency.exponentialRampToValueAtTime(120, time + 0.1);
        const snareGain = ctx.createGain();
        snareGain.gain.setValueAtTime(0.2, time);
        snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        snareOsc.connect(snareGain);
        snareGain.connect(masterGain);
        snareOsc.start(time);
        snareOsc.stop(time + 0.2);
      }
    }

  } else if (preset === 'bossa') {
    // Bossa Nova: Gentle syncopated classical guitar + mellow acoustic bass + soft brush rhythm
    const bpm = 124;
    const beatSec = 60 / bpm;
    const totalBeats = Math.floor(durationSec / beatSec);

    // Chords: Dmaj7 -> Bm7 -> Em7 -> A7
    const chords = [
      ['D3', 'F#3', 'A3', 'C#4', 'E4'],
      ['B2', 'D3', 'F#3', 'A3', 'D4'],
      ['E3', 'G3', 'B3', 'D4', 'G4'],
      ['A2', 'C#3', 'E3', 'G3', 'C#4'],
    ];

    // Syncopated acoustic guitar rhythm
    for (let beat = 0; beat < totalBeats; beat += 4) {
      const chordIndex = Math.floor((beat / 4) % chords.length);
      const chord = chords[chordIndex];
      const barTime = beat * beatSec;

      // Classic Bossa Nova rhythmic pattern: 1, 1.75, 2.5, 3.5
      const strumOffsets = [0, 1.5, 2.5, 3.25];
      strumOffsets.forEach((offset) => {
        const time = barTime + offset * beatSec;
        if (time >= durationSec - 1) return;

        chord.forEach((note, noteIdx) => {
          const freq = NOTE_FREQ[note] || 261.63;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const strumDelay = noteIdx * 0.015;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time + strumDelay);

          gain.gain.setValueAtTime(0.001, time + strumDelay);
          gain.gain.linearRampToValueAtTime(0.05, time + strumDelay + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.005, time + strumDelay + beatSec * 0.6);
          gain.gain.linearRampToValueAtTime(0.0001, time + strumDelay + beatSec * 0.7);

          osc.connect(gain);
          gain.connect(masterGain);
          gain.connect(delay);

          osc.start(time + strumDelay);
          osc.stop(time + strumDelay + beatSec * 0.75);
        });
      });

      // Warm acoustic bass on 1 and 3
      const bassNote = chords[chordIndex][0];
      const bassFreq = (NOTE_FREQ[bassNote] || 146.83) * 0.5;
      [0, 2].forEach((offset) => {
        const time = barTime + offset * beatSec;
        if (time >= durationSec - 1) return;

        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, time);
        bassGain.gain.setValueAtTime(0.18, time);
        bassGain.gain.exponentialRampToValueAtTime(0.01, time + beatSec * 1.6);
        bassGain.gain.linearRampToValueAtTime(0.0001, time + beatSec * 1.8);

        bassOsc.connect(bassGain);
        bassGain.connect(masterGain);
        bassOsc.start(time);
        bassOsc.stop(time + beatSec * 1.9);
      });
    }

  } else if (preset === 'acoustic') {
    // Indie Folk Fingerstyle Acoustic: Arpeggiated guitar pattern with open strings
    const bpm = 92;
    const beatSec = 60 / bpm;
    const totalBeats = Math.floor(durationSec / beatSec);

    // Progression: G -> D/F# -> Em7 -> Cadd9
    const patterns = [
      ['G2', 'D3', 'G3', 'B3', 'D4', 'G4', 'D4', 'B3'],
      ['F#2', 'D3', 'F#3', 'A3', 'D4', 'F#4', 'D4', 'A3'],
      ['E2', 'B2', 'E3', 'G3', 'B3', 'E4', 'B3', 'G3'],
      ['C3', 'G3', 'C4', 'E4', 'G4', 'C5', 'G4', 'E4'],
    ];

    for (let beat = 0; beat < totalBeats; beat += 4) {
      const progIdx = Math.floor((beat / 4) % patterns.length);
      const notes = patterns[progIdx];
      const barTime = beat * beatSec;

      notes.forEach((note, step) => {
        const time = barTime + step * (beatSec * 0.5);
        if (time >= durationSec - 1) return;
        const freq = NOTE_FREQ[note] || 261.63;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.06, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.006, time + beatSec * 0.8);
        gain.gain.linearRampToValueAtTime(0.0001, time + beatSec * 1.1);

        osc.connect(gain);
        gain.connect(delay);
        gain.connect(masterGain);

        osc.start(time);
        osc.stop(time + beatSec * 1.2);
      });
    }

  } else {
    // Ambient night: deep peaceful meditation drone
    const droneFreqs = [55, 110, 164.81, 220, 329.63];
    droneFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, 0);

      gain.gain.setValueAtTime(0.03 / (idx + 1), 0);
      osc.connect(gain);
      gain.connect(delay);
      gain.connect(masterGain);
      osc.start(0);
      osc.stop(durationSec);
    });
  }

  const renderedBuffer = await ctx.startRendering();
  return bufferToWav(renderedBuffer);
}

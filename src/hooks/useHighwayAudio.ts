"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * useHighwayAudio — Warm Web Audio API road-trip synthesizer & playful sound effects
 *
 * Features:
 * - Warm ambient horizon breeze + gentle major-9th sunlit road-trip harmonic pad
 * - Playful one-shot chimes: `playStampChime()` (when stamping a checkpoint) and `playHornBeep()`
 * - Strictly user-initiated, zero external network audio dependencies, clean fade on mute/unmount.
 */
export function useHighwayAudio() {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const padOscsRef = useRef<OscillatorNode[]>([]);

  const ensureContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctxRef.current) {
      ctxRef.current = new AudioCtx();
    }
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const stopEngine = useCallback(() => {
    try {
      if (masterGainRef.current && ctxRef.current) {
        const now = ctxRef.current.currentTime;
        masterGainRef.current.gain.cancelScheduledValues(now);
        masterGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.35);
      }
      setTimeout(() => {
        try {
          sourceNodeRef.current?.stop();
        } catch {
          // Already stopped
        }
        padOscsRef.current.forEach((osc) => {
          try {
            osc.stop();
          } catch {
            // Already stopped
          }
        });
        sourceNodeRef.current = null;
        padOscsRef.current = [];
      }, 380);
    } catch {
      // Ignore cleanup errors
    }
    setAudioEnabled(false);
  }, []);

  const startEngine = useCallback(() => {
    try {
      const ctx = ensureContext();
      if (!ctx) return;

      if (sourceNodeRef.current) {
        setAudioEnabled(true);
        return;
      }

      // 1. Soft warm highway pink-filtered breeze buffer (4s seamless loop)
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.045;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 300;

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.14;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 95;
      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);
      lfo.start();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.9);

      noiseSource.connect(lowpass);
      lowpass.connect(masterGain);

      // 2. Warm major-9th sunlit road-trip harmonic pad (D3, A3, E4, F#4)
      const padFreqs = [146.83, 220.0, 329.63, 369.99];
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.value = 620;
      const padGain = ctx.createGain();
      padGain.gain.value = 0.11;
      padFilter.connect(padGain);
      padGain.connect(masterGain);

      const oscs: OscillatorNode[] = [lfo];
      padFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.value = freq;
        const voiceGain = ctx.createGain();
        voiceGain.gain.value = 0.22 / padFreqs.length;
        osc.connect(voiceGain);
        voiceGain.connect(padFilter);
        osc.start();
        oscs.push(osc);
      });

      masterGain.connect(ctx.destination);
      noiseSource.start();

      sourceNodeRef.current = noiseSource;
      masterGainRef.current = masterGain;
      padOscsRef.current = oscs;
      setAudioEnabled(true);
    } catch {
      setAudioEnabled(false);
    }
  }, [ensureContext]);

  const toggleAudio = useCallback(() => {
    if (audioEnabled) {
      stopEngine();
    } else {
      startEngine();
    }
  }, [audioEnabled, startEngine, stopEngine]);

  /** Joyful two-note passport stamp chime (only plays when audio is enabled) */
  const playStampChime = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const ctx = ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5 cheerful triad
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.0001, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.38);
      });
    } catch {
      // Ignore audio errors
    }
  }, [audioEnabled, ensureContext]);

  /** Playful vintage Indian highway "Beep-Beep!" horn chirp (plays on explicit user click) */
  const playHornBeep = useCallback(() => {
    try {
      const ctx = ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [0, 0.16].forEach((offset) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sawtooth";
        osc2.type = "triangle";
        osc1.frequency.setValueAtTime(440, now + offset);
        osc2.frequency.setValueAtTime(554.37, now + offset);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1200;

        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.linearRampToValueAtTime(0.075, now + offset + 0.015);
        gain.gain.linearRampToValueAtTime(0.0001, now + offset + 0.11);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now + offset);
        osc2.start(now + offset);
        osc1.stop(now + offset + 0.12);
        osc2.stop(now + offset + 0.12);
      });
    } catch {
      // Ignore audio errors
    }
  }, [ensureContext]);

  useEffect(() => {
    return () => {
      try {
        sourceNodeRef.current?.stop();
        padOscsRef.current.forEach((osc) => {
          try {
            osc.stop();
          } catch {
            // Already stopped
          }
        });
        if (ctxRef.current && ctxRef.current.state !== "closed") {
          void ctxRef.current.close();
        }
      } catch {
        // Ignore teardown failures
      }
    };
  }, []);

  return {
    audioEnabled,
    startAudio: startEngine,
    stopAudio: stopEngine,
    toggleAudio,
    playStampChime,
    playHornBeep,
  };
}

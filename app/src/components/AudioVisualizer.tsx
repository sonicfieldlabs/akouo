import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  file: File;
}

export function AudioVisualizer({ file }: AudioVisualizerProps) {
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const spectrumRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function visualize() {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();

      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        if (cancelled) return;

        if (waveformRef.current) {
          drawWaveform(audioBuffer, waveformRef.current);
        }

        if (!cancelled && spectrumRef.current) {
          await drawSpectrum(audioBuffer, spectrumRef.current, () => cancelled);
        }
      } catch {
        if (!cancelled) {
          clearCanvas(waveformRef.current);
          clearCanvas(spectrumRef.current);
        }
      } finally {
        if (audioCtx.state !== 'closed') {
          await audioCtx.close().catch(() => undefined);
        }
      }
    }

    void visualize();
    return () => { cancelled = true; };
  }, [file]);

  return (
    <div className="audio-visualizer-stack">
      <div className="audio-visualizer-panel">
        <header className="audio-visualizer-header">WAVEFORM</header>
        <canvas ref={waveformRef} width={800} height={100} className="audio-visualizer-canvas" />
      </div>
      <div className="audio-visualizer-panel">
        <header className="audio-visualizer-header">FREQUENCY SPECTRUM</header>
        <canvas ref={spectrumRef} width={800} height={100} className="audio-visualizer-canvas" />
      </div>
    </div>
  );
}

function clearCanvas(canvas: HTMLCanvasElement | null) {
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawWaveform(audioBuffer: AudioBuffer, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const channelData = audioBuffer.getChannelData(0);
  const step = Math.ceil(channelData.length / width);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.strokeStyle = 'var(--fui-cyan)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (let x = 0; x < width; x++) {
    const start = x * step;
    const end = Math.min(start + step, channelData.length);
    let min = 1;
    let max = -1;

    for (let i = start; i < end; i++) {
      const sample = channelData[i];
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }

    const yMin = ((1 - min) / 2) * height;
    const yMax = ((1 - max) / 2) * height;

    if (x === 0) {
      ctx.moveTo(x, yMax);
    } else {
      ctx.lineTo(x, yMax);
    }

    ctx.fillRect(x, yMax, 1, yMin - yMax);
  }
  ctx.stroke();

  // Center line
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

async function drawSpectrum(audioBuffer: AudioBuffer, canvas: HTMLCanvasElement, isCancelled: () => boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  const audioCtx = new AudioContextClass();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.8;

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);

  const binCount = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(binCount);
  const frames: number[][] = [];

  try {
    source.start();

    const sampleInterval = 50; // ms
    const maxDuration = Math.min(audioBuffer.duration * 1000, 10000);
    const samples = Math.floor(maxDuration / sampleInterval);

    for (let i = 0; i < samples; i++) {
      if (isCancelled()) return;
      await new Promise((resolve) => setTimeout(resolve, sampleInterval));
      if (isCancelled()) return;
      analyser.getByteFrequencyData(dataArray);
      frames.push([...dataArray]);
    }
  } finally {
    if (audioCtx.state !== 'closed') {
      await audioCtx.close().catch(() => undefined);
    }
  }

  if (isCancelled() || frames.length === 0) return;

  const avg = new Float32Array(binCount);
  for (const frame of frames) {
    for (let i = 0; i < binCount; i++) {
      avg[i] += frame[i];
    }
  }
  for (let i = 0; i < binCount; i++) {
    avg[i] /= frames.length;
  }

  const width = canvas.width;
  const height = canvas.height;
  const barWidth = width / binCount;

  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < binCount; i++) {
    const value = avg[i];
    const barHeight = (value / 255) * height;
    const x = i * barWidth;
    const y = height - barHeight;

    const hue = 180 + (value / 255) * 60; // cyan to blue
    ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.7)`;
    ctx.fillRect(x, y, barWidth - 0.5, barHeight);
  }
}

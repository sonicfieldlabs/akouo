import type { AudioFeatures, AudioInspection } from './types';
import { createClaim } from './outputFactory';

export async function inspectAudioFile(file: File): Promise<AudioInspection> {
  const inspection: AudioInspection = {
    fileName: file.name,
    fileType: file.type || 'unknown',
    fileSize: file.size,
    durationSeconds: null,
    sampleRate: null,
    channelCount: null,
    features: {
      peakDbfs: null,
      rmsDbfs: null,
      crestFactorDb: null,
      silenceRatio: null,
      zeroCrossingRate: null,
      dcOffset: null,
      spectralCentroidHz: null,
      spectralRolloffHz: null,
      spectralFlatness: null,
    },
    measuredClaims: [
      createClaim(`File size is ${(file.size / 1024 / 1024).toFixed(2)} MB.`, 'high', 'Browser File metadata'),
      createClaim(`MIME type is ${file.type || 'unknown'}.`, file.type ? 'medium' : 'undetermined', 'Browser File metadata'),
    ],
    warnings: [],
  };

  if (!file.type.startsWith('audio/')) {
    inspection.warnings.push('Selected file is not identified as an audio MIME type.');
    return inspection;
  }

  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    inspection.warnings.push('Web Audio API is unavailable in this browser.');
    return inspection;
  }

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    inspection.durationSeconds = audioBuffer.duration;
    inspection.sampleRate = audioBuffer.sampleRate;
    inspection.channelCount = audioBuffer.numberOfChannels;

    inspection.measuredClaims.push(
      createClaim(`Duration is ${audioBuffer.duration.toFixed(2)} seconds.`, 'high', 'Decoded with Web Audio API'),
      createClaim(`Sample rate is ${audioBuffer.sampleRate} Hz.`, 'high', 'Decoded with Web Audio API'),
      createClaim(`Channel count is ${audioBuffer.numberOfChannels}.`, 'high', 'Decoded with Web Audio API'),
    );

    if (audioBuffer.numberOfChannels > 0) {
      const features = analyzeDecodedAudio(audioBuffer);
      inspection.features = features;

      if (features.peakDbfs !== null && features.rmsDbfs !== null) {
        inspection.measuredClaims.push(
          createClaim(`Peak amplitude is approx ${features.peakDbfs.toFixed(1)} dBFS across decoded channels.`, 'medium', 'Subsampled Web Audio API analysis'),
          createClaim(`RMS level is approx ${features.rmsDbfs.toFixed(1)} dBFS across decoded channels.`, 'medium', 'Subsampled Web Audio API analysis'),
        );
      }

      if (features.crestFactorDb !== null) {
        inspection.measuredClaims.push(
          createClaim(`Crest factor is approx ${features.crestFactorDb.toFixed(1)} dB.`, 'medium', 'Peak minus RMS from subsampled decoded audio'),
        );
      }

      if (features.silenceRatio !== null) {
        inspection.measuredClaims.push(
          createClaim(`Approx ${(features.silenceRatio * 100).toFixed(1)}% of sampled frames sit below -60 dBFS.`, 'medium', 'Subsampled amplitude threshold analysis'),
        );
      }

      if (features.zeroCrossingRate !== null) {
        inspection.measuredClaims.push(
          createClaim(`Zero-crossing rate on channel 1 is approx ${features.zeroCrossingRate.toFixed(0)} crossings per second.`, 'medium', 'Subsampled channel 1 sign-change analysis'),
        );
      }

      if (features.dcOffset !== null && Math.abs(features.dcOffset) > 0.005) {
        inspection.measuredClaims.push(
          createClaim(`Possible DC offset detected at approx ${features.dcOffset.toFixed(4)}.`, 'low', 'Subsampled mean amplitude analysis'),
        );
      }

      if (features.spectralCentroidHz !== null) {
        inspection.measuredClaims.push(
          createClaim(`Spectral centroid is approx ${features.spectralCentroidHz.toFixed(0)} Hz on a sampled channel-1 analysis window.`, 'low', 'Single-window browser-side DFT estimate'),
        );
      }

      if (features.spectralRolloffHz !== null) {
        inspection.measuredClaims.push(
          createClaim(`85% spectral rolloff is approx ${features.spectralRolloffHz.toFixed(0)} Hz on a sampled channel-1 analysis window.`, 'low', 'Single-window browser-side DFT estimate'),
        );
      }

      if (features.spectralFlatness !== null) {
        inspection.measuredClaims.push(
          createClaim(`Spectral flatness is approx ${features.spectralFlatness.toFixed(3)} on a sampled channel-1 analysis window.`, 'low', 'Single-window browser-side DFT estimate'),
        );
      }

      if (features.peakDbfs !== null && features.peakDbfs >= -0.1) {
        inspection.measuredClaims.push(
          createClaim('Signal shows potential clipping because decoded peak is >= -0.1 dBFS.', 'medium', 'Subsampled Web Audio API analysis'),
        );
      }
    }
  } catch (err) {
    inspection.warnings.push('Browser could not decode this audio file for basic metadata inspection.');
  } finally {
    if (audioContext.state !== 'closed') {
      await audioContext.close();
    }
  }

  return inspection;
}

function analyzeDecodedAudio(audioBuffer: AudioBuffer): AudioFeatures {
  let peak = 0;
  let sumSquares = 0;
  let silentSamples = 0;
  let totalSamples = 0;
  let dcSum = 0;
  let zeroCrossings = 0;
  let zeroCrossingSamples = 0;
  let previousChannelOneSample = 0;
  let hasPreviousChannelOneSample = false;

  const silenceThreshold = Math.pow(10, -60 / 20);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const step = Math.max(1, Math.floor(channelData.length / 500000));

    for (let index = 0; index < channelData.length; index += step) {
      const sample = channelData[index];
      const absoluteSample = Math.abs(sample);

      if (absoluteSample > peak) peak = absoluteSample;
      if (absoluteSample < silenceThreshold) silentSamples++;

      sumSquares += sample * sample;
      dcSum += sample;
      totalSamples++;

      if (channel === 0) {
        if (hasPreviousChannelOneSample && crossesZero(previousChannelOneSample, sample)) {
          zeroCrossings++;
        }
        previousChannelOneSample = sample;
        hasPreviousChannelOneSample = true;
        zeroCrossingSamples++;
      }
    }
  }

  if (totalSamples === 0) {
    return {
      peakDbfs: null,
      rmsDbfs: null,
      crestFactorDb: null,
      silenceRatio: null,
      zeroCrossingRate: null,
      dcOffset: null,
      spectralCentroidHz: null,
      spectralRolloffHz: null,
      spectralFlatness: null,
    };
  }

  const spectralFeatures = analyzeSpectralWindow(audioBuffer);
  const rms = Math.sqrt(sumSquares / totalSamples);
  const peakDbfs = toDbfs(peak);
  const rmsDbfs = toDbfs(rms);
  return {
    peakDbfs,
    rmsDbfs,
    crestFactorDb: peakDbfs - rmsDbfs,
    silenceRatio: silentSamples / totalSamples,
    zeroCrossingRate: zeroCrossingSamples > 0 && audioBuffer.duration > 0 ? zeroCrossings / audioBuffer.duration : null,
    dcOffset: dcSum / totalSamples,
    ...spectralFeatures,
  };
}

function analyzeSpectralWindow(audioBuffer: AudioBuffer): Pick<AudioFeatures, 'spectralCentroidHz' | 'spectralRolloffHz' | 'spectralFlatness'> {
  if (audioBuffer.numberOfChannels === 0) {
    return emptySpectralFeatures();
  }

  const channelData = audioBuffer.getChannelData(0);
  const windowSize = Math.min(2048, largestPowerOfTwo(channelData.length));
  if (windowSize < 64) {
    return emptySpectralFeatures();
  }

  const start = Math.max(0, Math.floor((channelData.length - windowSize) / 2));
  const magnitudes: number[] = [];
  let magnitudeSum = 0;
  let weightedFrequencySum = 0;
  let logMagnitudeSum = 0;

  for (let bin = 1; bin < windowSize / 2; bin++) {
    let real = 0;
    let imaginary = 0;

    for (let index = 0; index < windowSize; index++) {
      const sample = channelData[start + index] * hann(index, windowSize);
      const angle = (2 * Math.PI * bin * index) / windowSize;
      real += sample * Math.cos(angle);
      imaginary -= sample * Math.sin(angle);
    }

    const magnitude = Math.sqrt(real * real + imaginary * imaginary);
    const frequency = (bin * audioBuffer.sampleRate) / windowSize;
    magnitudes.push(magnitude);
    magnitudeSum += magnitude;
    weightedFrequencySum += frequency * magnitude;
    logMagnitudeSum += Math.log(magnitude + 1e-12);
  }

  if (magnitudeSum <= 0 || magnitudes.length === 0) {
    return emptySpectralFeatures();
  }

  const spectralCentroidHz = weightedFrequencySum / magnitudeSum;
  const spectralRolloffHz = rolloffFrequency(magnitudes, magnitudeSum, audioBuffer.sampleRate, windowSize);
  const arithmeticMean = magnitudeSum / magnitudes.length;
  const geometricMean = Math.exp(logMagnitudeSum / magnitudes.length);

  return {
    spectralCentroidHz,
    spectralRolloffHz,
    spectralFlatness: arithmeticMean > 0 ? geometricMean / arithmeticMean : null,
  };
}

function emptySpectralFeatures(): Pick<AudioFeatures, 'spectralCentroidHz' | 'spectralRolloffHz' | 'spectralFlatness'> {
  return {
    spectralCentroidHz: null,
    spectralRolloffHz: null,
    spectralFlatness: null,
  };
}

function rolloffFrequency(magnitudes: number[], magnitudeSum: number, sampleRate: number, windowSize: number): number | null {
  const threshold = magnitudeSum * 0.85;
  let cumulative = 0;

  for (let index = 0; index < magnitudes.length; index++) {
    cumulative += magnitudes[index];
    if (cumulative >= threshold) {
      const bin = index + 1;
      return (bin * sampleRate) / windowSize;
    }
  }

  return null;
}

function largestPowerOfTwo(value: number): number {
  return 2 ** Math.floor(Math.log2(Math.max(1, value)));
}

function hann(index: number, windowSize: number): number {
  return 0.5 * (1 - Math.cos((2 * Math.PI * index) / (windowSize - 1)));
}

function crossesZero(previous: number, current: number): boolean {
  return (previous < 0 && current >= 0) || (previous >= 0 && current < 0);
}

function toDbfs(value: number): number {
  return 20 * Math.log10(value || 1e-10);
}

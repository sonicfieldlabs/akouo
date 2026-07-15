import type { AudioFeatures, AudioInspection, BandEnergy } from './types';
import { createClaim } from './outputFactory';

// Heavy passes (loudness, spectral survey) stop after this many seconds so
// very long files cannot freeze the browser tab.
const HEAVY_ANALYSIS_MAX_SECONDS = 600;
// Onset analysis needs contiguous frames, so it runs on one mid-file segment.
const ONSET_SEGMENT_MAX_SECONDS = 60;
const SURVEY_WINDOW = 2048;
const SURVEY_MAX_FRAMES = 900;
const ONSET_WINDOW = 1024;
const ONSET_HOP = 512;
const ONSET_MIN_SEPARATION_SECONDS = 0.05;
const CLIP_THRESHOLD = 0.999;

export async function inspectAudioFile(file: File): Promise<AudioInspection> {
  const inspection: AudioInspection = {
    fileName: file.name,
    fileType: file.type || 'unknown',
    fileSize: file.size,
    durationSeconds: null,
    sampleRate: null,
    channelCount: null,
    features: createEmptyFeatures(),
    measuredClaims: [
      createClaim(`File size is ${(file.size / 1024 / 1024).toFixed(2)} MB.`, 'high', 'Browser File metadata'),
      createClaim(`MIME type is ${file.type || 'unknown'}.`, file.type ? 'medium' : 'undetermined', 'Browser File metadata'),
    ],
    warnings: [],
  };

  if (file.type && !file.type.startsWith('audio/') && file.type !== 'video/ogg') {
    inspection.warnings.push('Selected file is not identified as an audio MIME type; attempting browser decode anyway.');
  } else if (!file.type) {
    inspection.warnings.push('Selected file has no MIME type; attempting browser decode from file content.');
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

      if (features.analyzedSeconds !== null && audioBuffer.duration - features.analyzedSeconds > 1) {
        inspection.warnings.push(
          `Heavy analysis covered the first ${Math.round(features.analyzedSeconds)} s of ${Math.round(audioBuffer.duration)} s; later content is not measured.`,
        );
      }

      pushFeatureClaims(inspection, features);
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

function pushFeatureClaims(inspection: AudioInspection, features: AudioFeatures) {
  const claims = inspection.measuredClaims;

  if (features.peakDbfs !== null && features.rmsDbfs !== null) {
    claims.push(
      createClaim(`Peak amplitude is approx ${features.peakDbfs.toFixed(1)} dBFS across decoded channels.`, 'medium', 'Subsampled Web Audio API analysis'),
      createClaim(`RMS level is approx ${features.rmsDbfs.toFixed(1)} dBFS across decoded channels.`, 'medium', 'Subsampled Web Audio API analysis'),
    );
  }

  if (features.crestFactorDb !== null) {
    claims.push(
      createClaim(`Crest factor is approx ${features.crestFactorDb.toFixed(1)} dB.`, 'medium', 'Peak minus RMS from subsampled decoded audio'),
    );
  }

  if (features.integratedLufs !== null) {
    claims.push(
      createClaim(`Integrated loudness is approx ${features.integratedLufs.toFixed(1)} LUFS.`, 'medium', 'BS.1770-style K-weighting with absolute and relative gating; browser approximation, not a certified meter'),
    );
  }

  if (features.loudnessRangeLu !== null) {
    claims.push(
      createClaim(`Loudness range is approx ${features.loudnessRangeLu.toFixed(1)} LU.`, 'medium', '10th-95th percentile of gated 3 s short-term loudness; browser approximation'),
    );
  }

  if (features.silenceRatio !== null) {
    claims.push(
      createClaim(`Approx ${(features.silenceRatio * 100).toFixed(1)}% of sampled frames sit below -60 dBFS.`, 'medium', 'Subsampled amplitude threshold analysis'),
    );
  }

  if (features.zeroCrossingRate !== null) {
    claims.push(
      createClaim(`Zero-crossing rate on channel 1 is approx ${features.zeroCrossingRate.toFixed(0)} crossings per second.`, 'medium', 'Full-resolution mid-file window (up to 10 s) on channel 1'),
    );
  }

  if (features.dcOffset !== null && Math.abs(features.dcOffset) > 0.005) {
    claims.push(
      createClaim(`Possible DC offset detected at approx ${features.dcOffset.toFixed(4)}.`, 'low', 'Subsampled mean amplitude analysis'),
    );
  }

  if (features.spectralCentroidHz !== null) {
    const spread = features.spectralCentroidStdHz !== null ? `, std ${features.spectralCentroidStdHz.toFixed(0)} Hz across windows` : '';
    claims.push(
      createClaim(`Spectral centroid is approx ${features.spectralCentroidHz.toFixed(0)} Hz (mean over sampled windows${spread}).`, 'medium', `FFT analysis of up to ${SURVEY_MAX_FRAMES} windows on channel 1`),
    );
  }

  if (features.spectralRolloffHz !== null) {
    claims.push(
      createClaim(`85% spectral rolloff is approx ${features.spectralRolloffHz.toFixed(0)} Hz (mean over sampled windows).`, 'medium', 'FFT analysis of sampled windows on channel 1'),
    );
  }

  if (features.spectralFlatness !== null) {
    claims.push(
      createClaim(`Spectral flatness is approx ${features.spectralFlatness.toFixed(3)} (mean over sampled windows).`, 'medium', 'FFT analysis of sampled windows on channel 1'),
    );
  }

  if (features.bandEnergy !== null) {
    const be = features.bandEnergy;
    claims.push(
      createClaim(
        `Band energy distribution is approx sub ${formatPercent(be.sub)}, bass ${formatPercent(be.bass)}, low-mid ${formatPercent(be.lowMid)}, mid ${formatPercent(be.mid)}, high ${formatPercent(be.high)}, air ${formatPercent(be.air)}.`,
        'medium',
        'Magnitude-squared energy in <60, 60-250, 250-1k, 1k-4k, 4k-10k, >10k Hz bands over sampled windows',
      ),
    );
  }

  if (features.onsetCount !== null && features.onsetDensityPerSec !== null) {
    claims.push(
      createClaim(
        `Approx ${features.onsetCount} onsets detected in a contiguous mid-file segment (≈${features.onsetDensityPerSec.toFixed(2)} onsets per second).`,
        'medium',
        `Spectral-flux peak picking over up to ${ONSET_SEGMENT_MAX_SECONDS} s on channel 1`,
      ),
    );
  }

  if (features.bpmCandidate !== null) {
    claims.push(
      createClaim(
        `A pulse near ${features.bpmCandidate.toFixed(1)} BPM is one possible tempo reading from inter-onset intervals.`,
        'low',
        'Median inter-onset interval folded into 70-180 BPM; rhythm, meter, and half/double-time remain unverified',
      ),
    );
  }

  if (features.interChannelCorrelation !== null) {
    claims.push(
      createClaim(`Inter-channel correlation is approx ${features.interChannelCorrelation.toFixed(2)} between channels 1 and 2.`, 'medium', 'Subsampled Pearson correlation; +1 mono-like, 0 decorrelated, negative values suggest phase issues'),
    );
  }

  if (features.stereoWidth !== null) {
    claims.push(
      createClaim(`Approx ${(features.stereoWidth * 100).toFixed(0)}% of stereo energy sits in the side (L-R) signal.`, 'medium', 'Mid/side energy split from subsampled channels 1-2'),
    );
  }

  if (features.channelBalanceDb !== null && Math.abs(features.channelBalanceDb) > 0.5) {
    claims.push(
      createClaim(`Channel balance is approx ${features.channelBalanceDb.toFixed(1)} dB (positive = channel 1 louder).`, 'medium', 'Subsampled per-channel RMS comparison'),
    );
  }

  if (features.clippedSampleRatio !== null && features.clippedSampleRatio > 0.00005) {
    claims.push(
      createClaim(`Approx ${(features.clippedSampleRatio * 100).toFixed(3)}% of sampled amplitudes sit at or above ${(CLIP_THRESHOLD * 100).toFixed(1)}% full scale, consistent with clipping or hard limiting.`, 'medium', 'Subsampled near-full-scale ratio; true-peak metering remains deferred'),
    );
  } else if (features.peakDbfs !== null && features.peakDbfs >= -0.1) {
    claims.push(
      createClaim('Signal shows potential clipping because decoded peak is >= -0.1 dBFS.', 'medium', 'Subsampled Web Audio API analysis'),
    );
  }
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function createEmptyFeatures(): AudioFeatures {
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
    spectralCentroidStdHz: null,
    bandEnergy: null,
    integratedLufs: null,
    loudnessRangeLu: null,
    onsetCount: null,
    onsetDensityPerSec: null,
    bpmCandidate: null,
    interChannelCorrelation: null,
    stereoWidth: null,
    channelBalanceDb: null,
    clippedSampleRatio: null,
    analyzedSeconds: null,
  };
}

function analyzeDecodedAudio(audioBuffer: AudioBuffer): AudioFeatures {
  const features = createEmptyFeatures();
  const analyzedLength = Math.min(
    audioBuffer.length,
    Math.floor(HEAVY_ANALYSIS_MAX_SECONDS * audioBuffer.sampleRate),
  );

  if (analyzedLength === 0) {
    return features;
  }

  features.analyzedSeconds = analyzedLength / audioBuffer.sampleRate;

  let peak = 0;
  let sumSquares = 0;
  let silentSamples = 0;
  let totalSamples = 0;
  let dcSum = 0;
  let clippedSamples = 0;

  const silenceThreshold = Math.pow(10, -60 / 20);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const step = Math.max(1, Math.floor(analyzedLength / 500000));

    for (let index = 0; index < analyzedLength; index += step) {
      const sample = channelData[index];
      const absoluteSample = Math.abs(sample);

      if (absoluteSample > peak) peak = absoluteSample;
      if (absoluteSample < silenceThreshold) silentSamples++;
      if (absoluteSample >= CLIP_THRESHOLD) clippedSamples++;

      sumSquares += sample * sample;
      dcSum += sample;
      totalSamples++;
    }
  }

  if (totalSamples === 0) {
    return features;
  }

  const rms = Math.sqrt(sumSquares / totalSamples);
  features.peakDbfs = toDbfs(peak);
  features.rmsDbfs = toDbfs(rms);
  features.crestFactorDb = features.peakDbfs - features.rmsDbfs;
  features.silenceRatio = silentSamples / totalSamples;
  features.dcOffset = dcSum / totalSamples;
  features.clippedSampleRatio = clippedSamples / totalSamples;
  features.zeroCrossingRate = contiguousZeroCrossingRate(audioBuffer);

  const survey = analyzeSpectralSurvey(audioBuffer, analyzedLength);
  features.spectralCentroidHz = survey.centroidMeanHz;
  features.spectralCentroidStdHz = survey.centroidStdHz;
  features.spectralRolloffHz = survey.rolloffMeanHz;
  features.spectralFlatness = survey.flatnessMean;
  features.bandEnergy = survey.bandEnergy;

  const loudness = analyzeLoudness(audioBuffer, analyzedLength);
  features.integratedLufs = loudness.integratedLufs;
  features.loudnessRangeLu = loudness.loudnessRangeLu;

  const onsets = analyzeOnsets(audioBuffer);
  features.onsetCount = onsets.onsetCount;
  features.onsetDensityPerSec = onsets.onsetDensityPerSec;
  features.bpmCandidate = onsets.bpmCandidate;

  const stereo = analyzeStereo(audioBuffer, analyzedLength);
  features.interChannelCorrelation = stereo.correlation;
  features.stereoWidth = stereo.width;
  features.channelBalanceDb = stereo.balanceDb;

  return features;
}

// Subsampled scans alias the sign function and undercount crossings, so the
// rate is measured on one contiguous mid-file window at full resolution.
function contiguousZeroCrossingRate(audioBuffer: AudioBuffer): number | null {
  if (audioBuffer.numberOfChannels === 0 || audioBuffer.sampleRate <= 0) {
    return null;
  }

  const channelData = audioBuffer.getChannelData(0);
  const windowLength = Math.min(channelData.length, audioBuffer.sampleRate * 10);
  if (windowLength < 2) {
    return null;
  }

  const start = Math.max(0, Math.floor((channelData.length - windowLength) / 2));
  let crossings = 0;

  for (let index = start + 1; index < start + windowLength; index++) {
    if (crossesZero(channelData[index - 1], channelData[index])) {
      crossings++;
    }
  }

  return crossings / (windowLength / audioBuffer.sampleRate);
}

interface SpectralSurvey {
  centroidMeanHz: number | null;
  centroidStdHz: number | null;
  rolloffMeanHz: number | null;
  flatnessMean: number | null;
  bandEnergy: BandEnergy | null;
}

function analyzeSpectralSurvey(audioBuffer: AudioBuffer, analyzedLength: number): SpectralSurvey {
  const empty: SpectralSurvey = {
    centroidMeanHz: null,
    centroidStdHz: null,
    rolloffMeanHz: null,
    flatnessMean: null,
    bandEnergy: null,
  };

  if (audioBuffer.numberOfChannels === 0 || analyzedLength < SURVEY_WINDOW) {
    return empty;
  }

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const frameCount = Math.min(SURVEY_MAX_FRAMES, Math.floor(analyzedLength / SURVEY_WINDOW));
  if (frameCount < 1) {
    return empty;
  }

  const real = new Float32Array(SURVEY_WINDOW);
  const imag = new Float32Array(SURVEY_WINDOW);
  const window = hannWindow(SURVEY_WINDOW);
  const binCount = SURVEY_WINDOW / 2;
  const binHz = sampleRate / SURVEY_WINDOW;

  const centroids: number[] = [];
  let rolloffSum = 0;
  let rolloffFrames = 0;
  let flatnessSum = 0;
  let flatnessFrames = 0;
  const bandSums = { sub: 0, bass: 0, lowMid: 0, mid: 0, high: 0, air: 0 };
  let bandTotal = 0;

  for (let frame = 0; frame < frameCount; frame++) {
    const start = frameCount === 1
      ? 0
      : Math.floor((frame * (analyzedLength - SURVEY_WINDOW)) / (frameCount - 1));

    for (let i = 0; i < SURVEY_WINDOW; i++) {
      real[i] = channelData[start + i] * window[i];
      imag[i] = 0;
    }

    fftInPlace(real, imag);

    let magnitudeSum = 0;
    let weightedFrequencySum = 0;
    let logMagnitudeSum = 0;
    let cumulative = 0;
    let rolloffHz: number | null = null;
    const threshold85: number[] = [];

    // First pass over bins: magnitudes, centroid terms, flatness terms, bands.
    for (let bin = 1; bin < binCount; bin++) {
      const magnitude = Math.hypot(real[bin], imag[bin]);
      const frequency = bin * binHz;
      const energy = magnitude * magnitude;

      magnitudeSum += magnitude;
      weightedFrequencySum += frequency * magnitude;
      logMagnitudeSum += Math.log(magnitude + 1e-12);
      threshold85.push(magnitude);

      bandTotal += energy;
      if (frequency < 60) bandSums.sub += energy;
      else if (frequency < 250) bandSums.bass += energy;
      else if (frequency < 1000) bandSums.lowMid += energy;
      else if (frequency < 4000) bandSums.mid += energy;
      else if (frequency < 10000) bandSums.high += energy;
      else bandSums.air += energy;
    }

    if (magnitudeSum > 0) {
      centroids.push(weightedFrequencySum / magnitudeSum);

      const target = magnitudeSum * 0.85;
      for (let bin = 0; bin < threshold85.length; bin++) {
        cumulative += threshold85[bin];
        if (cumulative >= target) {
          rolloffHz = (bin + 1) * binHz;
          break;
        }
      }
      if (rolloffHz !== null) {
        rolloffSum += rolloffHz;
        rolloffFrames++;
      }

      const arithmeticMean = magnitudeSum / (binCount - 1);
      const geometricMean = Math.exp(logMagnitudeSum / (binCount - 1));
      if (arithmeticMean > 0) {
        flatnessSum += geometricMean / arithmeticMean;
        flatnessFrames++;
      }
    }
  }

  if (centroids.length === 0) {
    return empty;
  }

  const centroidMean = centroids.reduce((sum, value) => sum + value, 0) / centroids.length;
  const centroidVariance = centroids.reduce((sum, value) => sum + (value - centroidMean) ** 2, 0) / centroids.length;

  return {
    centroidMeanHz: centroidMean,
    centroidStdHz: centroids.length > 1 ? Math.sqrt(centroidVariance) : null,
    rolloffMeanHz: rolloffFrames > 0 ? rolloffSum / rolloffFrames : null,
    flatnessMean: flatnessFrames > 0 ? flatnessSum / flatnessFrames : null,
    bandEnergy: bandTotal > 0
      ? {
          sub: bandSums.sub / bandTotal,
          bass: bandSums.bass / bandTotal,
          lowMid: bandSums.lowMid / bandTotal,
          mid: bandSums.mid / bandTotal,
          high: bandSums.high / bandTotal,
          air: bandSums.air / bandTotal,
        }
      : null,
  };
}

interface LoudnessResult {
  integratedLufs: number | null;
  loudnessRangeLu: number | null;
}

// BS.1770-style loudness: per-channel K-weighting (high-shelf + high-pass
// biquads re-derived for the actual sample rate), 100 ms energy chunks,
// 400 ms momentary blocks with -70 LUFS absolute and -10 LU relative gating,
// and an EBU-style loudness range from gated 3 s short-term blocks.
function analyzeLoudness(audioBuffer: AudioBuffer, analyzedLength: number): LoudnessResult {
  const sampleRate = audioBuffer.sampleRate;
  const chunkSamples = Math.round(sampleRate / 10);
  const chunkCount = Math.floor(analyzedLength / chunkSamples);

  if (chunkCount < 4 || audioBuffer.numberOfChannels === 0) {
    return { integratedLufs: null, loudnessRangeLu: null };
  }

  const chunkEnergy = new Float64Array(chunkCount);
  const shelf = kWeightingShelfCoefficients(sampleRate);
  const highpass = kWeightingHighpassCoefficients(sampleRate);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    let s1x1 = 0, s1x2 = 0, s1y1 = 0, s1y2 = 0;
    let s2x1 = 0, s2x2 = 0, s2y1 = 0, s2y2 = 0;

    for (let chunk = 0; chunk < chunkCount; chunk++) {
      const start = chunk * chunkSamples;
      let energy = 0;

      for (let index = start; index < start + chunkSamples; index++) {
        const x = channelData[index];
        const stage1 = shelf.b0 * x + shelf.b1 * s1x1 + shelf.b2 * s1x2 - shelf.a1 * s1y1 - shelf.a2 * s1y2;
        s1x2 = s1x1; s1x1 = x; s1y2 = s1y1; s1y1 = stage1;

        const stage2 = highpass.b0 * stage1 + highpass.b1 * s2x1 + highpass.b2 * s2x2 - highpass.a1 * s2y1 - highpass.a2 * s2y2;
        s2x2 = s2x1; s2x1 = stage1; s2y2 = s2y1; s2y1 = stage2;

        energy += stage2 * stage2;
      }

      // BS.1770 channel weights are 1.0 for L/R/C; surround weighting is out
      // of scope for this browser approximation.
      chunkEnergy[chunk] += energy;
    }
  }

  const blockLoudness = (meanSquare: number) => -0.691 + 10 * Math.log10(meanSquare + 1e-15);

  // Momentary blocks: 400 ms (4 chunks) at 100 ms hop.
  const momentary: Array<{ loudness: number; meanSquare: number }> = [];
  for (let block = 0; block + 4 <= chunkCount; block++) {
    let energy = 0;
    for (let chunk = block; chunk < block + 4; chunk++) energy += chunkEnergy[chunk];
    const meanSquare = energy / (4 * chunkSamples);
    momentary.push({ loudness: blockLoudness(meanSquare), meanSquare });
  }

  const absGated = momentary.filter((block) => block.loudness > -70);
  let integratedLufs: number | null = null;
  if (absGated.length > 0) {
    const absMean = absGated.reduce((sum, block) => sum + block.meanSquare, 0) / absGated.length;
    const relativeThreshold = blockLoudness(absMean) - 10;
    const relGated = absGated.filter((block) => block.loudness > relativeThreshold);
    if (relGated.length > 0) {
      const relMean = relGated.reduce((sum, block) => sum + block.meanSquare, 0) / relGated.length;
      integratedLufs = blockLoudness(relMean);
    }
  }

  // Short-term blocks: 3 s (30 chunks) at 1 s hop, for loudness range.
  let loudnessRangeLu: number | null = null;
  const shortTerm: Array<{ loudness: number; meanSquare: number }> = [];
  for (let block = 0; block + 30 <= chunkCount; block += 10) {
    let energy = 0;
    for (let chunk = block; chunk < block + 30; chunk++) energy += chunkEnergy[chunk];
    const meanSquare = energy / (30 * chunkSamples);
    shortTerm.push({ loudness: blockLoudness(meanSquare), meanSquare });
  }

  const stAbsGated = shortTerm.filter((block) => block.loudness > -70);
  if (stAbsGated.length >= 2) {
    const stMean = stAbsGated.reduce((sum, block) => sum + block.meanSquare, 0) / stAbsGated.length;
    const stThreshold = blockLoudness(stMean) - 20;
    const stGated = stAbsGated.filter((block) => block.loudness > stThreshold).map((block) => block.loudness).sort((a, b) => a - b);
    if (stGated.length >= 2) {
      loudnessRangeLu = percentile(stGated, 0.95) - percentile(stGated, 0.10);
    }
  }

  return { integratedLufs, loudnessRangeLu };
}

// Coefficient derivation follows the commonly used re-parameterization of the
// ITU-R BS.1770 48 kHz filters (as in pyloudnorm/ffmpeg) so any sample rate works.
function kWeightingShelfCoefficients(sampleRate: number) {
  const f0 = 1681.974450955533;
  const gainDb = 3.999843853973347;
  const q = 0.7071752369554196;

  const k = Math.tan((Math.PI * f0) / sampleRate);
  const vh = Math.pow(10, gainDb / 20);
  const vb = Math.pow(vh, 0.4996667741545416);
  const a0 = 1 + k / q + k * k;

  return {
    b0: (vh + (vb * k) / q + k * k) / a0,
    b1: (2 * (k * k - vh)) / a0,
    b2: (vh - (vb * k) / q + k * k) / a0,
    a1: (2 * (k * k - 1)) / a0,
    a2: (1 - k / q + k * k) / a0,
  };
}

function kWeightingHighpassCoefficients(sampleRate: number) {
  const f0 = 38.13547087602444;
  const q = 0.5003270373238773;

  const k = Math.tan((Math.PI * f0) / sampleRate);
  const a0 = 1 + k / q + k * k;

  return {
    b0: 1 / a0,
    b1: -2 / a0,
    b2: 1 / a0,
    a1: (2 * (k * k - 1)) / a0,
    a2: (1 - k / q + k * k) / a0,
  };
}

interface OnsetResult {
  onsetCount: number | null;
  onsetDensityPerSec: number | null;
  bpmCandidate: number | null;
}

function analyzeOnsets(audioBuffer: AudioBuffer): OnsetResult {
  const empty: OnsetResult = { onsetCount: null, onsetDensityPerSec: null, bpmCandidate: null };

  if (audioBuffer.numberOfChannels === 0) {
    return empty;
  }

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const segmentLength = Math.min(channelData.length, Math.floor(ONSET_SEGMENT_MAX_SECONDS * sampleRate));
  if (segmentLength < ONSET_WINDOW * 4) {
    return empty;
  }

  const segmentStart = Math.max(0, Math.floor((channelData.length - segmentLength) / 2));
  const frameCount = Math.floor((segmentLength - ONSET_WINDOW) / ONSET_HOP) + 1;
  if (frameCount < 8) {
    return empty;
  }

  const real = new Float32Array(ONSET_WINDOW);
  const imag = new Float32Array(ONSET_WINDOW);
  const window = hannWindow(ONSET_WINDOW);
  const binCount = ONSET_WINDOW / 2;

  let previousMagnitudes: Float32Array | null = null;
  const flux = new Float32Array(frameCount);

  for (let frame = 0; frame < frameCount; frame++) {
    const start = segmentStart + frame * ONSET_HOP;

    for (let i = 0; i < ONSET_WINDOW; i++) {
      real[i] = channelData[start + i] * window[i];
      imag[i] = 0;
    }

    fftInPlace(real, imag);

    const magnitudes = new Float32Array(binCount);
    for (let bin = 1; bin < binCount; bin++) {
      magnitudes[bin] = Math.hypot(real[bin], imag[bin]);
    }

    if (previousMagnitudes) {
      let frameFlux = 0;
      for (let bin = 1; bin < binCount; bin++) {
        const rise = magnitudes[bin] - previousMagnitudes[bin];
        if (rise > 0) frameFlux += rise;
      }
      flux[frame] = frameFlux;
    }

    previousMagnitudes = magnitudes;
  }

  let fluxMean = 0;
  for (let frame = 1; frame < frameCount; frame++) fluxMean += flux[frame];
  fluxMean /= frameCount - 1;
  let fluxVariance = 0;
  for (let frame = 1; frame < frameCount; frame++) fluxVariance += (flux[frame] - fluxMean) ** 2;
  const fluxStd = Math.sqrt(fluxVariance / (frameCount - 1));

  if (fluxStd === 0) {
    return { onsetCount: 0, onsetDensityPerSec: 0, bpmCandidate: null };
  }

  const threshold = fluxMean + fluxStd;
  const minSeparationFrames = Math.max(1, Math.round((ONSET_MIN_SEPARATION_SECONDS * sampleRate) / ONSET_HOP));
  const onsetTimes: number[] = [];
  let lastOnsetFrame = -minSeparationFrames;

  for (let frame = 2; frame < frameCount - 1; frame++) {
    if (
      flux[frame] > threshold &&
      flux[frame] >= flux[frame - 1] &&
      flux[frame] >= flux[frame + 1] &&
      frame - lastOnsetFrame >= minSeparationFrames
    ) {
      onsetTimes.push((frame * ONSET_HOP + ONSET_WINDOW / 2) / sampleRate);
      lastOnsetFrame = frame;
    }
  }

  const segmentSeconds = segmentLength / sampleRate;
  const result: OnsetResult = {
    onsetCount: onsetTimes.length,
    onsetDensityPerSec: onsetTimes.length / segmentSeconds,
    bpmCandidate: null,
  };

  if (onsetTimes.length >= 8) {
    const intervals: number[] = [];
    for (let i = 1; i < onsetTimes.length; i++) {
      intervals.push(onsetTimes[i] - onsetTimes[i - 1]);
    }
    intervals.sort((a, b) => a - b);
    const medianInterval = percentile(intervals, 0.5);
    const meanInterval = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
    const intervalVariance = intervals.reduce((sum, value) => sum + (value - meanInterval) ** 2, 0) / intervals.length;
    const coefficientOfVariation = meanInterval > 0 ? Math.sqrt(intervalVariance) / meanInterval : 1;

    if (medianInterval > 0 && coefficientOfVariation < 0.25) {
      let bpm = 60 / medianInterval;
      while (bpm < 70) bpm *= 2;
      while (bpm > 180) bpm /= 2;
      result.bpmCandidate = bpm;
    }
  }

  return result;
}

interface StereoResult {
  correlation: number | null;
  width: number | null;
  balanceDb: number | null;
}

function analyzeStereo(audioBuffer: AudioBuffer, analyzedLength: number): StereoResult {
  if (audioBuffer.numberOfChannels < 2) {
    return { correlation: null, width: null, balanceDb: null };
  }

  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);
  const step = Math.max(1, Math.floor(analyzedLength / 500000));

  let n = 0;
  let sumL = 0, sumR = 0, sumLL = 0, sumRR = 0, sumLR = 0;
  let midEnergy = 0, sideEnergy = 0;

  for (let index = 0; index < analyzedLength; index += step) {
    const l = left[index];
    const r = right[index];

    sumL += l; sumR += r;
    sumLL += l * l; sumRR += r * r; sumLR += l * r;

    const mid = (l + r) / 2;
    const side = (l - r) / 2;
    midEnergy += mid * mid;
    sideEnergy += side * side;
    n++;
  }

  if (n === 0) {
    return { correlation: null, width: null, balanceDb: null };
  }

  const covariance = n * sumLR - sumL * sumR;
  const varianceL = n * sumLL - sumL * sumL;
  const varianceR = n * sumRR - sumR * sumR;
  const denominator = Math.sqrt(varianceL * varianceR);

  return {
    correlation: denominator > 0 ? covariance / denominator : null,
    width: midEnergy + sideEnergy > 0 ? sideEnergy / (midEnergy + sideEnergy) : null,
    balanceDb: sumLL > 0 && sumRR > 0 ? 10 * Math.log10(sumLL / sumRR) : null,
  };
}

// Iterative radix-2 Cooley-Tukey FFT; lengths are always powers of two here.
function fftInPlace(real: Float32Array, imag: Float32Array) {
  const n = real.length;

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tempRe = real[i]; real[i] = real[j]; real[j] = tempRe;
      const tempIm = imag[i]; imag[i] = imag[j]; imag[j] = tempIm;
    }
  }

  for (let length = 2; length <= n; length <<= 1) {
    const angle = (-2 * Math.PI) / length;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);
    const half = length >> 1;

    for (let i = 0; i < n; i += length) {
      let curRe = 1;
      let curIm = 0;

      for (let k = 0; k < half; k++) {
        const evenRe = real[i + k];
        const evenIm = imag[i + k];
        const oddRe = real[i + k + half] * curRe - imag[i + k + half] * curIm;
        const oddIm = real[i + k + half] * curIm + imag[i + k + half] * curRe;

        real[i + k] = evenRe + oddRe;
        imag[i + k] = evenIm + oddIm;
        real[i + k + half] = evenRe - oddRe;
        imag[i + k + half] = evenIm - oddIm;

        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

function hannWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
  }
  return window;
}

function percentile(sortedValues: number[], fraction: number): number {
  if (sortedValues.length === 0) return 0;
  const position = (sortedValues.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sortedValues[lower];
  const weight = position - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

function crossesZero(previous: number, current: number): boolean {
  return (previous < 0 && current >= 0) || (previous >= 0 && current < 0);
}

function toDbfs(value: number): number {
  return 20 * Math.log10(value || 1e-10);
}

import { AcousticMetrics, SimulationParams } from '../types';

export const SPEED_OF_SOUND_DEFAULT = 343; // m/s at 20C

export const calculateSpeedOfSound = (tempCelsius: number): number => {
  // V = 331.4 + 0.6 * Tc
  return 331.4 + 0.6 * tempCelsius;
};

export const calculateMetrics = (params: SimulationParams): AcousticMetrics => {
  const speed = calculateSpeedOfSound(params.temperature);
  const wavelength = speed / params.frequency;
  const ratio = params.obstacleSize / wavelength;

  let behavior: AcousticMetrics['behavior'] = 'TRANSITIONAL';
  
  // If obstacle is significantly larger than wavelength (e.g. > 1x), Reflection dominates
  // If obstacle is smaller (e.g. < 1x), Diffraction dominates
  if (ratio > 1.0) {
    behavior = 'REFLECTING';
  } else if (ratio < 0.5) {
    behavior = 'DIFFRACTING';
  }

  return {
    speedOfSound: speed,
    wavelength,
    ratio,
    behavior,
  };
};

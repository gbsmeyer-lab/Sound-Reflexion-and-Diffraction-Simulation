export interface SimulationParams {
  frequency: number; // in Hertz
  obstacleSize: number; // in Meters (height of the wall)
  temperature: number; // in Celsius (affects speed of sound)
}

export interface AcousticMetrics {
  wavelength: number; // in Meters
  speedOfSound: number; // in m/s
  ratio: number; // Obstacle Size / Wavelength
  behavior: 'REFLECTING' | 'DIFFRACTING' | 'TRANSITIONAL';
}

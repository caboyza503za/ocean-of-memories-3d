export const CONFIG = {
  world: {
    size: 250,
    depth: 60,
    fogDensity: 0.010,
    fogColor: 0x1A1025, // Deep purple/blue
    bgColor: 0x100A1A,
    ambientColor: 0x4DA8C8,
    surfaceLightColor: 0xFFB6C1, 
    floorColor: 0xD4B96A,
  },
  fish: {
    schoolCount: 4,
    fishPerSchool: 18,
    speed: 4,
    separationDist: 3,
    cohesionDist: 12,
    separationWeight: 2.5,
    alignmentWeight: 1.2,
    cohesionWeight: 1.0,
    boundsWeight: 1.5,
    tailSpeed: 8,
    tailAmplitude: 0.4,
  },
  bubbles: { count: 200, speed: 2, wobble: 1.5 },
  dust: { count: 400 },
  player: {
    minSpeed: 0, maxSpeed: 15, defaultSpeed: 4,
    sensitivity: 0.002, smoothing: 0.05,
    discoveryRadius: 8, proximityRadius: 20,
  },
};

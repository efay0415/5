import * as THREE from 'three';
import { PositionData } from '../types';

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate a random point inside a sphere
export const getSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius; // Cubic root for uniform distribution
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

// Generate a point on a cone surface (Christmas Tree shape)
export const getConePoint = (
  height: number,
  baseRadius: number,
  yPos: number, // 0 to 1 (normalized height from bottom)
  jitter: number = 0
): [number, number, number] => {
  const currentRadius = baseRadius * (1 - yPos);
  const angle = yPos * 25 + Math.random() * Math.PI * 2; // Spiral effect + random
  const r = currentRadius + randomRange(-jitter, jitter);
  
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  const y = (yPos * height) - (height / 2); // Center vertically

  return [x, y, z];
};

export const generateDecorationData = (count: number, type: 'needle' | 'ornament' | 'light'): PositionData[] => {
  const data: PositionData[] = [];
  const treeHeight = 12;
  const treeBaseRadius = 4.5;

  for (let i = 0; i < count; i++) {
    const yRatio = i / count; // Linear distribution up the tree
    
    // Mix it up slightly so it's not a perfect line
    const randomizedY = Math.max(0, Math.min(1, yRatio + randomRange(-0.05, 0.05)));

    const treePos = getConePoint(treeHeight, treeBaseRadius, randomizedY, type === 'needle' ? 0.8 : 0.2);
    const scatterPos = getSpherePoint(15); // Large scatter radius

    let scale = 1;
    if (type === 'needle') scale = randomRange(0.5, 1.2);
    if (type === 'ornament') scale = randomRange(0.8, 1.5);
    if (type === 'light') scale = randomRange(0.5, 1.0);

    data.push({
      scatter: scatterPos,
      tree: treePos,
      scale,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
    });
  }
  return data;
};

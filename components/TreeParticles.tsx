import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, Vector3, Color, MathUtils, InstancedMesh } from 'three';
import { generateDecorationData } from '../utils/math';
import { TreeMode } from '../types';

interface TreeParticlesProps {
  mode: TreeMode;
}

// Reusable dummy object for matrix calculations to avoid GC
const dummy = new Object3D();
const tempVec3 = new Vector3();
const tempColor = new Color();

export const TreeParticles: React.FC<TreeParticlesProps> = ({ mode }) => {
  // --- Configuration ---
  const needleCount = 3000;
  const ornamentCount = 150;
  const lightCount = 400;

  // --- Refs ---
  const needleMesh = useRef<InstancedMesh>(null);
  const ornamentMesh = useRef<InstancedMesh>(null);
  const lightMesh = useRef<InstancedMesh>(null);

  // --- Data Generation ---
  const needles = useMemo(() => generateDecorationData(needleCount, 'needle'), []);
  const ornaments = useMemo(() => generateDecorationData(ornamentCount, 'ornament'), []);
  const lights = useMemo(() => generateDecorationData(lightCount, 'light'), []);

  // --- Animation Loop ---
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const lerpFactor = 0.05; // Smoothness of transition

    // 1. Animate Needles (The green body)
    if (needleMesh.current) {
      needles.forEach((data, i) => {
        const target = mode === TreeMode.TREE_SHAPE ? data.tree : data.scatter;
        
        // Get current position from matrix is expensive, we simulate state by interpolating
        // We cheat slightly by recalculating ideal pos and lerping the visual representation
        // For a true physics sim we'd store current velocity/pos in a Float32Array.
        // Here, we use a simpler visual lerp in the loop which is efficient enough for this count.
        
        // NOTE: For pure React/Three lerping of 5000+ objects, we usually use custom shaders.
        // However, JS loop is fine for <5000 on modern PCs. Let's add a "float" effect.
        
        const floatX = Math.sin(t + i) * 0.1;
        const floatY = Math.cos(t * 0.5 + i) * 0.1;

        // Current 'target' position based on mode
        const tx = target[0];
        const ty = target[1];
        const tz = target[2];

        // Retrieve current instance matrix to get position
        needleMesh.current!.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        // Lerp position
        dummy.position.x = MathUtils.lerp(dummy.position.x, tx + (mode === TreeMode.SCATTERED ? floatX : 0), lerpFactor);
        dummy.position.y = MathUtils.lerp(dummy.position.y, ty + (mode === TreeMode.SCATTERED ? floatY : 0), lerpFactor);
        dummy.position.z = MathUtils.lerp(dummy.position.z, tz, lerpFactor);

        // Rotation: Spin when scattered, stable when tree
        if (mode === TreeMode.SCATTERED) {
            dummy.rotation.x += 0.01;
            dummy.rotation.y += 0.01;
        } else {
            // Point slightly upwards/outwards
            dummy.rotation.x = MathUtils.lerp(dummy.rotation.x, data.rotation[0], lerpFactor);
            dummy.rotation.y = MathUtils.lerp(dummy.rotation.y, data.rotation[1], lerpFactor);
            dummy.rotation.z = MathUtils.lerp(dummy.rotation.z, data.rotation[2], lerpFactor);
        }

        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        needleMesh.current!.setMatrixAt(i, dummy.matrix);
      });
      needleMesh.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Animate Ornaments (Red Velvet & Gold)
    if (ornamentMesh.current) {
      ornaments.forEach((data, i) => {
        const target = mode === TreeMode.TREE_SHAPE ? data.tree : data.scatter;
        
        ornamentMesh.current!.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        dummy.position.x = MathUtils.lerp(dummy.position.x, target[0], lerpFactor);
        dummy.position.y = MathUtils.lerp(dummy.position.y, target[1], lerpFactor);
        dummy.position.z = MathUtils.lerp(dummy.position.z, target[2], lerpFactor);

        // Constant slow spin
        dummy.rotation.y += 0.005;

        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        ornamentMesh.current!.setMatrixAt(i, dummy.matrix);
        
        // Color variation for ornaments (Alternating Gold and Deep Red)
        // We set this once or update if needed. Here we keep it static per instance ID.
        const isGold = i % 2 === 0;
        const color = isGold ? new Color('#FFD700') : new Color('#880000'); // Gold vs Red
        ornamentMesh.current!.setColorAt(i, color);
      });
      ornamentMesh.current.instanceMatrix.needsUpdate = true;
      if (ornamentMesh.current.instanceColor) ornamentMesh.current.instanceColor.needsUpdate = true;
    }

    // 3. Animate Lights (Fairy Lights)
    if (lightMesh.current) {
      lights.forEach((data, i) => {
        const target = mode === TreeMode.TREE_SHAPE ? data.tree : data.scatter;

        lightMesh.current!.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        dummy.position.lerp(tempVec3.set(target[0], target[1], target[2]), lerpFactor);

        // Twinkle Effect: Scale oscillates
        const twinkle = Math.sin(t * 3 + i * 10) * 0.5 + 0.5; // 0 to 1
        dummy.scale.setScalar(data.scale * (0.8 + twinkle * 0.4));
        
        dummy.updateMatrix();
        lightMesh.current!.setMatrixAt(i, dummy.matrix);

        // Warm light color with slight variation
        const hue = 0.08 + Math.sin(t + i) * 0.02; // Warm orange-yellow range
        tempColor.setHSL(hue, 1, 0.6);
        lightMesh.current!.setColorAt(i, tempColor);
      });
      lightMesh.current.instanceMatrix.needsUpdate = true;
      if (lightMesh.current.instanceColor) lightMesh.current.instanceColor.needsUpdate = true;
    }
  });

  // Initial layout to prevent all at 0,0,0
  useLayoutEffect(() => {
    // Force initial positions to scattered
    [needleMesh, ornamentMesh, lightMesh].forEach((ref, idx) => {
        if(!ref.current) return;
        const dataset = idx === 0 ? needles : idx === 1 ? ornaments : lights;
        dataset.forEach((data, i) => {
            dummy.position.set(...data.scatter);
            dummy.scale.setScalar(data.scale);
            dummy.updateMatrix();
            ref.current!.setMatrixAt(i, dummy.matrix);
        });
        ref.current!.instanceMatrix.needsUpdate = true;
    });
  }, [needles, ornaments, lights]);

  return (
    <group>
      {/* Needles: Dark Emerald Green */}
      <instancedMesh ref={needleMesh} args={[undefined, undefined, needleCount]} castShadow receiveShadow>
        <coneGeometry args={[0.1, 0.4, 4]} />
        <meshStandardMaterial 
            color="#0b3d18" 
            roughness={0.7} 
            metalness={0.1} 
        />
      </instancedMesh>

      {/* Ornaments: Handled by instanceColor (Red/Gold) */}
      <instancedMesh ref={ornamentMesh} args={[undefined, undefined, ornamentCount]} castShadow receiveShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial 
            roughness={0.15} 
            metalness={0.9} 
            envMapIntensity={1.5}
        />
      </instancedMesh>

      {/* Lights: Emissive Fairy Lights */}
      <instancedMesh ref={lightMesh} args={[undefined, undefined, lightCount]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
};
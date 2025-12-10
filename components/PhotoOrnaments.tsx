import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Billboard } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import { UserImage, TreeMode } from '../types';

interface PhotoOrnamentsProps {
  images: UserImage[];
  mode: TreeMode;
}

const PhotoFrame: React.FC<{ img: UserImage; mode: TreeMode; index: number }> = ({ img, mode, index }) => {
  const meshRef = useRef<Group>(null);
  const texture = useTexture(img.base64);
  const lerpFactor = 0.03; // Photos move slower, more heavy

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    const target = mode === TreeMode.TREE_SHAPE ? img.positionData.tree : img.positionData.scatter;

    // Position Lerp
    meshRef.current.position.x = MathUtils.lerp(meshRef.current.position.x, target[0], lerpFactor);
    meshRef.current.position.y = MathUtils.lerp(meshRef.current.position.y, target[1], lerpFactor);
    meshRef.current.position.z = MathUtils.lerp(meshRef.current.position.z, target[2], lerpFactor);

    // Floating animation
    meshRef.current.position.y += Math.sin(t + index) * 0.005;

    // Scale Logic: Larger when scattered to be seen, normal on tree
    const targetScale = mode === TreeMode.SCATTERED ? 1.5 : 1.2;
    const currentScale = meshRef.current.scale.x;
    const nextScale = MathUtils.lerp(currentScale, targetScale, lerpFactor);
    meshRef.current.scale.setScalar(nextScale);
    
    // Rotation: Billboard usually faces camera, but we can add subtle drift
    // Using <Billboard> handles the "LookAt" automatically.
  });

  return (
    <Billboard ref={meshRef} follow={true} lockX={false} lockY={false} lockZ={false}>
      <mesh>
        <planeGeometry args={[1.5, 1.8]} /> {/* Polaroid Aspect Ratio approx */}
        <meshStandardMaterial 
            map={texture} 
            transparent 
            roughness={0.8} 
            metalness={0.0}
            emissive="#ffffff"
            emissiveIntensity={0.1} // Slight backlit effect
        />
      </mesh>
    </Billboard>
  );
};

export const PhotoOrnaments: React.FC<PhotoOrnamentsProps> = ({ images, mode }) => {
  return (
    <group>
      {images.map((img, i) => (
        <PhotoFrame key={img.id} img={img} mode={mode} index={i} />
      ))}
    </group>
  );
};
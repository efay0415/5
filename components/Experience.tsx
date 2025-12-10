import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeParticles } from './TreeParticles';
import { PhotoOrnaments } from './PhotoOrnaments';
import { TreeMode, UserImage } from '../types';

interface ExperienceProps {
  mode: TreeMode;
  userImages: UserImage[];
}

export const Experience: React.FC<ExperienceProps> = ({ mode, userImages }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 18], fov: 45 }}
      gl={{ antialias: false, toneMapping: 3 }} // ACESFilmicToneMapping
      dpr={[1, 2]} // Handle high DPI screens
    >
      <color attach="background" args={['#02040a']} />

      {/* --- Environment & Lighting --- */}
      <ambientLight intensity={0.2} color="#001133" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={100} 
        color="#ffddaa" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={50} color="#ff0000" distance={20} />
      
      {/* High Quality Reflections */}
      <Environment preset="sunset" background={false} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Ambient floating particles for atmosphere */}
      <Sparkles count={200} scale={20} size={4} speed={0.4} opacity={0.5} color="#ffd700" />

      {/* --- Content --- */}
      <Suspense fallback={null}>
        <group position={[0, -5, 0]}>
            <TreeParticles mode={mode} />
            <PhotoOrnaments images={userImages} mode={mode} />
            
            {/* Ground Reflection */}
            <ContactShadows 
                opacity={0.6} 
                scale={30} 
                blur={2} 
                far={10} 
                resolution={256} 
                color="#000000" 
            />
        </group>
      </Suspense>

      {/* --- Controls --- */}
      <OrbitControls 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={8}
        maxDistance={25}
        autoRotate={mode === TreeMode.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* --- Post Processing (Cinema Grade) --- */}
      <EffectComposer disableNormalPass>
        {/* Intense Gold Bloom */}
        <Bloom 
            luminanceThreshold={1.1} // Only very bright things bloom
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} /> {/* Film grain */}
      </EffectComposer>
    </Canvas>
  );
};
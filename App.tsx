import React, { useState } from 'react';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';
import { TreeMode, UserImage } from './types';
import { getConePoint, getSpherePoint } from './utils/math';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is available or we use a simple random string

// Simple ID generator if uuid not available
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [mode, setMode] = useState<TreeMode>(TreeMode.SCATTERED);
  const [userImages, setUserImages] = useState<UserImage[]>([]);

  const handleImageUpload = (base64: string) => {
    // Generate position data for this specific image
    // Tree Position: Place them spiral up the tree but slightly outside decorations
    const index = userImages.length;
    const treeHeight = 10;
    const treeBaseRadius = 5.0;
    
    // Distribute photos nicely
    const yRatio = 0.2 + (index * 0.15) % 0.6; // Keep them in the middle-ish band
    const treePos = getConePoint(treeHeight, treeBaseRadius + 0.5, yRatio, 0); // Offset radius to float outside needles
    
    // Adjust angle based on index to spiral them
    const angleOffset = index * (Math.PI / 1.5);
    const x = (treeBaseRadius * (1 - yRatio) + 0.8) * Math.cos(angleOffset);
    const z = (treeBaseRadius * (1 - yRatio) + 0.8) * Math.sin(angleOffset);
    const y = (yRatio * treeHeight) - (treeHeight / 2);

    const scatterPos = getSpherePoint(12);

    const newImage: UserImage = {
      id: generateId(),
      base64,
      positionData: {
        tree: [x, y, z],
        scatter: scatterPos,
        scale: 1,
        rotation: [0, 0, 0]
      }
    };

    setUserImages(prev => [...prev, newImage]);
    
    // Auto switch to tree mode to see the photo placement
    if (mode === TreeMode.SCATTERED) {
      setTimeout(() => setMode(TreeMode.TREE_SHAPE), 500);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <Experience mode={mode} userImages={userImages} />
      <UIOverlay 
        mode={mode} 
        setMode={setMode} 
        onImageUpload={handleImageUpload}
        imageCount={userImages.length}
      />
    </div>
  );
}

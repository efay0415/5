import React, { useRef } from 'react';
import { TreeMode } from '../types';
import { processImageToPolaroid } from '../utils/imageProcessing';

interface UIOverlayProps {
  mode: TreeMode;
  setMode: (m: TreeMode) => void;
  onImageUpload: (base64: string) => void;
  imageCount: number;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ mode, setMode, onImageUpload, imageCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await processImageToPolaroid(e.target.files[0]);
        onImageUpload(base64);
      } catch (err) {
        console.error("Failed to process image", err);
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10 text-amber-50">
      {/* Header */}
      <div className="flex flex-col items-center md:items-start space-y-2 pointer-events-auto">
        <h1 className="text-4xl md:text-6xl font-serif tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 drop-shadow-lg">
          ARIX SIGNATURE
        </h1>
        <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-amber-200/80 font-light border-b border-amber-500/30 pb-1">
          Interactive Holiday Experience
        </p>
      </div>

      {/* Controls Container */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full pointer-events-auto gap-6">
        
        {/* Toggle State Button */}
        <div className="flex flex-col items-center">
             <button
                onClick={() => setMode(mode === TreeMode.SCATTERED ? TreeMode.TREE_SHAPE : TreeMode.SCATTERED)}
                className={`
                    relative group px-8 py-3 overflow-hidden rounded-full 
                    transition-all duration-500 ease-out border border-amber-500/50
                    ${mode === TreeMode.TREE_SHAPE ? 'bg-amber-900/40' : 'bg-slate-900/40'}
                    backdrop-blur-md hover:border-amber-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]
                `}
            >
                <span className="relative z-10 font-serif text-lg tracking-widest text-amber-100 group-hover:text-white transition-colors">
                    {mode === TreeMode.SCATTERED ? "ASSEMBLE TREE" : "SCATTER ELEMENTS"}
                </span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-amber-600/20"></div>
            </button>
            <span className="text-[10px] text-amber-500/60 mt-2 tracking-widest uppercase">
                Status: {mode === TreeMode.SCATTERED ? "Floating Zero-G" : "Structure Formed"}
            </span>
        </div>

        {/* Upload Button */}
        <div className="flex flex-col items-center">
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-full border border-amber-500/30 bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-amber-900/50 hover:scale-110 transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-amber-200">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
            </button>
            <span className="text-[10px] text-amber-500/60 mt-2 tracking-widest uppercase">
                Add Memory ({imageCount})
            </span>
            <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
            />
        </div>
      </div>

      {/* Footer / Vignette Hint */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-0"></div>
    </div>
  );
};

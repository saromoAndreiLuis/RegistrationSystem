import React from 'react';
import { useAppMode } from '../context/AppModeContext';

const Skeleton = ({ className, variant = 'rect', width, height }) => {
  const { mode } = useAppMode();
  const isRadiant = mode === 'radiant';

  const baseClass = "bg-gray-200 overflow-hidden relative";
  const animationClass = isRadiant ? "animate-shimmer" : "animate-pulse";
  
  const variantClasses = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4 w-full"
  };

  return (
    <div 
      className={`${baseClass} ${animationClass} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    >
      {isRadiant && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      )}
    </div>
  );
};

export default Skeleton;

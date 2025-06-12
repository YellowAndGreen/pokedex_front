import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ImageCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border || ''} overflow-hidden animate-pulse`}>
      <div className={`relative aspect-square ${theme.skeletonBase}`}>
        {/* Placeholder for image */}
      </div>
      <div className="p-3">
        <div className={`h-4 w-full ${theme.skeletonBase} ${theme.card.rounded}`}></div>
      </div>
    </div>
  );
};

export default ImageCardSkeleton;
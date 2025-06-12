
import React, { useState, useEffect } from 'react';
import type { ImageRead } from '../types';
import { ImagePlaceholderIcon } from './icons';
import { useTheme } from '../contexts/ThemeContext';

interface ImageCardProps {
  image: ImageRead;
  onClick: () => void;
  forceSquare?: boolean; // New prop, defaults to true
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onClick, forceSquare = true }) => {
  const { theme } = useTheme();
  const [imageLoadError, setImageLoadError] = useState(false);
  
  const primarySrc = image.thumbnail_url || image.image_url;

  useEffect(() => {
    setImageLoadError(false); // Reset error state if image prop changes
  }, [image.id, image.thumbnail_url, image.image_url]);

  const imageContainerClasses = `relative overflow-hidden ${forceSquare ? 'aspect-square' : ''}`;
  const imgClasses = `block ${theme.card.transition} duration-500 group-hover:scale-105 ${forceSquare ? 'w-full h-full object-cover' : 'w-full h-auto'}`;
  const placeholderContainerClasses = `w-full flex items-center justify-center ${theme.skeletonBase} ${theme.skeletonHighlight} ${forceSquare ? 'aspect-square' : 'min-h-[150px] sm:min-h-[200px]'}`;


  return (
    <div 
      onClick={onClick}
      className={`${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.hoverShadow} ${theme.card.border || ''} ${theme.card.transition} overflow-hidden cursor-pointer group flex flex-col`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      aria-label={`View details for ${image.title || 'image'}`}
    >
      <div className={imageContainerClasses}>
        {primarySrc && !imageLoadError ? (
          <img 
            src={primarySrc} 
            alt={image.title || 'Image'} 
            className={imgClasses}
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <div className={placeholderContainerClasses}>
            <ImagePlaceholderIcon className={`w-10 h-10 sm:w-12 sm:h-12 opacity-50 ${theme.card.secondaryText}`} />
          </div>
        )}
        <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 ${theme.card.transition} duration-300 flex items-center justify-center`}>
           {/* This div is for hover overlay effect only */}
        </div>
      </div>
      {(image.title || image.original_filename) && (
        <div className="p-3 mt-auto"> {/* Added mt-auto to push title to bottom if card flex height is larger */}
          <h4 className={`text-sm font-medium ${theme.card.text} ${theme.card.titleHover} truncate ${theme.card.transition} duration-200`}>
            {image.title || image.original_filename}
          </h4>
        </div>
      )}
    </div>
  );
};

export default ImageCard;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ImageRead } from '../types';
import { ImagePlaceholderIcon } from './icons';
import { useTheme } from '../contexts/ThemeContext';
import { IMAGE_BASE_URL } from '../constants'; // Changed from API_BASE_URL to IMAGE_BASE_URL
import { cardVariants, imageVariants, getAnimationConfig } from '../utils/animations';

interface ImageCardProps {
  image: ImageRead;
  onClick: () => void;
  forceSquare?: boolean; // New prop, defaults to true
}

const getRelativeUrl = (absoluteUrl: string | null | undefined): string | null | undefined => {
  if (absoluteUrl && absoluteUrl.startsWith(IMAGE_BASE_URL)) {
    // Changed from API_BASE_URL
    return absoluteUrl.substring(IMAGE_BASE_URL.length); // Changed from API_BASE_URL
  }
  return absoluteUrl;
};

const ImageCard: React.FC<ImageCardProps> = ({ image, onClick, forceSquare = true }) => {
  const { theme } = useTheme();
  const [imageLoadError, setImageLoadError] = useState(false);

  const primarySrcAbsolute = image.thumbnail_url || image.image_url;
  const primarySrc = getRelativeUrl(primarySrcAbsolute);

  useEffect(() => {
    setImageLoadError(false); // Reset error state if image prop changes
  }, [image.id, image.thumbnail_url, image.image_url]);

  const imageContainerClasses = `relative overflow-hidden ${forceSquare ? 'aspect-square' : ''}`;
  const imgClasses = `block ${theme.card.transition} duration-500 group-hover:scale-105 ${forceSquare ? 'w-full h-full object-cover' : 'w-full h-auto'}`;
  const placeholderContainerClasses = `w-full flex items-center justify-center ${theme.skeletonBase} ${theme.skeletonHighlight} ${forceSquare ? 'aspect-square' : 'min-h-[150px] sm:min-h-[200px]'}`;

  return (
    <motion.div
      onClick={onClick}
      className={`${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.hoverShadow} ${theme.card.border || ''} overflow-hidden cursor-pointer group flex flex-col`}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      aria-label={`View details for ${image.title || 'image'}`}
      variants={getAnimationConfig(cardVariants)}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      <div className={imageContainerClasses}>
        {primarySrc && !imageLoadError ? (
          <motion.img
            src={primarySrc}
            alt={image.title || 'Image'}
            className={imgClasses}
            onError={() => setImageLoadError(true)}
            variants={getAnimationConfig(imageVariants)}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          />
        ) : (
          <motion.div 
            className={placeholderContainerClasses}
            variants={getAnimationConfig(imageVariants)}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <ImagePlaceholderIcon
                className={`w-10 h-10 sm:w-12 sm:h-12 opacity-50 ${theme.card.secondaryText}`}
              />
            </motion.div>
          </motion.div>
        )}
        <motion.div
          className={`absolute inset-0 bg-black flex items-center justify-center`}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.2 }}
          transition={{ duration: 0.3 }}
        >
          {/* This div is for hover overlay effect only */}
        </motion.div>
      </div>
      {(image.title || image.original_filename) && (
        <motion.div 
          className='p-3 mt-auto'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.h4
            className={`text-sm font-medium ${theme.card.text} ${theme.card.titleHover} truncate transition-colors duration-200`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
          >
            {image.title || image.original_filename}
          </motion.h4>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ImageCard;

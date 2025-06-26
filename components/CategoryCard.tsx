import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { CategoryRead } from '../types';
import { ImagePlaceholderIcon } from './icons';
import { useTheme } from '../contexts/ThemeContext';
import { IMAGE_BASE_URL } from '../constants'; // Changed from API_BASE_URL to IMAGE_BASE_URL
import { cardVariants, imageVariants, getAnimationConfig } from '../utils/animations';

interface CategoryCardProps {
  category: CategoryRead;
  showCompactDetails?: boolean;
  displayIndex?: number;
}

const getRelativeUrl = (absoluteUrl: string | null | undefined): string | null | undefined => {
  if (absoluteUrl && absoluteUrl.startsWith(IMAGE_BASE_URL)) {
    // Changed from API_BASE_URL
    return absoluteUrl.substring(IMAGE_BASE_URL.length); // Changed from API_BASE_URL
  }
  return absoluteUrl;
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  showCompactDetails = false,
  displayIndex,
}) => {
  const { theme } = useTheme();
  const [imageLoadError, setImageLoadError] = useState(false);

  const transformedThumbnailUrl = getRelativeUrl(category.thumbnail_url);

  useEffect(() => {
    // Reset error state when category or its thumbnail_url changes
    setImageLoadError(false);
  }, [category.id, category.thumbnail_url]);

  let cardClasses = `block ${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.hoverShadow} ${theme.card.border || ''} overflow-hidden group 
    ${theme.card.transition}`;

  if (!showCompactDetails) {
    cardClasses += ' aspect-square';
  }

  const imageContainerBaseClasses = `relative w-full overflow-hidden transition-all duration-500 ease-in-out
    aspect-square`;

  const imageClasses = `w-full h-full object-cover transition-transform duration-300 ease-in-out 
    group-hover:scale-105`;

  return (
    <motion.div
      variants={getAnimationConfig(cardVariants)}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className={cardClasses}
    >
      <Link
        to={`/categories/${category.id}`}
        aria-label={`View category: ${category.name}`}
        className="block w-full h-full"
      >
        <div className={imageContainerBaseClasses}>
          {transformedThumbnailUrl && !imageLoadError ? (
            <motion.img
              src={transformedThumbnailUrl}
              alt={category.name}
              className={imageClasses}
              onError={() => setImageLoadError(true)}
              variants={getAnimationConfig(imageVariants)}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            />
          ) : (
            // Fallback: no thumbnail_url OR it failed to load
            <motion.div
              className={`w-full h-full flex items-center justify-center ${theme.skeletonBase} ${transformedThumbnailUrl && imageLoadError ? theme.skeletonHighlight : ''}`}
              variants={getAnimationConfig(imageVariants)}
              initial="hidden"
              animate="visible"
            >
              <ImagePlaceholderIcon
                className={`w-10 h-10 sm:w-12 sm:h-12 opacity-60 ${theme.card.secondaryText}`}
              />
            </motion.div>
          )}
          {/* Overlay with enhanced animation */}
          <motion.div
            className={`absolute inset-0 bg-black flex items-center justify-center`}
            initial={{ opacity: 0.2 }}
            whileHover={{ opacity: 0.1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Intentionally empty: overlay effect only */}
          </motion.div>
        </div>

        {showCompactDetails && (
          <motion.div 
            className={`p-2.5 sm:p-3 ${theme.card.bg}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <motion.p 
              className={`text-xs ${theme.card.secondaryText} mb-0.5`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              No. {displayIndex !== undefined ? String(displayIndex).padStart(3, '0') : '???'}
            </motion.p>
            <motion.h3
              className={`text-sm font-semibold ${theme.card.text} ${theme.card.titleHover} transition-colors duration-200 truncate`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              {category.name}
            </motion.h3>
          </motion.div>
        )}
      </Link>
    </motion.div>
  );
};

export default CategoryCard;

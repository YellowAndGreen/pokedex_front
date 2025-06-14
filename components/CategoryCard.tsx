
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CategoryRead } from '../types';
import { ImagePlaceholderIcon } from './icons'; 
import { useTheme } from '../contexts/ThemeContext';
import { IMAGE_BASE_URL } from '../constants'; // Changed from API_BASE_URL to IMAGE_BASE_URL

interface CategoryCardProps {
  category: CategoryRead;
  showCompactDetails?: boolean;
  displayIndex?: number;
}

const getRelativeUrl = (absoluteUrl: string | null | undefined): string | null | undefined => {
  if (absoluteUrl && absoluteUrl.startsWith(IMAGE_BASE_URL)) { // Changed from API_BASE_URL
    return absoluteUrl.substring(IMAGE_BASE_URL.length); // Changed from API_BASE_URL
  }
  return absoluteUrl;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, showCompactDetails = false, displayIndex }) => {
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
    <Link 
      to={`/categories/${category.id}`} 
      className={cardClasses}
      aria-label={`View category: ${category.name}`}
    >
      <div className={imageContainerBaseClasses}>
        {transformedThumbnailUrl && !imageLoadError ? (
          <img 
            src={transformedThumbnailUrl} 
            alt={category.name} 
            className={imageClasses}
            onError={() => setImageLoadError(true)}
          />
        ) : (
          // Fallback: no thumbnail_url OR it failed to load
          <div className={`w-full h-full flex items-center justify-center ${theme.skeletonBase} ${ (transformedThumbnailUrl && imageLoadError) ? theme.skeletonHighlight : '' }`}>
            <ImagePlaceholderIcon className={`w-10 h-10 sm:w-12 sm:h-12 opacity-60 ${theme.card.secondaryText}`} />
          </div>
        )}
        {/* Overlay is always present over the image/placeholder area */}
        <div className={`absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-colors duration-300 flex items-center justify-center`}>
           {/* Intentionally empty: overlay effect only */}
        </div>
      </div>
      
      {showCompactDetails && (
        <div className={`p-2.5 sm:p-3 ${theme.card.bg}`}>
          <p className={`text-xs ${theme.card.secondaryText} mb-0.5`}>
            No. {displayIndex !== undefined ? String(displayIndex).padStart(3, '0') : '???'}
          </p>
          <h3 className={`text-sm font-semibold ${theme.card.text} ${theme.card.titleHover} transition-colors duration-200 truncate`}>
            {category.name}
          </h3>
        </div>
      )}
    </Link>
  );
};

export default CategoryCard;
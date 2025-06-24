import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryCardSkeletonProps {
  showCompactDetails?: boolean;
}

const CategoryCardSkeleton: React.FC<CategoryCardSkeletonProps> = ({
  showCompactDetails = false,
}) => {
  const { theme } = useTheme();

  let skeletonContainerClasses = `block ${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border || ''} 
                                 overflow-hidden animate-pulse transition-all duration-500 ease-in-out`;
  if (!showCompactDetails) {
    skeletonContainerClasses += ' aspect-square';
  }

  return (
    <div className={skeletonContainerClasses}>
      <div
        className={`relative ${theme.skeletonBase} transition-all duration-500 ease-in-out 
                   w-full aspect-square`}
      >
        {/* Placeholder for image */}
      </div>
      {showCompactDetails && (
        <div className='p-2.5 sm:p-3'>
          <div className={`h-3 w-1/4 ${theme.skeletonBase} ${theme.card.rounded} mb-1.5`}></div>
          <div className={`h-4 w-3/4 ${theme.skeletonBase} ${theme.card.rounded}`}></div>
        </div>
      )}
    </div>
  );
};

export default CategoryCardSkeleton;

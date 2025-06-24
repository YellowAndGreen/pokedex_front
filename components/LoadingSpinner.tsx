import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4',
  };

  // theme.brandColor is expected to be like "text-blue-600 dark:text-blue-400"
  // We need the non-dark part for the border-t color, e.g., "blue-600"
  const mainColorName = theme.brandColor.split(' ')[0].replace('text-', '');
  const spinnerColorClass = `border-t-${mainColorName}`;

  return (
    <div
      className='flex justify-center items-center'
      role='status'
      aria-live='polite'
      aria-label='Loading'
    >
      <div
        className={`animate-spin rounded-full border-solid border-gray-200 dark:border-gray-700 ${spinnerColorClass} ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;

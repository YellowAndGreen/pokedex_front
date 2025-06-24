import React from 'react';
import type { ApiError } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface ErrorDisplayProps {
  error: ApiError | string | null;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  const { theme } = useTheme();
  if (!error) {
    return null;
  }

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorDetails = typeof error === 'object' && error?.details;

  // Determine error colors based on theme
  let errorBgColor = 'bg-red-100 dark:bg-red-900';
  let errorBorderColor = 'border-red-500 dark:border-red-400';
  let errorTextColor = 'text-red-700 dark:text-red-200';
  const errorButtonBg = theme.button.danger;
  const errorButtonText = theme.button.dangerText;

  if (theme.name === 'Nature Inspired') {
    errorBgColor = 'bg-orange-100 dark:bg-orange-900';
    errorBorderColor = 'border-orange-500 dark:border-orange-400';
    errorTextColor = 'text-orange-700 dark:text-orange-200';
    // Retry button for nature theme uses its danger colors
  } else if (theme.name === 'Pokedex Playful') {
    errorBgColor = 'bg-yellow-100 dark:bg-yellow-800'; // Pokedex might use yellow for warnings
    errorBorderColor = 'border-yellow-500 dark:border-yellow-400';
    errorTextColor = 'text-yellow-700 dark:text-yellow-200';
    // Retry button for pokedex theme uses its danger colors
  }

  return (
    <div
      className={`${errorBgColor} border-l-4 ${errorBorderColor} ${errorTextColor} p-4 ${theme.card.rounded} shadow-md`}
      role='alert'
    >
      <p className='font-bold'>Error</p>
      <p>{errorMessage}</p>
      {errorDetails && errorDetails.length > 0 && (
        <ul className='mt-2 list-disc list-inside text-sm'>
          {errorDetails.map((detail, index) => (
            <li key={index}>
              {detail.loc.join(' -> ')}: {detail.msg}
            </li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className={`mt-4 px-4 py-2 ${errorButtonBg} ${errorButtonText} font-semibold ${theme.card.rounded} transition duration-150`}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;

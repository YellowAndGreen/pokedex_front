import React from 'react';

export const PlusIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
  </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
    />
  </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.287.094M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5'
    />
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' />
  </svg>
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M4.5 15.75l7.5-7.5 7.5 7.5' />
  </svg>
);

export const XMarkIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
  </svg>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
    />
    <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
    />
  </svg>
);

export const StarIcon: React.FC<{ className?: string; filled?: boolean }> = ({
  className = 'w-5 h-5',
  filled = false,
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
    fill={filled ? 'currentColor' : 'none'}
  >
    {filled ? (
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.502 2.827c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z'
      />
    ) : (
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.725-2.885a.563.563 0 00-.652 0l-4.725 2.885a.562.562 0 01-.82-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'
      />
    )}
  </svg>
);

export const ImagePlaceholderIcon: React.FC<{ className?: string }> = ({
  className = 'w-12 h-12 text-gray-400',
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth='1.5'
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
    />
  </svg>
);

export const GridViewIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z'
    />
  </svg>
);

export const DetailedViewIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12'
    />
  </svg>
);

export const TimeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
);

export const FlaskIcon: React.FC<{ className?: string }> = (
  { className = 'w-6 h-6' } // Simplified test tube/flask
) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9.75 3.104A7.493 7.493 0 004.5 9.75c0 1.35.378 2.622 1.05 3.75m13.95-3.75c0-1.35-.378-2.622-1.05-3.75m-10.95 6.5A7.493 7.493 0 009.75 20.896c2.076 0 3.965-.84 5.303-2.222M12 3v2.25m0 0A3.748 3.748 0 0115.75 9c0 .88-.284 1.69-.778 2.363M12 5.25A3.748 3.748 0 008.25 9c0 .88.284 1.69.778 2.363m2.972-4.113A3.73 3.73 0 0012 7.5c-.94 0-1.804.346-2.474.925m4.948 0A3.73 3.73 0 0112 7.5c.94 0 1.804.346 2.474.925'
    />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9 15.75l1.586-1.586a2.25 2.25 0 013.182 0L15 15.75M9 15.75H6.75A2.25 2.25 0 004.5 18v.75c0 .621.504 1.125 1.125 1.125H9M15 15.75h2.25A2.25 2.25 0 0119.5 18v.75c0 .621-.504 1.125-1.125 1.125H15'
    />
  </svg>
);

export const AwardRibbonIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 9.75H11.25A3.375 3.375 0 007.5 13.125V18.75m9 0h1.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5H6A2.25 2.25 0 003.75 6.75v9.75A2.25 2.25 0 006 18.75h1.5m0 0V9.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V18.75'
    />
    <path strokeLinecap='round' strokeLinejoin='round' d='M12 12.75h.008v.008H12v-.008z' />
  </svg>
);

export const TwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
  >
    <path d='M22.46 5.97c-.82.36-1.7.6-2.63.72.94-.56 1.66-1.46 2-2.53-.88.52-1.86.9-2.9 1.1a4.5 4.5 0 00-7.65 4.1c-3.74-.18-7.06-1.98-9.28-4.7C1.42 5.22 1.24 6.3 1.8 7.34c-.74-.02-1.45-.23-2.08-.57v.06c0 2.47 1.76 4.53 4.08 5-.43.12-.88.18-1.35.18-.33 0-.65-.03-.96-.09.65 2.02 2.54 3.5 4.78 3.54A9.07 9.07 0 010 17.54a12.77 12.77 0 006.92 2.02c8.3 0 12.84-6.88 12.84-12.84 0-.2 0-.4-.02-.6.88-.64 1.65-1.43 2.26-2.34z' />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
  >
    <path d='M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.9 0-1 .43-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z' />
  </svg>
);

export const XiaohongshuIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
  >
    <path d='M20.594 6.237a.86.86 0 00-.609-.252H4.016a.86.86 0 00-.609.252.88.88 0 00-.248.618v10.29a.88.88 0 00.248.618.86.86 0 00.609.252h15.97a.86.86 0 00.609-.252.88.88 0 00.248-.618V6.855a.88.88 0 00-.248-.618zm-4.131 1.762h-2.81v2.83h2.81v1.554h-2.81v2.831h-1.537v-2.83H9.305V10.83H6.594V9.276h2.711V6.471h1.537v2.805h2.811v1.518h.003zm.003 4.385h1.537V7.998h-1.537v4.386zM12 14.383V9.998h1.537v4.385H12z' />
    <path d='M15.03 11.537c-.31-.007-.547.233-.547.546v.006c0 .313.24.553.547.553h.01c.31 0 .546-.24.546-.553v-.006c0-.313-.236-.546-.546-.546h-.01zM12.763 11.537c-.31-.007-.546.233-.546.546v.006c0 .313.24.553.546.553h.002c.312 0 .547-.24.547-.553v-.006c0-.313-.235-.546-.547-.546h-.002zM10.496 11.537c-.312-.007-.547.233-.547.546v.006c0 .313.238.553.547.553h.004c.31 0 .547-.24.547-.553v-.006c0-.313-.237-.546-.547-.546h-.004zM8.228 11.537c-.312-.007-.547.233-.547.546v.006c0 .313.238.553.547.553h.002c.312 0 .547-.24.547-.553v-.006c0-.313-.235-.546-.547-.546h-.002z' />
  </svg>
);

export const HeartFilledIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
  >
    <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
  </svg>
);

export const ShareIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.5-1.212 1.63-2.08 2.933-2.286m-2.933 2.286c-.079.158-.14.321-.188.487M8.69 12.514c.079.158.14.321.188.487m0 0c.124.486.305.94.527 1.361m1.63-1.983c-.123.486-.305.94-.527-1.361m0 0c-.5 1.212-1.63 2.08-2.933 2.286m2.933-2.286c.079-.158.14-.321-.188-.487M15.31 13.093c-.079-.158-.14-.321-.188-.487m0 0c-.124-.486-.305-.94-.527-1.361m-1.63 1.983c.123-.486.305-.94.527-1.361m0 0c.5-1.212 1.63-2.08 2.933-2.286m-2.933 2.286c-.079.158-.14.321-.188.487M6.75 12.75h10.5M6.75 12.75a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 012.25-2.25h10.5a2.25 2.25 0 012.25 2.25v3.75a2.25 2.25 0 01-2.25 2.25M6.75 12.75v3.75a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V12.75'
    />
  </svg>
);

export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
    />
  </svg>
);

export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
  </svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
  </svg>
);

export const PhotoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
    />
  </svg>
);

export const RectangleStackIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-3.75 2.25M21.75 12l-4.179-2.25M6.429 14.25l5.571 3 5.571-3M4.5 21.75l5.571-3 5.571 3M4.5 12l5.571-3 5.571 3'
    />
  </svg>
);

export const ArrowsPointingOutIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9.75 9.75M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L14.25 9.75M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9.75 14.25m10.5 6v-4.5m0 4.5h-4.5m4.5 0L14.25 14.25'
    />
  </svg>
);

export const UserCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z'
    />
  </svg>
);

export const ArrowRightOnRectangleIcon: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6',
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9'
    />
  </svg>
);

export const TagIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z'
    />
    <path strokeLinecap='round' strokeLinejoin='round' d='M6 6h.008v.008H6V6z' />
  </svg>
);

import React from 'react';
import type { SpeciesRead } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ImagePlaceholderIcon } from './icons'; // Import the placeholder icon

interface SpeciesDetailCardProps {
  species: SpeciesRead;
}

const SpeciesDetailCard: React.FC<SpeciesDetailCardProps> = ({ species }) => {
  const { theme } = useTheme();
  // Removed placeholderImageUrl that used picsum.photos

  const detailItemBg =
    theme.name === 'Modern Clean Pro'
      ? 'bg-slate-50 dark:bg-slate-700'
      : theme.name === 'Nature Inspired'
        ? 'bg-lime-100 dark:bg-green-700'
        : 'bg-gray-100 dark:bg-neutral-700';

  return (
    <div
      className={`${theme.card.bg} ${theme.card.shadow} ${theme.card.rounded} ${theme.card.border || ''} overflow-hidden mt-4 sm:mt-6`}
    >
      {/* Placeholder for image area */}
      <div
        className={`w-full h-48 sm:h-56 md:h-64 flex items-center justify-center ${theme.skeletonBase} ${theme.skeletonHighlight}`}
      >
        <ImagePlaceholderIcon
          className={`w-16 h-16 sm:w-20 sm:h-20 opacity-50 ${theme.card.secondaryText}`}
        />
      </div>

      <div className='p-4 sm:p-6'>
        <h2 className={`text-2xl sm:text-3xl font-bold ${theme.card.text} mb-1`}>
          {species.name_chinese}
        </h2>
        {species.name_english && (
          <p className={`text-lg sm:text-xl ${theme.brandColor} mb-1`}>{species.name_english}</p>
        )}
        {species.name_latin && (
          <p className={`text-base sm:text-lg italic ${theme.card.secondaryText} mb-3 sm:mb-4`}>
            {species.name_latin}
          </p>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm'>
          <DetailItem label='Order (目)' value={species.order_details} bgColor={detailItemBg} />
          <DetailItem label='Family (科)' value={species.family_details} bgColor={detailItemBg} />
          <DetailItem label='Genus (属)' value={species.genus_details} bgColor={detailItemBg} />
          {species.pinyin_full && (
            <DetailItem label='Pinyin (全拼)' value={species.pinyin_full} bgColor={detailItemBg} />
          )}
          {species.pinyin_initials && (
            <DetailItem
              label='Pinyin (Initials)'
              value={species.pinyin_initials}
              bgColor={detailItemBg}
            />
          )}
        </div>

        {species.href && (
          <div className='mt-4 sm:mt-6'>
            <a
              href={species.href}
              target='_blank'
              rel='noopener noreferrer'
              className={`inline-block w-full sm:w-auto text-center px-4 py-2 sm:px-6 sm:py-3 ${theme.button.primary} ${theme.button.primaryText} ${theme.card.rounded} font-semibold transition duration-150 text-sm sm:text-base`}
            >
              More Information
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

interface DetailItemProps {
  label: string;
  value: string | number | null | undefined;
  bgColor: string;
}
const DetailItem: React.FC<DetailItemProps> = ({ label, value, bgColor }) => {
  const { theme } = useTheme();
  if (!value) {
    return null;
  }
  return (
    <div className={`p-2 sm:p-3 ${bgColor} ${theme.card.rounded}`}>
      <p className={`font-semibold ${theme.card.text} text-xs sm:text-sm`}>{label}:</p>
      <p className={`${theme.card.secondaryText} text-xs sm:text-sm`}>{value}</p>
    </div>
  );
};

export default SpeciesDetailCard;

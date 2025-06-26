import React from 'react';
import { motion } from 'framer-motion';
import type { SpeciesRead } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ImagePlaceholderIcon } from './icons'; // Import the placeholder icon
import { cardVariants, staggerContainerVariants, staggerItemVariants, getAnimationConfig } from '../utils/animations';

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
    <motion.div
      className={`${theme.card.bg} ${theme.card.shadow} ${theme.card.rounded} ${theme.card.border || ''} overflow-hidden mt-4 sm:mt-6`}
      variants={getAnimationConfig(cardVariants)}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {/* Placeholder for image area */}
      <motion.div
        className={`w-full h-48 sm:h-56 md:h-64 flex items-center justify-center ${theme.skeletonBase} ${theme.skeletonHighlight}`}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <ImagePlaceholderIcon
            className={`w-16 h-16 sm:w-20 sm:h-20 opacity-50 ${theme.card.secondaryText}`}
          />
        </motion.div>
      </motion.div>

      <motion.div 
        className='p-4 sm:p-6'
        variants={getAnimationConfig(staggerContainerVariants)}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          className={`text-2xl sm:text-3xl font-bold ${theme.card.text} mb-1`}
          variants={getAnimationConfig(staggerItemVariants)}
        >
          {species.name_chinese}
        </motion.h2>
        {species.name_english && (
          <motion.p 
            className={`text-lg sm:text-xl ${theme.brandColor} mb-1`}
            variants={getAnimationConfig(staggerItemVariants)}
          >
            {species.name_english}
          </motion.p>
        )}
        {species.name_latin && (
          <motion.p 
            className={`text-base sm:text-lg italic ${theme.card.secondaryText} mb-3 sm:mb-4`}
            variants={getAnimationConfig(staggerItemVariants)}
          >
            {species.name_latin}
          </motion.p>
        )}

        <motion.div 
          className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm'
          variants={getAnimationConfig(staggerContainerVariants)}
        >
          <motion.div variants={getAnimationConfig(staggerItemVariants)}>
            <DetailItem label='Order (目)' value={species.order_details} bgColor={detailItemBg} />
          </motion.div>
          <motion.div variants={getAnimationConfig(staggerItemVariants)}>
            <DetailItem label='Family (科)' value={species.family_details} bgColor={detailItemBg} />
          </motion.div>
          <motion.div variants={getAnimationConfig(staggerItemVariants)}>
            <DetailItem label='Genus (属)' value={species.genus_details} bgColor={detailItemBg} />
          </motion.div>
          {species.pinyin_full && (
            <motion.div variants={getAnimationConfig(staggerItemVariants)}>
              <DetailItem label='Pinyin (全拼)' value={species.pinyin_full} bgColor={detailItemBg} />
            </motion.div>
          )}
          {species.pinyin_initials && (
            <motion.div variants={getAnimationConfig(staggerItemVariants)}>
              <DetailItem
                label='Pinyin (Initials)'
                value={species.pinyin_initials}
                bgColor={detailItemBg}
              />
            </motion.div>
          )}
        </motion.div>

        {species.href && (
          <motion.div 
            className='mt-4 sm:mt-6'
            variants={getAnimationConfig(staggerItemVariants)}
          >
            <motion.a
              href={species.href}
              target='_blank'
              rel='noopener noreferrer'
              className={`inline-block w-full sm:w-auto text-center px-4 py-2 sm:px-6 sm:py-3 ${theme.button.primary} ${theme.button.primaryText} ${theme.card.rounded} font-semibold transition duration-150 text-sm sm:text-base`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              More Information
            </motion.a>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
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

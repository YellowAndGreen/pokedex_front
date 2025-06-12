
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { useCategories } from '../contexts/CategoryContext'; // Import useCategories

export interface BirdSightingRecord {
  id: string;
  chineseName: string;
  latinName: string;
  englishName: string;
  order: string;
  family: string;
  count: number;
  recordDate: string; // Expected format: "YYYY/MM/DD"
}

interface BirdSightingTimelineProps {
  records: BirdSightingRecord[];
}

const ITEMS_PER_LOAD = 20;

const getRingClassFromBg = (bgClass: string): string => {
  return bgClass
    .split(' ')
    .map(cls => {
      if (cls.startsWith('bg-')) {
        return 'ring-' + cls.substring(3);
      }
      return cls; 
    })
    .join(' ');
};

const BirdSightingTimeline: React.FC<BirdSightingTimelineProps> = ({ records }) => {
  const { theme, isDarkMode } = useTheme();
  const { categories: allPokedexCategories, isLoading: isLoadingPokedexCategories } = useCategories();
  const [displayedRecords, setDisplayedRecords] = useState<BirdSightingRecord[]>([]);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_LOAD);

  const sortedFullRecords = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
  }, [records]);

  useEffect(() => {
    setDisplayedRecords(sortedFullRecords.slice(0, displayCount));
  }, [sortedFullRecords, displayCount]);

  const pokedexCategoryMap = useMemo(() => {
    if (isLoadingPokedexCategories || !allPokedexCategories) {
      return new Map<string, string>(); // Return empty map if loading or no categories
    }
    const map = new Map<string, string>();
    allPokedexCategories.forEach(category => {
      map.set(category.name, category.id);
    });
    return map;
  }, [allPokedexCategories, isLoadingPokedexCategories]);

  const dotColors = useMemo(() => {
    const baseColorsLight = [
      'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'
    ];
    const baseColorsDark = [
      'bg-sky-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-violet-400'
    ];
    
    switch (theme.name) {
      case 'Nature Inspired':
        return isDarkMode 
          ? ['bg-lime-400', 'bg-green-400', 'bg-teal-400', 'bg-yellow-400', 'bg-orange-400']
          : ['bg-lime-500', 'bg-green-500', 'bg-teal-500', 'bg-yellow-500', 'bg-orange-500'];
      case 'Neon Galaxy':
         return isDarkMode
          ? ['bg-cyan-400', 'bg-pink-400', 'bg-purple-400', 'bg-teal-400', 'bg-fuchsia-400']
          : ['bg-cyan-500', 'bg-pink-500', 'bg-purple-500', 'bg-teal-500', 'bg-fuchsia-500'];
      case 'Arcade Flash':
        return isDarkMode
          ? ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-pink-400']
          : ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500'];
      case 'RetroTech Dark':
        return isDarkMode
          ? ['bg-emerald-400', 'bg-pink-400', 'bg-amber-400', 'bg-sky-400', 'bg-fuchsia-400']
          : ['bg-emerald-500', 'bg-pink-500', 'bg-amber-500', 'bg-sky-500', 'bg-fuchsia-500'];
      case 'Modern Clean Pro':
      default:
        return isDarkMode ? baseColorsDark : baseColorsLight;
    }
  }, [theme.name, isDarkMode]);

  const parsedThemeBgRingClass = useMemo(() => getRingClassFromBg(theme.bg), [theme.bg]);
  
  const lineBgClass = useMemo(() => {
    if (theme.name === 'Arcade Flash') {
      return isDarkMode ? 'bg-yellow-400' : 'bg-black';
    }
    const borderColorClass = theme.input.border.split(' ').find(cls => cls.startsWith('border-') && !cls.startsWith('border-2') && !cls.startsWith('border-t') && !cls.startsWith('border-b') && !cls.startsWith('border-l') && !cls.startsWith('border-r'));
    if (borderColorClass) {
        return borderColorClass.replace('border-', 'bg-');
    }
    return isDarkMode ? 'bg-gray-600' : 'bg-gray-300';
  }, [theme.name, theme.input.border, isDarkMode]);


  const handleLoadMore = () => {
    setDisplayCount(prevCount => Math.min(prevCount + ITEMS_PER_LOAD, sortedFullRecords.length));
  };

  const handleLoadAll = () => {
    setDisplayCount(sortedFullRecords.length);
  };

  if (records.length === 0) {
    return <p className={`${theme.card.secondaryText} text-center py-4 text-sm`}>No recent records to display in timeline.</p>;
  }

  const remainingCount = sortedFullRecords.length - displayCount;

  return (
    <div className="mt-2 -ml-2 sm:-ml-0"> 
      {displayedRecords.map((record, index) => {
        const dotColor = dotColors[index % dotColors.length];
        const isLastItemInView = index === displayedRecords.length - 1;
        
        const formattedDate = new Date(record.recordDate).toLocaleDateString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        const matchedCategoryId = pokedexCategoryMap.get(record.chineseName);

        return (
          <motion.div
            key={record.id}
            layout 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25, 
              delay: index * 0.05
            }}
          >
            <div className="flex relative">
              <div className={`absolute left-0 top-0 h-full w-10 sm:w-12 flex flex-col items-center pt-1 ${isLastItemInView && displayCount >= sortedFullRecords.length ? 'pb-5' : ''}`}>
                <div 
                  className={`w-3.5 h-3.5 ${dotColor} rounded-full z-10 ring-4 ${parsedThemeBgRingClass} flex-shrink-0`}
                  aria-hidden="true"
                ></div>
                {!(isLastItemInView && displayCount >= sortedFullRecords.length) && (
                  <div className={`w-px flex-grow ${lineBgClass} my-1.5`}></div>
                )}
              </div>

              <div className="pl-12 sm:pl-16 pb-6 sm:pb-8 flex-grow min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${theme.card.secondaryText} mb-1 sm:mb-1.5`}>
                  {formattedDate}
                </p>
                
                <div className={`${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} p-3 sm:p-4 ${theme.card.border || ''} w-full`}>
                  <h3 className={`text-base sm:text-lg font-semibold`}>
                    {matchedCategoryId ? (
                      <Link
                        to={`/categories/${matchedCategoryId}`}
                        className={`${theme.brandColor} hover:opacity-80 transition-opacity duration-150 focus:outline-none focus:underline`}
                        style={{ textDecoration: 'none' }}
                        aria-label={`View Pokedex category for ${record.chineseName}`}
                      >
                        {record.chineseName}
                      </Link>
                    ) : (
                      <span className={theme.card.text}>{record.chineseName}</span>
                    )}
                  </h3>
                   <p className={`text-xs ${theme.card.secondaryText} italic truncate`}>{record.englishName} / {record.latinName}</p>
                   <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      <span className={`text-xs ${theme.card.secondaryText}`}>Order: {record.order}</span>
                      <span className={`text-xs ${theme.card.secondaryText}`}>Family: {record.family}</span>
                      <span className={`text-xs ${theme.card.secondaryText} font-medium ${theme.brandColor}`}>Count: {record.count}</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
      {remainingCount > 0 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4 mb-2 pl-10 sm:pl-12"> 
          <button
            onClick={handleLoadMore}
            className={`px-6 py-2 ${theme.button.secondary} ${theme.button.secondaryText} ${theme.card.rounded} transition text-sm font-medium hover:opacity-80`}
            aria-label={`Load ${Math.min(ITEMS_PER_LOAD, remainingCount)} more records`}
          >
            Load More ({remainingCount} remaining)
          </button>
          <button
            onClick={handleLoadAll}
            className={`px-6 py-2 ${theme.button.secondary} ${theme.button.secondaryText} ${theme.card.rounded} transition text-sm font-medium hover:opacity-80`}
            aria-label={`Load all ${remainingCount} remaining records`}
          >
            Load All ({remainingCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default BirdSightingTimeline;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  TimeIcon,
  TwitterIcon,
  DocumentTextIcon,
  XiaohongshuIcon,
  HeartFilledIcon,
  ShareIcon,
} from './icons';
import PieChart from './PieChart';
import BirdSightingTimeline, { BirdSightingRecord } from './BirdSightingTimeline'; // Updated import
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import ChinaBirdMap, { RegionBirdData } from './ChinaBirdMap';

interface StatDisplayItemProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  value: string;
  iconColorClass: string;
  valueColorClass: string;
  iconContainerBgClass: string;
}

const StatDisplayItem: React.FC<StatDisplayItemProps> = ({
  icon,
  title,
  value,
  iconColorClass,
  valueColorClass,
  iconContainerBgClass,
}) => {
  const { theme } = useTheme();

  return (
    <div className='flex items-center'>
      <div className={`p-3 rounded-lg ${iconContainerBgClass} mr-3 sm:mr-4`}>
        {React.cloneElement(icon, { className: `w-7 h-7 sm:w-8 sm:h-8 ${iconColorClass}` })}
      </div>
      <div>
        <h6 className={`text-sm sm:text-base font-medium ${theme.card.secondaryText}`}>{title}</h6>
        <h4 className={`text-xl sm:text-2xl font-semibold ${valueColorClass}`}>{value}</h4>
      </div>
    </div>
  );
};

interface SocialCardProps {
  icon: React.ReactElement<{ className?: string }>;
  cardTitle: string;
  text: string;
  avatarSrc: string;
  userName: string;
  likes: string;
  shares: string;
  bgColorClass: string;
  textColorClass: string;
  iconColorClass?: string;
}

const SocialCard: React.FC<SocialCardProps> = ({
  icon,
  cardTitle,
  text,
  avatarSrc,
  userName,
  likes,
  shares,
  bgColorClass,
  textColorClass,
  iconColorClass,
}) => {
  const { theme } = useTheme();
  const finalIconColor = iconColorClass || textColorClass;
  return (
    <div
      className={`${bgColorClass} ${textColorClass} ${theme.card.rounded} p-4 sm:p-5 shadow-lg flex flex-col justify-between min-h-[200px] sm:min-h-[220px] h-full ${theme.card.border || ''} group-hover:shadow-xl transition-shadow duration-200`}
    >
      <div>
        <div className='flex items-center mb-3'>
          {React.cloneElement(icon, { className: `w-7 h-7 mr-2 ${finalIconColor}` })}
          <h5 className='text-lg font-semibold'>{cardTitle}</h5>
        </div>
        <p className='text-sm mb-3 leading-relaxed'>{text}</p>
      </div>
      <div className='flex justify-between items-center mt-auto'>
        <div className='flex items-center'>
          <img
            src={avatarSrc}
            alt={userName}
            className='w-8 h-8 sm:w-9 sm:h-9 rounded-full mr-2 border border-current object-cover'
          />
          <span className='text-xs sm:text-sm font-medium'>{userName}</span>
        </div>
        <div className='flex items-center text-xs sm:text-sm'>
          <HeartFilledIcon className={`w-4 h-4 mr-1 ${finalIconColor}`} />
          <span className='mr-3'>{likes}</span>
          <ShareIcon className={`w-4 h-4 mr-1 ${finalIconColor}`} />
          <span>{shares}</span>
        </div>
      </div>
    </div>
  );
};

interface AnalyticsSummary {
  activeDays: number;
  totalSpecies: number;
  reportCount: number;
}

interface TopBirdData {
  name: string;
  value: number;
}

interface RawRegionStat {
  name: string;
  fixedReports: number;
  fixedSpecies: number;
  casualReports: number;
  casualSpecies: number;
  totalSpecies: number;
}

interface SocialStats {
  avatarUrl: string;
  twitter: { likes: string; shares: string };
  xiaohongshu: { likes: string; shares: string };
}

const AnalyticsPage: React.FC = () => {
  const { theme, isDarkMode } = useTheme();

  const [allBirdSightings, setAllBirdSightings] = useState<BirdSightingRecord[]>([]);
  const [isLoadingBirdData, setIsLoadingBirdData] = useState(true);
  const [birdDataError, setBirdDataError] = useState<string | null>(null);

  const [summaryStats, setSummaryStats] = useState<AnalyticsSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [topBirdsData, setTopBirdsData] = useState<TopBirdData[]>([]);
  const [isLoadingTopBirds, setIsLoadingTopBirds] = useState(true);
  const [topBirdsError, setTopBirdsError] = useState<string | null>(null);

  const [mapChartData, setMapChartData] = useState<RegionBirdData[]>([]);
  const [isLoadingMapData, setIsLoadingMapData] = useState(true);
  const [mapDataError, setMapDataError] = useState<string | null>(null);

  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
  const [isLoadingSocialStats, setIsLoadingSocialStats] = useState(true);
  const [socialStatsError, setSocialStatsError] = useState<string | null>(null);

  const fetchData = useCallback(
    async <TData,>(
      fetchUrl: string,
      dataSetter: (data: TData) => void,
      currentErrorSetter: (error: string | null) => void,
      currentLoadingSetter: (loading: boolean) => void
    ) => {
      currentLoadingSetter(true);
      currentErrorSetter(null);
      try {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TData = await response.json();
        dataSetter(data);
      } catch (error: any) {
        console.error(`Failed to fetch data from ${fetchUrl}:`, error);
        currentErrorSetter(error.message || `Failed to load data from ${fetchUrl}.`);
      } finally {
        currentLoadingSetter(false);
      }
    },
    []
  );

  const fetchAndProcessMapData = useCallback(async () => {
    setIsLoadingMapData(true);
    setMapDataError(null);
    try {
      const response = await fetch('/data/region_bird_stats.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawData: RawRegionStat[] = await response.json();
      
      // 直接使用简化名称，保持数据一致性
      const processedData: RegionBirdData[] = rawData.map(item => ({
        name: item.name, // 保持原始简化名称
        value: item.totalSpecies,
        tooltipData: {
          species: item.totalSpecies,
          reports: item.fixedReports + item.casualReports,
        },
      }));
      setMapChartData(processedData);
    } catch (error: any) {
      console.error('Failed to fetch map data:', error);
      setMapDataError(error.message || 'Failed to load map data.');
    } finally {
      setIsLoadingMapData(false);
    }
  }, [setIsLoadingMapData, setMapDataError, setMapChartData]);

  useEffect(() => {
    fetchData<BirdSightingRecord[]>(
      '/data/bird_sightings.json',
      setAllBirdSightings,
      setBirdDataError,
      setIsLoadingBirdData
    );
    fetchData<AnalyticsSummary | null>(
      '/data/analytics_summary.json',
      setSummaryStats,
      setSummaryError,
      setIsLoadingSummary
    );
    fetchData<TopBirdData[]>(
      '/data/top_birds.json',
      setTopBirdsData,
      setTopBirdsError,
      setIsLoadingTopBirds
    );
    fetchData<SocialStats | null>(
      '/data/social_stats.json',
      setSocialStats,
      setSocialStatsError,
      setIsLoadingSocialStats
    );
    fetchAndProcessMapData();
  }, [fetchData, fetchAndProcessMapData]);

  const timeIconColor = theme.brandColor;
  const timeValueColor = theme.brandColor;
  const timeIconContainerBg =
    theme.name === 'Modern Clean Pro'
      ? 'bg-blue-100 dark:bg-blue-800/30'
      : theme.name === 'Nature Inspired'
        ? 'bg-lime-200 dark:bg-green-800/30'
        : theme.name === 'Neon Galaxy'
          ? 'bg-cyan-500/10 dark:bg-cyan-400/10'
          : theme.name === 'Arcade Flash'
            ? 'bg-yellow-300 dark:bg-yellow-700/30'
            : theme.name === 'RetroTech Dark'
              ? 'bg-emerald-400/10 dark:bg-emerald-500/10'
              : 'bg-gray-100 dark:bg-gray-700/30';

  let speciesIconColor = theme.brandColor;
  let speciesValueColor = theme.brandColor;
  let speciesIconContainerBg = timeIconContainerBg;

  let reportIconColor = theme.brandColor;
  let reportValueColor = theme.brandColor;
  let reportIconContainerBg = timeIconContainerBg;

  if (theme.name === 'Modern Clean Pro') {
    speciesIconColor = 'text-sky-500 dark:text-sky-400';
    speciesValueColor = 'text-sky-500 dark:text-sky-400';
    speciesIconContainerBg = 'bg-sky-50 dark:bg-sky-800/30';

    reportIconColor = 'text-amber-500 dark:text-amber-400';
    reportValueColor = 'text-amber-500 dark:text-amber-400';
    reportIconContainerBg = 'bg-amber-50 dark:bg-amber-800/30';
  } else if (theme.name === 'Neon Galaxy') {
    speciesIconContainerBg = 'bg-indigo-800/50 dark:bg-gray-800/40';
    reportIconContainerBg = 'bg-indigo-800/50 dark:bg-gray-800/40';
  } else if (theme.name === 'Arcade Flash') {
    speciesIconContainerBg = 'bg-slate-200 dark:bg-zinc-700';
    reportIconContainerBg = 'bg-slate-200 dark:bg-zinc-700';
  } else if (theme.name === 'RetroTech Dark') {
    // For RetroTech Dark, all stat items use the mint green accent
    speciesIconColor = theme.brandColor;
    speciesValueColor = theme.brandColor;
    reportIconColor = theme.brandColor;
    reportValueColor = theme.brandColor;
  }

  let twitterCardColors = {
    bg: theme.button.secondary,
    text: theme.button.secondaryText,
    icon: theme.button.secondaryText,
  };
  let xhsCardColors = {
    bg: theme.button.secondary,
    text: theme.button.secondaryText,
    icon: theme.button.secondaryText,
  };

  if (theme.name === 'Modern Clean Pro') {
    twitterCardColors = {
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-500 dark:text-blue-400',
    };
    xhsCardColors = {
      bg: 'bg-rose-100 dark:bg-rose-900/50',
      text: 'text-rose-700 dark:text-rose-300',
      icon: 'text-rose-500 dark:text-rose-400',
    };
  } else if (theme.name === 'Nature Inspired') {
    twitterCardColors = {
      bg: 'bg-lime-100 dark:bg-green-800/70',
      text: 'text-green-700 dark:text-lime-200',
      icon: 'text-green-600 dark:text-lime-300',
    };
    xhsCardColors = {
      bg: 'bg-orange-100 dark:bg-amber-800/70',
      text: 'text-orange-700 dark:text-orange-200',
      icon: 'text-orange-500 dark:text-amber-400',
    };
  } else if (theme.name === 'Neon Galaxy') {
    twitterCardColors = {
      bg: 'bg-cyan-900/50 dark:bg-cyan-700/20',
      text: 'text-cyan-200 dark:text-cyan-100',
      icon: 'text-cyan-400 dark:text-cyan-300',
    };
    xhsCardColors = {
      bg: 'bg-pink-900/50 dark:bg-pink-700/20',
      text: 'text-pink-200 dark:text-pink-100',
      icon: 'text-pink-400 dark:text-pink-300',
    };
  } else if (theme.name === 'Arcade Flash') {
    twitterCardColors = {
      bg: 'bg-yellow-300 dark:bg-yellow-700/80',
      text: 'text-yellow-900 dark:text-yellow-200',
      icon: 'text-yellow-700 dark:text-yellow-400',
    };
    xhsCardColors = {
      bg: 'bg-red-300 dark:bg-red-700/80',
      text: 'text-red-900 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
    };
  } else if (theme.name === 'RetroTech Dark') {
    twitterCardColors = { bg: 'bg-slate-800', text: 'text-zinc-300', icon: 'text-emerald-400' };
    xhsCardColors = { bg: 'bg-slate-800', text: 'text-zinc-300', icon: 'text-amber-600' };
  }

  const pieChartColors = useMemo(() => {
    const modernLightColors = [
      '#3B82F6',
      '#60A5FA',
      '#93C5FD',
      '#A0AEC0',
      '#CBD5E0',
      '#34D399',
      '#6EE7B7',
      '#FBBF24',
      '#F472B6',
      '#C4B5FD',
    ];
    const modernDarkColors = [
      '#60A5FA',
      '#93C5FD',
      '#BFDBFE',
      '#A0AEC0',
      '#718096',
      '#6EE7B7',
      '#A7F3D0',
      '#FCD34D',
      '#F9A8D4',
      '#A78BFA',
    ];

    const natureLightColors = [
      '#4CAF50',
      '#8BC34A',
      '#CDDC39',
      '#AED581',
      '#795548',
      '#A1887F',
      '#2196F3',
      '#64B5F6',
      '#FFC107',
      '#FF9800',
    ];
    const natureDarkColors = [
      '#66BB6A',
      '#9CCC65',
      '#D4E157',
      '#C5E1A5',
      '#8D6E63',
      '#BCAAA4',
      '#42A5F5',
      '#90CAF9',
      '#FFEE58',
      '#FFB74D',
    ];

    const neonGalaxyColors = [
      '#22D3EE',
      '#06B6D4',
      '#4338CA',
      '#312E81',
      '#EC4899',
      '#DB2777',
      '#8B5CF6',
      '#A78BFA',
      '#FDE047',
      '#34D399',
    ];

    const arcadeFlashColors = [
      '#EF4444',
      '#FACC15',
      '#F97316',
      '#F87171',
      '#FDE047',
      '#FB923C',
      '#FEF3C7',
      '#DC2626',
      '#EAB308',
      '#FFFBEB',
    ];

    const retroTechDarkColors = [
      // Mint green shades and neutral grays
      '#2EE59D', // emerald-400
      '#10B981', // emerald-500
      '#6EE7B7', // emerald-300
      '#059669', // emerald-600
      '#A7F3D0', // emerald-200
      '#4A5568', // slate-600 (Tailwind zinc-600 equivalent)
      '#718096', // slate-500 (Tailwind zinc-500 equivalent)
      '#94A3B8', // slate-400 (Tailwind zinc-400 equivalent)
      '#047857', // emerald-700
      '#334155', // slate-700 (Tailwind zinc-700 equivalent)
    ];

    switch (theme.name) {
      case 'Modern Clean Pro':
        return isDarkMode ? modernDarkColors : modernLightColors;
      case 'Nature Inspired':
        return isDarkMode ? natureDarkColors : natureLightColors;
      case 'Neon Galaxy':
        return neonGalaxyColors;
      case 'Arcade Flash':
        return arcadeFlashColors;
      case 'RetroTech Dark':
        return retroTechDarkColors;
      default:
        return modernLightColors;
    }
  }, [theme.name, isDarkMode]);

  // Theme-specific color configurations for the map
  const mapThemeConfig = useMemo(() => {
    let visualMapColors: string[];
    let geoItemAreaColor: string;
    let geoItemBorderColor: string;
    let geoEmphasisAreaColor: string;
    let geoEmphasisBorderColor: string;
    let visualMapHandleColor: string;
    let tooltipTitleColor = '#B8860B'; // Default gold for modern
    let tooltipValueColor = theme.brandColor.split(' ')[0];

    switch (theme.name) {
      case 'Nature Inspired':
        visualMapColors = isDarkMode
          ? ['#A3E635', '#4D7C0F', '#22C55E', '#15803D', '#10B981']
          : ['#F0FDF4', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399'];
        geoItemAreaColor = isDarkMode ? '#052e16' : '#f0fdf4';
        geoItemBorderColor = isDarkMode ? '#166534' : '#dcfce7';
        geoEmphasisAreaColor = isDarkMode
          ? theme.brandColor.replace('text-', 'bg-').replace('-300', '-500')
          : theme.brandColor.replace('text-', 'bg-').replace('-700', '-200');
        geoEmphasisBorderColor = isDarkMode
          ? theme.brandColor.replace('text-', 'border-').replace('-300', '-400')
          : theme.brandColor.replace('text-', 'border-').replace('-700', '-500');
        visualMapHandleColor = theme.brandColor.startsWith('text-lime') ? '#84CC16' : '#22C55E';
        tooltipTitleColor = isDarkMode ? '#A3E635' : '#4D7C0F';
        break;
      case 'Neon Galaxy':
        visualMapColors = isDarkMode
          ? ['#312E81', '#4F46E5', '#38BDF8', '#A78BFA', '#F472B6']
          : ['#4338CA', '#6366F1', '#A5B4FC', '#7DD3FC', '#FBCFE8'];
        geoItemAreaColor = isDarkMode ? '#1e1b4b' : '#312e81';
        geoItemBorderColor = isDarkMode ? '#4338ca' : '#4f46e5';
        geoEmphasisAreaColor = isDarkMode ? '#5EEAD4' : '#38BDF8';
        geoEmphasisBorderColor = isDarkMode ? '#2DD4BF' : '#0EA5E9';
        visualMapHandleColor = '#38BDF8';
        tooltipTitleColor = isDarkMode ? '#5EEAD4' : '#38BDF8';
        break;
      case 'Arcade Flash':
        visualMapColors = isDarkMode
          ? ['#FDE047', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']
          : ['#FEF3C7', '#FDE68A', '#FACC15', '#FB923C', '#EF4444'];
        geoItemAreaColor = isDarkMode ? '#1f2937' : '#e5e7eb';
        geoItemBorderColor = isDarkMode ? '#4b5563' : '#9ca3af';
        geoEmphasisAreaColor = isDarkMode ? '#FDE047' : '#FACC15';
        geoEmphasisBorderColor = isDarkMode ? '#FACC15' : '#EAB308';
        visualMapHandleColor = '#FACC15';
        tooltipTitleColor = isDarkMode ? '#FDE047' : '#EAB308';
        break;
      case 'RetroTech Dark':
        visualMapColors = ['#151515', '#1F2937', '#374151', '#6EE7B7', '#2EE59D']; // From card bg -> desaturated -> mint greens
        geoItemAreaColor = '#1A1A2E'; // Theme primary background
        geoItemBorderColor = '#374151'; // A dark gray
        geoEmphasisAreaColor = '#2EE59D'; // Mint green accent
        geoEmphasisBorderColor = '#10B981'; // Darker mint green
        visualMapHandleColor = '#2EE59D'; // Mint green accent
        tooltipTitleColor = '#2EE59D'; // Mint green for tooltip title
        tooltipValueColor = '#6EE7B7'; // Lighter mint for value
        break;
      case 'Modern Clean Pro':
      default:
        visualMapColors = ['#E8F0F7', '#D0E1EE', '#B8D2E5', '#A0C3DC', '#FFD700'];
        geoItemAreaColor = isDarkMode ? '#2d3748' : '#edf2f7';
        geoItemBorderColor = isDarkMode ? '#4a5563' : '#cbd5e0';
        geoEmphasisAreaColor = '#FEF3C7';
        geoEmphasisBorderColor = '#FDBA74';
        visualMapHandleColor = '#FFD700';
        tooltipTitleColor = '#B8860B'; // Default gold
        tooltipValueColor = isDarkMode
          ? theme.brandColor.split(' ')[1]
          : theme.brandColor.split(' ')[0]; // Handles dark:text-blue-400
        break;
    }
    return {
      visualMapColors,
      geoItemAreaColor,
      geoItemBorderColor,
      geoEmphasisAreaColor,
      geoEmphasisBorderColor,
      visualMapHandleColor,
      tooltipTitleColor,
      tooltipValueColor,
    };
  }, [theme.name, theme.brandColor, isDarkMode]);

  return (
    <div className={`py-4 sm:py-5 ${theme.text} space-y-6`}>
      <div
        className={`flex flex-col ${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border || ''} p-4 sm:p-6`}
      >
        <div className='w-full'>
          <h1 className='text-2xl sm:text-3xl font-semibold mb-1'>Welcome back 👋🏻</h1>
          <p className={`${theme.card.secondaryText} text-sm sm:text-base mb-6 max-w-md`}>
            Let's birding!
          </p>
          {isLoadingSummary ? (
            <div className='flex justify-center items-center h-20'>
              <LoadingSpinner />
            </div>
          ) : summaryError ? (
            <ErrorDisplay error={summaryError} />
          ) : (
            summaryStats && (
              <div className='flex flex-col sm:flex-row sm:flex-wrap sm:justify-around items-start gap-x-8 gap-y-6 mt-8'>
                <StatDisplayItem
                  icon={<TimeIcon />}
                  title='2025活跃天数'
                  value={`${summaryStats.activeDays}天`}
                  iconColorClass={timeIconColor}
                  valueColorClass={timeValueColor}
                  iconContainerBgClass={timeIconContainerBg}
                />
                <StatDisplayItem
                  icon={<TwitterIcon />}
                  title='总鸟种数'
                  value={String(summaryStats.totalSpecies)}
                  iconColorClass={speciesIconColor}
                  valueColorClass={speciesValueColor}
                  iconContainerBgClass={speciesIconContainerBg}
                />
                <StatDisplayItem
                  icon={<DocumentTextIcon />}
                  title='报告数量'
                  value={String(summaryStats.reportCount)}
                  iconColorClass={reportIconColor}
                  valueColorClass={reportValueColor}
                  iconContainerBgClass={reportIconContainerBg}
                />
              </div>
            )
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-6'>
        <div
          className={`lg:col-span-1 ${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border || ''} p-4 sm:p-6`}
        >
          <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-1 sm:mb-2'>
            <div>
              <h2 className='text-xl sm:text-2xl font-semibold'>Top 10 Bird</h2>
              <p className={`${theme.card.secondaryText} text-sm`}>
                Species with the highest observation counts.
              </p>
            </div>
          </div>
          {isLoadingTopBirds ? (
            <div className='flex justify-center items-center h-[360px] sm:h-[400px] md:h-[420px]'>
              <LoadingSpinner />
            </div>
          ) : topBirdsError ? (
            <ErrorDisplay error={topBirdsError} />
          ) : (
            <div className='h-[360px] sm:h-[400px] md:h-[420px]'>
              <PieChart data={topBirdsData} colors={pieChartColors} />
            </div>
          )}
        </div>

        <div
          className={`lg:col-span-3 ${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border || ''} p-4 sm:p-6`}
        >
          <h2 className='text-xl sm:text-2xl font-semibold mb-4'>Bird Sighting Regions</h2>
          {isLoadingMapData ? (
            <div className='flex justify-center items-center h-[360px] sm:h-[400px] md:h-[420px]'>
              <LoadingSpinner />
            </div>
          ) : mapDataError ? (
            <ErrorDisplay error={mapDataError} />
          ) : (
            <div className='h-[360px] sm:h-[400px] md:h-[420px]'>
              <ChinaBirdMap data={mapChartData} themeConfig={mapThemeConfig} />
            </div>
          )}
        </div>
      </div>

      <div
        className={`w-full ${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border || ''} p-4 sm:p-6`}
      >
        <div className='flex items-center mb-3 sm:mb-4'>
          <DocumentTextIcon className={`w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 ${theme.brandColor}`} />
          <h2 className='text-xl sm:text-2xl font-semibold'>Recent Activity Timeline</h2>
        </div>
        {isLoadingBirdData ? (
          <div className='flex justify-center items-center h-40'>
            <LoadingSpinner />
          </div>
        ) : birdDataError ? (
          <ErrorDisplay error={birdDataError} />
        ) : (
          <BirdSightingTimeline records={allBirdSightings} />
        )}
      </div>

      <div className='w-full'>
        {isLoadingSocialStats ? (
          <div className='flex flex-col sm:flex-row gap-5 sm:gap-6 h-full items-center justify-center'>
            <LoadingSpinner />
          </div>
        ) : socialStatsError ? (
          <ErrorDisplay error={socialStatsError} />
        ) : (
          socialStats && (
            <div className='flex flex-col sm:flex-row gap-5 sm:gap-6'>
              <a
                href='https://www.birdreport.cn/home/member/page.html?param=eyJtZW1iZXJpZCI6NzQxMDIsInRzIjoxNzQ5MjgwMTA1MzU4fQ==&sign=d41d8cd98f00b204e9800998ecf8427e'
                target='_blank'
                rel='noopener noreferrer'
                className={`flex-1 block group cursor-pointer ${theme.card.rounded} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.input.focusRing
                  .replace('focus:ring-2', '')
                  .trim()
                  .split(' ')
                  .filter(c => !c.startsWith('focus:'))
                  .join(' ')} focus-visible:ring-offset-current`}
                aria-label='Visit 中国观鸟记录中心'
              >
                <SocialCard
                  icon={<TwitterIcon />}
                  cardTitle='中国观鸟记录中心'
                  text='我的观鸟记录。'
                  avatarSrc={socialStats.avatarUrl}
                  userName='黄不盈'
                  likes={socialStats.twitter.likes}
                  shares={socialStats.twitter.shares}
                  bgColorClass={twitterCardColors.bg}
                  textColorClass={twitterCardColors.text}
                  iconColorClass={twitterCardColors.icon}
                />
              </a>
              <a
                href='https://www.xiaohongshu.com/user/profile/6213b1e00000000010007fa2'
                target='_blank'
                rel='noopener noreferrer'
                className={`flex-1 block group cursor-pointer ${theme.card.rounded} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.input.focusRing
                  .replace('focus:ring-2', '')
                  .trim()
                  .split(' ')
                  .filter(c => !c.startsWith('focus:'))
                  .join(' ')} focus-visible:ring-offset-current`}
                aria-label='Visit 黄鸣鹤 on 小红书'
              >
                <SocialCard
                  icon={<XiaohongshuIcon />}
                  cardTitle='小红书'
                  text='分享我的观鸟日记和精彩瞬间！'
                  avatarSrc={socialStats.avatarUrl}
                  userName='黄鸣鹤'
                  likes={socialStats.xiaohongshu.likes}
                  shares={socialStats.xiaohongshu.shares}
                  bgColorClass={xhsCardColors.bg}
                  textColorClass={xhsCardColors.text}
                  iconColorClass={xhsCardColors.icon}
                />
              </a>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;

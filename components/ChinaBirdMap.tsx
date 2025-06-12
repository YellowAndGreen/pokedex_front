
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

declare var echarts: any;

interface RegionTooltipData {
  species: number;
  reports: number;
}

export interface RegionBirdData {
  name: string; 
  value: number; 
  tooltipData: RegionTooltipData;
}

interface MapThemeConfig {
  visualMapColors: string[];
  geoItemAreaColor: string;
  geoItemBorderColor: string;
  geoEmphasisAreaColor: string;
  geoEmphasisBorderColor: string;
  visualMapHandleColor: string;
  tooltipTitleColor: string;
  tooltipValueColor: string;
}

interface ChinaBirdMapProps {
  data: RegionBirdData[];
  themeConfig: MapThemeConfig; // Added themeConfig prop
}

const ChinaBirdMap: React.FC<ChinaBirdMapProps> = ({ data, themeConfig }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null); 
  const { isDarkMode } = useTheme(); // isDarkMode is still useful for general dark mode checks in ECharts

  useEffect(() => {
    if (chartRef.current && typeof echarts !== 'undefined') {
      chartInstanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null);

      const seriesData = data.map(item => ({
        name: item.name,
        value: item.value,
        tooltipData: item.tooltipData,
      }));

      const values = seriesData.map(item => item.value).filter(v => v !== undefined && v !== null && !isNaN(v));
      let minValue = values.length > 0 ? Math.min(...values) : 0;
      let maxValue = values.length > 0 ? Math.max(...values) : 10; 

      if (minValue === maxValue && values.length > 0) { 
          minValue = Math.max(0, minValue - 5); 
          maxValue = maxValue + 5;
      } else if (minValue === 0 && maxValue === 0 && values.length > 0) { 
          maxValue = 10; 
      }
      
      if (minValue >= maxValue) { 
         maxValue = minValue + 10;
      }
      
      const option = {
        tooltip: {
          trigger: 'item',
          confine: true,
          transitionDuration: 0.4,
          formatter: (params: any) => {
            if (params.data && params.data.tooltipData) {
              return `<strong style="color: ${themeConfig.tooltipTitleColor};">${params.name}</strong><br/>` +
                     `观测鸟种: <span style="font-weight:bold; color: ${themeConfig.tooltipValueColor}">${params.data.tooltipData.species}</span><br/>` +
                     `记录总数: <span style="font-weight:bold; color: ${themeConfig.tooltipValueColor}">${params.data.tooltipData.reports}</span>`;
            }
            return `<strong>${params.name}</strong><br/>暂无详细数据`;
          },
        },
        visualMap: {
          min: minValue,
          max: maxValue,
          left: '5%',
          bottom: '5%',
          text: ['高', '低'],
          calculable: true,
          orient: 'vertical',
          itemWidth: 20,
          itemHeight: 140,
          align: 'left',
          textGap: 25,
          inRange: { color: themeConfig.visualMapColors },
          textStyle: {
            color: isDarkMode ? '#ccc' : '#4a5568', 
            fontSize: 13,
            fontWeight: '500'
          },
          handleStyle: { color: themeConfig.visualMapHandleColor, borderColor: isDarkMode ? '#4A5563' : '#DFE6EE', borderWidth: 1, shadowBlur:3, shadowColor: 'rgba(120,120,120,0.3)'},
          indicatorStyle: { shadowBlur: 0 }
        },
        geo: {
          map: 'china',
          roam: true,
          zoom: 1.2,
          label: {
            show: true,
            color: isDarkMode ? '#9CA3AF' : '#5a6878',
            fontSize: 10,
            fontWeight: '400',
          },
          emphasis: {
            label: {
              show: true,
              color: isDarkMode ? '#E5E7EB' : '#374151',
              fontWeight: 'bold',
            },
            itemStyle: {
              areaColor: themeConfig.geoEmphasisAreaColor,
              borderColor: themeConfig.geoEmphasisBorderColor,
              borderWidth: 1.2,
              shadowColor: 'rgba(100, 100, 100, 0.4)', 
              shadowBlur: 12,
            }
          },
          itemStyle: {
            areaColor: themeConfig.geoItemAreaColor,
            borderColor: themeConfig.geoItemBorderColor,
            borderWidth: 0.7,
            shadowColor: 'rgba(150, 160, 180, 0.1)', 
            shadowBlur: 4,
            shadowOffsetX: 1,
            shadowOffsetY: 1,
          },
          select: { 
            label:{ color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 'bold'},
            itemStyle: {
                areaColor: themeConfig.geoEmphasisAreaColor, 
                borderColor: themeConfig.geoEmphasisBorderColor, 
            }
          },
          stateAnimation: {
            duration: 300,
            easing: 'cubicOut'
          }
        },
        series: [
          {
            name: '观鸟数据',
            type: 'map',
            geoIndex: 0, 
            data: seriesData,
            progressive: 1000,
            progressiveThreshold: 2000,
            animationDurationUpdate: 500,
            animationEasingUpdate: 'quinticInOut'
          }
        ]
      };

      chartInstanceRef.current.setOption(option);
    }

    const resizeHandler = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [data, themeConfig, isDarkMode]); 

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} aria-label="China map showing bird sighting data by region"></div>;
};

export default ChinaBirdMap;

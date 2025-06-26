import React, { useEffect, useRef, useState } from 'react';
import { initChart, setChartOption, addResponsiveSupport, disposeChart, createBaseChartOption, getThemeColors, ensureMapRegistered } from '../services/echarts';
import type { ECharts } from '../services/echarts';
import { useTheme } from '../contexts/ThemeContext';

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
  themeConfig: MapThemeConfig; // 恢复为必需属性
  className?: string;
}

const ChinaBirdMap: React.FC<ChinaBirdMapProps> = ({ data, themeConfig, className = '' }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const { isDarkMode } = useTheme(); // 使用原来的简单模式
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // 确保地图数据已注册
    ensureMapRegistered().then(() => {
      setIsMapReady(true);
    });
  }, []);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0 || !isMapReady) return;

    // 初始化图表
    const chart = initChart(chartRef.current, isDarkMode ? 'dark' : undefined, 'china-bird-map');
    chartInstanceRef.current = chart;

    // 添加响应式支持
    cleanupRef.current = addResponsiveSupport(chart);
    
    // 处理数据
    const seriesData = data.map(item => ({
      name: item.name,
      value: item.value,
      tooltipData: item.tooltipData,
    }));

    const values = seriesData
      .map(item => item.value)
      .filter(v => v !== undefined && v !== null && !isNaN(v));
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
            return (
              `<strong style="color: ${themeConfig.tooltipTitleColor};">${params.name}</strong><br/>` +
              `观测鸟种: <span style="font-weight:bold; color: ${themeConfig.tooltipValueColor}">${params.data.tooltipData.species}</span><br/>` +
              `记录总数: <span style="font-weight:bold; color: ${themeConfig.tooltipValueColor}">${params.data.tooltipData.reports}</span>`
            );
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
          fontWeight: '500',
        },
        handleStyle: {
          color: themeConfig.visualMapHandleColor,
          borderColor: isDarkMode ? '#4A5563' : '#DFE6EE',
          borderWidth: 1,
          shadowBlur: 3,
          shadowColor: 'rgba(120,120,120,0.3)',
        },
        indicatorStyle: { shadowBlur: 0 },
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
          },
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
          label: { color: isDarkMode ? '#E5E7EB' : '#374151', fontWeight: 'bold' },
          itemStyle: {
            areaColor: themeConfig.geoEmphasisAreaColor,
            borderColor: themeConfig.geoEmphasisBorderColor,
          },
        },
        stateAnimation: {
          duration: 300,
          easing: 'cubicOut',
        },
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
          animationEasingUpdate: 'quinticInOut',
        },
      ],
    };

    setChartOption(chart, option);

    return () => {
      // 清理响应式监听器
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      // 销毁图表实例
      disposeChart('china-bird-map');
      chartInstanceRef.current = null;
    };
  }, [data, isDarkMode, themeConfig, isMapReady]);

  if (!isMapReady) {
    return (
      <div className={`w-full h-96 ${className} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">加载地图数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '100%' }}
      aria-label='China map showing bird sighting data by region'
      className={className}
    />
  );
};

export default ChinaBirdMap;

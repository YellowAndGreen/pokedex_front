import React, { useEffect, useRef } from 'react';
import { initChart, setChartOption, addResponsiveSupport, disposeChart, createBaseChartOption, getThemeColors } from '../services/echarts';
import type { ECharts } from '../services/echarts';
import { useTheme } from '../contexts/ThemeContext';

interface RegionData {
  name: string;
  value: number;
  species: string[];
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
  data: RegionData[];
  className?: string;
  themeConfig?: MapThemeConfig; // 支持外部传入的主题配置
}

const ChinaBirdMap: React.FC<ChinaBirdMapProps> = ({ data, className = '', themeConfig }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const { themeName, isDarkMode } = useTheme();

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // 初始化图表
    const chart = initChart(chartRef.current, undefined, 'china-bird-map');
    chartInstanceRef.current = chart;

    // 添加响应式支持
    cleanupRef.current = addResponsiveSupport(chart);

    // 配置图表选项
    const themeColors = getThemeColors(themeName, isDarkMode);
    const baseOption = createBaseChartOption(themeName, isDarkMode);
    
    // 使用外部传入的主题配置或默认主题配置
    const mapColors = themeConfig?.visualMapColors || themeColors.mapColors || themeColors.series.slice(0, 3);

    const option = {
      ...baseOption,
      title: {
        text: '中国鸟类分布图',
        left: 'center',
        textStyle: {
          color: themeColors.text,
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        ...baseOption.tooltip,
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          if (!data) return '';
          return `
            <div>
              <strong>${data.name}</strong><br/>
              观察记录: ${data.value}次<br/>
              物种数量: ${data.species?.length || 0}种
            </div>
          `;
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map(d => d.value)),
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        textStyle: {
          color: themeColors.text
        },
        inRange: {
          color: mapColors
        }
      },
      series: [
        {
          name: '鸟类观察',
          type: 'map',
          map: 'china',
          roam: true,
          emphasis: {
            label: {
              show: true,
              color: themeColors.text
            },
            itemStyle: {
              areaColor: themeConfig?.geoEmphasisAreaColor || themeColors.primary,
              borderColor: themeConfig?.geoEmphasisBorderColor || themeColors.text
            }
          },
          data: data.map(item => ({
            name: item.name,
            value: item.value,
            species: item.species
          }))
        }
      ]
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
   }, [data, themeName, isDarkMode, themeConfig]);

  return (
    <div className={`w-full h-96 ${className}`}>
      <div ref={chartRef} className="w-full h-full" />
    </div>
  );
};

export default ChinaBirdMap;

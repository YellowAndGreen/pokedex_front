import React, { useEffect, useRef } from 'react';
import { initChart, setChartOption, addResponsiveSupport, disposeChart, createBaseChartOption, getThemeColors } from '../services/echarts';
import type { ECharts } from '../services/echarts';
import { useTheme } from '../contexts/ThemeContext';

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  className?: string;
  colors?: string[]; // 支持外部传入的颜色配置
}

const PieChart: React.FC<PieChartProps> = ({ data, title = '数据分布', className = '', colors: externalColors }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const { themeName, isDarkMode } = useTheme();

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    const chart = initChart(chartRef.current, undefined, 'pie-chart');
    chartInstanceRef.current = chart;

    // 添加响应式支持
    cleanupRef.current = addResponsiveSupport(chart);

    // 配置图表选项
    const themeColors = getThemeColors(themeName, isDarkMode);
    const baseOption = createBaseChartOption(themeName, isDarkMode);
    
    // 使用外部传入的颜色或主题颜色
    const chartColors = externalColors || themeColors.series;

    const option = {
      ...baseOption,
      color: chartColors, // 设置图表颜色
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: themeColors.text,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        ...baseOption.tooltip,
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: themeColors.text
        }
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: '50%',
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
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
      disposeChart('pie-chart');
      chartInstanceRef.current = null;
    };
  }, [data, title, themeName, isDarkMode, externalColors]);

  return (
    <div className={`w-full h-80 ${className}`}>
      <div ref={chartRef} className="w-full h-full" />
    </div>
  );
};

export default PieChart;

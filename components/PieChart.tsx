
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Make echarts available globally, assuming it's loaded from CDN
declare var echarts: any;

interface PieChartDataItem {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieChartDataItem[];
  colors: string[];
}

const PieChart: React.FC<PieChartProps> = ({ data, colors }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    if (chartRef.current && typeof echarts !== 'undefined' && data.length > 0) {
      chartInstanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null);

      const option = {
        title: {
          text: '鸟种记录次数分布 (玫瑰图)',
          left: 'center',
          top: 10, // Reduced top margin
          textStyle: {
            fontSize: 18, 
            fontWeight: 'bold',
            color: theme.card.text, 
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          top: 'bottom',
          data: data.map(item => item.name),
          textStyle: {
            color: theme.card.secondaryText, 
            fontSize: 11,
          },
          padding: [10, 5, 5, 5], // Reduced top padding
          itemGap: 8,
        },
        toolbox: { // Toolbox is now hidden
          show: false,
        },
        series: [
          {
            name: '记录次数',
            type: 'pie',
            radius: ['20%', '75%'], // Increased radius
            center: ['50%', '45%'], // Adjusted center for better vertical space utilization
            roseType: 'area',
            itemStyle: {
              borderRadius: 8,
              borderColor: theme.card.bg, 
              borderWidth: 0, 
            },
            data: data,
            label: {
              show: false, 
            },
            labelLine: {
              show: false, 
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
              },
            },
            color: colors,
          },
        ],
      };

      chartInstanceRef.current.setOption(option);
    } else if (chartInstanceRef.current && data.length === 0) {
        chartInstanceRef.current.clear(); 
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
  }, [data, colors, theme, isDarkMode]); 

  if (data.length === 0) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${theme.card.secondaryText}`}
        style={{ minHeight: '200px' }} 
      >
        No data to display for the pie chart.
      </div>
    );
  }

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} aria-label="Top 10 bird species rose pie chart"></div>;
};

export default PieChart;

/**
 * ECharts 工具模块
 * 提供统一的图表初始化、配置管理和主题支持
 */

import * as echarts from 'echarts';
import type { EChartsOption, ECharts } from 'echarts';

// 地图注册状态
let isMapRegistered = false;
let mapRegistrationPromise: Promise<void> | null = null;

// 注册中国地图 - 使用真实的中国地图数据
const registerChinaMap = async (): Promise<void> => {
  if (isMapRegistered) {
    return Promise.resolve();
  }

  if (mapRegistrationPromise) {
    return mapRegistrationPromise;
  }

  mapRegistrationPromise = (async () => {
    try {
      // 动态加载中国地图数据
      const response = await fetch('/china.json');
      const chinaGeoJson = await response.json();
      
      // 名称映射：将完整名称转换为简化名称
      const nameMapping: Record<string, string> = {
        '北京市': '北京',
        '天津市': '天津',
        '河北省': '河北',
        '山西省': '山西',
        '内蒙古自治区': '内蒙古',
        '辽宁省': '辽宁',
        '吉林省': '吉林',
        '黑龙江省': '黑龙江',
        '上海市': '上海',
        '江苏省': '江苏',
        '浙江省': '浙江',
        '安徽省': '安徽',
        '福建省': '福建',
        '江西省': '江西',
        '山东省': '山东',
        '河南省': '河南',
        '湖北省': '湖北',
        '湖南省': '湖南',
        '广东省': '广东',
        '广西壮族自治区': '广西',
        '海南省': '海南',
        '重庆市': '重庆',
        '四川省': '四川',
        '贵州省': '贵州',
        '云南省': '云南',
        '西藏自治区': '西藏',
        '陕西省': '陕西',
        '甘肃省': '甘肃',
        '青海省': '青海',
        '宁夏回族自治区': '宁夏',
        '新疆维吾尔自治区': '新疆',
        '香港特别行政区': '香港',
        '澳门特别行政区': '澳门',
        '台湾省': '台湾'
      };
      
      // 转换地图数据中的省份名称为简化版本
      if (chinaGeoJson.features) {
        chinaGeoJson.features.forEach((feature: any) => {
          if (feature.properties && feature.properties.name) {
            const originalName = feature.properties.name;
            const simplifiedName = nameMapping[originalName];
            if (simplifiedName) {
              feature.properties.name = simplifiedName;
            }
          }
        });
      }
      
      // 注册地图
      echarts.registerMap('china', chinaGeoJson);
      isMapRegistered = true;
      console.log('中国地图数据加载成功，省份名称已转换为简化版本');
    } catch (error) {
      console.error('加载中国地图数据失败:', error);
      // 如果加载失败，使用简化版本作为备份
      const fallbackGeoJson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "北京" },
            geometry: {
              type: "Polygon",
              coordinates: [[[116.0, 39.4], [117.4, 39.4], [117.4, 41.1], [115.4, 41.1], [115.4, 39.4], [116.0, 39.4]]]
            }
          },
          {
            type: "Feature", 
            properties: { name: "上海" },
            geometry: {
              type: "Polygon",
              coordinates: [[[120.9, 30.7], [122.2, 30.7], [122.2, 31.9], [120.9, 31.9], [120.9, 30.7]]]
            }
          },
          {
            type: "Feature",
            properties: { name: "广东" },
            geometry: {
              type: "Polygon",
              coordinates: [[[109.7, 20.2], [117.2, 20.2], [117.2, 25.5], [109.7, 25.5], [109.7, 20.2]]]
            }
          },
          {
            type: "Feature",
            properties: { name: "四川" },
            geometry: {
              type: "Polygon",
              coordinates: [[[97.3, 26.0], [108.5, 26.0], [108.5, 34.3], [97.3, 34.3], [97.3, 26.0]]]
            }
          },
          {
            type: "Feature",
            properties: { name: "新疆" },
            geometry: {
              type: "Polygon",
              coordinates: [[[73.4, 34.3], [96.4, 34.3], [96.4, 49.2], [73.4, 49.2], [73.4, 34.3]]]
            }
          }
        ]
      };
      echarts.registerMap('china', fallbackGeoJson);
      isMapRegistered = true;
      console.log('使用备份地图数据');
    }
  })();

  return mapRegistrationPromise;
};

// 图表实例管理
const chartInstances = new Map<string, ECharts>();

/**
 * 初始化ECharts实例
 * @param container DOM容器元素
 * @param theme 主题名称
 * @param instanceId 实例ID，用于管理多个图表
 * @returns ECharts实例
 */
export function initChart(
  container: HTMLElement,
  theme?: string,
  instanceId?: string
): ECharts {
  // 确保中国地图已注册
  registerChinaMap();
  
  const chart = echarts.init(container, theme);
  
  if (instanceId) {
    // 如果已存在同ID的实例，先销毁
    const existingChart = chartInstances.get(instanceId);
    if (existingChart) {
      existingChart.dispose();
    }
    chartInstances.set(instanceId, chart);
  }
  
  return chart;
}

/**
 * 获取已创建的图表实例
 * @param instanceId 实例ID
 * @returns ECharts实例或undefined
 */
export function getChart(instanceId: string): ECharts | undefined {
  return chartInstances.get(instanceId);
}

/**
 * 销毁图表实例
 * @param instanceId 实例ID
 */
export function disposeChart(instanceId: string): void {
  const chart = chartInstances.get(instanceId);
  if (chart) {
    chart.dispose();
    chartInstances.delete(instanceId);
  }
}

/**
 * 销毁所有图表实例
 */
export function disposeAllCharts(): void {
  chartInstances.forEach(chart => chart.dispose());
  chartInstances.clear();
}

/**
 * 设置图表配置
 * @param chart ECharts实例
 * @param option 配置选项
 * @param notMerge 是否不合并配置
 */
export function setChartOption(
  chart: ECharts,
  option: any,
  notMerge?: boolean
): void {
  chart.setOption(option, notMerge);
}

/**
 * 响应式调整图表大小
 * @param chart ECharts实例
 */
export function resizeChart(chart: ECharts): void {
  chart.resize();
}

/**
 * 为图表添加响应式支持
 * @param chart ECharts实例
 * @returns 清理函数
 */
export function addResponsiveSupport(chart: ECharts): () => void {
  const handleResize = () => {
    // 检查图表实例是否仍然有效
    if (!chart.isDisposed()) {
      chart.resize();
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}

/**
 * 根据主题获取ECharts颜色配置
 * @param theme 当前主题
 * @param isDarkMode 是否为暗色模式
 * @returns 颜色配置
 */
export function getThemeColors(theme: string, isDarkMode: boolean = false) {
  // 与AnalyticsPage保持一致的颜色配置
  const modernLightColors = ['#3B82F6', '#60A5FA', '#93C5FD', '#A0AEC0', '#CBD5E0', '#34D399', '#6EE7B7', '#FBBF24', '#F472B6', '#C4B5FD'];
  const modernDarkColors = ['#60A5FA', '#93C5FD', '#BFDBFE', '#A0AEC0', '#718096', '#6EE7B7', '#A7F3D0', '#FCD34D', '#F9A8D4', '#A78BFA'];
  
  const natureLightColors = ['#4CAF50', '#8BC34A', '#CDDC39', '#AED581', '#795548', '#A1887F', '#2196F3', '#64B5F6', '#FFC107', '#FF9800'];
  const natureDarkColors = ['#66BB6A', '#9CCC65', '#D4E157', '#C5E1A5', '#8D6E63', '#BCAAA4', '#42A5F5', '#90CAF9', '#FFEE58', '#FFB74D'];
  
  const neonGalaxyColors = ['#22D3EE', '#06B6D4', '#4338CA', '#312E81', '#EC4899', '#DB2777', '#8B5CF6', '#A78BFA', '#FDE047', '#34D399'];
  
  const arcadeFlashColors = ['#EF4444', '#FACC15', '#F97316', '#F87171', '#FDE047', '#FB923C', '#FEF3C7', '#DC2626', '#EAB308', '#FFFBEB'];
  
  const retroTechDarkColors = ['#2EE59D', '#10B981', '#6EE7B7', '#059669', '#A7F3D0', '#4A5568', '#718096', '#94A3B8', '#047857', '#334155'];

  // 地图专用的visualMap颜色配置，与AnalyticsPage保持一致
  const getMapColors = (themeName: string) => {
    switch (themeName) {
      case 'nature':
        return isDarkMode
          ? ['#A3E635', '#4D7C0F', '#22C55E', '#15803D', '#10B981']
          : ['#F0FDF4', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399'];
      case 'neonGalaxy':
        return isDarkMode
          ? ['#312E81', '#4F46E5', '#38BDF8', '#A78BFA', '#F472B6']
          : ['#4338CA', '#6366F1', '#A5B4FC', '#7DD3FC', '#FBCFE8'];
      case 'arcadeFlash':
        return isDarkMode
          ? ['#FDE047', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']
          : ['#FEF3C7', '#FDE68A', '#FACC15', '#FB923C', '#EF4444'];
      case 'retroTechDark':
        return ['#151515', '#1F2937', '#374151', '#6EE7B7', '#2EE59D'];
      case 'modern':
      default:
        return ['#E8F0F7', '#D0E1EE', '#B8D2E5', '#A0C3DC', '#FFD700'];
    }
  };

  const colorSchemes = {
    modern: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: isDarkMode ? '#1e293b' : '#f8fafc',
      text: isDarkMode ? '#e2e8f0' : '#334155',
      series: isDarkMode ? modernDarkColors : modernLightColors,
      mapColors: getMapColors('modern')
    },
    nature: {
      primary: '#059669',
      secondary: '#6b7280',
      background: isDarkMode ? '#052e16' : '#f0fdf4',
      text: isDarkMode ? '#d1fae5' : '#374151',
      series: isDarkMode ? natureDarkColors : natureLightColors,
      mapColors: getMapColors('nature')
    },
    neonGalaxy: {
      primary: '#22d3ee',
      secondary: '#64748b',
      background: '#0f0f23',
      text: '#e2e8f0',
      series: neonGalaxyColors,
      mapColors: getMapColors('neonGalaxy')
    },
    arcadeFlash: {
      primary: '#ef4444',
      secondary: '#64748b',
      background: '#0f172a',
      text: '#f1f5f9',
      series: arcadeFlashColors,
      mapColors: getMapColors('arcadeFlash')
    },
    retroTechDark: {
      primary: '#2ee59d',
      secondary: '#64748b',
      background: '#151515',
      text: '#e2e8f0',
      series: retroTechDarkColors,
      mapColors: getMapColors('retroTechDark')
    }
  };
  
  return colorSchemes[theme as keyof typeof colorSchemes] || colorSchemes.modern;
}

/**
 * 创建通用的图表基础配置
 * @param theme 当前主题
 * @param isDarkMode 是否为暗色模式
 * @returns 基础配置
 */
export function createBaseChartOption(theme: string, isDarkMode: boolean = false): EChartsOption {
  const colors = getThemeColors(theme, isDarkMode);
  
  return {
    color: colors.series,
    backgroundColor: 'transparent',
    textStyle: {
      color: colors.text,
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      backgroundColor: colors.background,
      borderColor: colors.primary,
      textStyle: {
        color: colors.text
      }
    }
  };
}

/**
 * 确保地图已注册
 * @returns Promise<void>
 */
export function ensureMapRegistered(): Promise<void> {
  return registerChinaMap();
}

// 导出echarts核心对象供高级用法
export { echarts };
export type { EChartsOption, ECharts }; 
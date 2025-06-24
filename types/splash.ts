/**
 * 开屏动画相关的TypeScript类型定义
 * 提供完整的类型安全支持
 */

// ==================== 基础枚举类型 ====================

/**
 * 动画阶段枚举
 */
export enum SplashAnimationPhase {
  LOADING = 'loading',
  LOADED = 'loaded', 
  HIDDEN = 'hidden'
}

/**
 * 动画缓动函数类型
 */
export type AnimationEasing = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier(number, number, number, number)';

/**
 * CSS混合模式类型
 */
export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

// ==================== 动画状态接口 ====================

/**
 * 开屏动画状态接口
 */
export interface SplashAnimationState {
  /** 当前动画阶段 */
  phase: SplashAnimationPhase;
  /** 加载进度 (0-100) */
  progress: number;
  /** 动画是否可见 */
  isVisible: boolean;
  /** 是否有错误 */
  hasError: boolean;
}

/**
 * 扩展的动画状态接口
 */
export interface ExtendedSplashAnimationState extends SplashAnimationState {
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否已加载完成 */
  isLoaded: boolean;
  /** 是否已隐藏 */
  isHidden: boolean;
  /** 进度是否完成 */
  isComplete: boolean;
}

// ==================== 配置接口 ====================

/**
 * 位置配置接口
 */
export interface PositionConfig {
  x: string;
  y: string;
}

/**
 * 颜色配置接口
 */
export interface ColorConfig {
  primary: string;
  secondary: string;
  tertiary?: string;
  border?: string;
  icon?: string;
}

/**
 * 字体配置接口
 */
export interface FontConfig {
  title: string;
  description: string;
}

/**
 * 动画延时配置接口
 */
export interface AnimationDelayConfig {
  title: number;
  line: number;
  description: number;
}

/**
 * 动画持续时间配置接口
 */
export interface AnimationDurationConfig {
  title: number;
  line: number;
  description: number;
}

/**
 * 动画时长配置接口
 */
export interface AnimationTimingConfig {
  duration: number;
  showTime: number;
  progressStep: number;
  autoHide: boolean;
}

// ==================== 组件属性接口 ====================

/**
 * 几何背景组件属性
 */
export interface GeometricBackgroundProps {
  opacity?: number;
  colors?: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  positions?: {
    circle1: PositionConfig;
    circle2: PositionConfig;
    circle3: PositionConfig;
  };
}

/**
 * 网格背景组件属性
 */
export interface GridBackgroundProps {
  opacity?: number;
  gridSize?: number;
  lineColor?: string;
  animationDuration?: number;
  animationEnabled?: boolean;
}

/**
 * 旋转光线组件属性
 */
export interface RotatingLightProps {
  opacity?: number;
  rotationDuration?: number;
  lightColors?: string[];
  animationEnabled?: boolean;
  blendMode?: BlendMode;
}

/**
 * Logo容器组件属性
 */
export interface LogoContainerProps {
  logoSize?: number;
  glowSize?: number;
  glowColor?: string;
  logoColors?: ColorConfig;
  animationEnabled?: boolean;
  floatDuration?: number;
  glowDuration?: number;
}

/**
 * 应用标题组件属性
 */
export interface AppTitleProps {
  title?: string;
  description?: string;
  titleColor?: string;
  descriptionColor?: string;
  lineColor?: string;
  fontSize?: FontConfig;
  animationEnabled?: boolean;
  animationDelays?: AnimationDelayConfig;
  animationDurations?: AnimationDurationConfig;
}

/**
 * 进度条组件属性
 */
export interface ProgressBarProps {
  progress?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  progressColors?: string[];
  animationEnabled?: boolean;
  animationDuration?: number;
  showPercentage?: boolean;
  className?: string;
}

/**
 * 开屏动画主组件配置
 */
export interface SplashConfig {
  duration: number;
  showTime: number;
  title: string;
  description: string;
}

/**
 * 开屏动画主组件属性
 */
export interface SplashScreenProps {
  onAnimationComplete?: () => void;
  config?: Partial<SplashConfig>;
}

// ==================== Hook配置接口 ====================

/**
 * 开屏动画Hook配置接口
 */
export interface SplashAnimationConfig {
  /** 动画持续时间(毫秒) */
  duration?: number;
  /** 显示时间(毫秒) */
  showTime?: number;
  /** 进度步长 */
  progressStep?: number;
  /** 是否自动隐藏 */
  autoHide?: boolean;
  /** 阶段变化回调 */
  onPhaseChange?: (phase: SplashAnimationPhase) => void;
  /** 进度变化回调 */
  onProgressChange?: (progress: number) => void;
  /** 完成回调 */
  onComplete?: () => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

/**
 * Hook返回值接口
 */
export interface SplashAnimationHookReturn extends ExtendedSplashAnimationState {
  /** 隐藏动画 */
  hide: () => void;
  /** 显示动画 */
  show: () => void;
  /** 重置动画 */
  reset: () => void;
  /** 设置错误状态 */
  setError: (error: Error) => void;
  /** 配置信息 */
  config: AnimationTimingConfig;
}

// ==================== 事件接口 ====================

/**
 * 动画事件接口
 */
export interface SplashAnimationEvent {
  type: 'phase-change' | 'progress-change' | 'complete' | 'error';
  phase?: SplashAnimationPhase;
  progress?: number;
  error?: Error;
  timestamp: number;
}

/**
 * 动画事件处理器类型
 */
export type SplashAnimationEventHandler = (event: SplashAnimationEvent) => void;

// ==================== 工具类型 ====================

/**
 * 可选化所有属性的工具类型
 */
export type PartialSplashConfig<T> = {
  [P in keyof T]?: T[P];
};

/**
 * 必需化指定属性的工具类型
 */
export type RequiredSplashConfig<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 动画组件的基础属性
 */
export interface BaseAnimationProps {
  animationEnabled?: boolean;
  className?: string;
  'aria-hidden'?: boolean;
}

/**
 * 响应式断点枚举
 */
export enum ResponsiveBreakpoint {
  DESKTOP = 'desktop',
  TABLET = 'tablet', 
  MOBILE = 'mobile',
  SMALL = 'small'
}

/**
 * 响应式配置接口
 */
export interface ResponsiveConfig<T> {
  [ResponsiveBreakpoint.DESKTOP]?: T;
  [ResponsiveBreakpoint.TABLET]?: T;
  [ResponsiveBreakpoint.MOBILE]?: T;
  [ResponsiveBreakpoint.SMALL]?: T;
}

// ==================== 常量类型 ====================

/**
 * 默认动画时长常量
 */
export const ANIMATION_DURATIONS = {
  FAST: 300,
  NORMAL: 600,
  SLOW: 1000,
  EXTRA_SLOW: 2000
} as const;

/**
 * 默认缓动函数常量
 */
export const ANIMATION_EASINGS = {
  LINEAR: 'linear',
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const;

// ==================== 导出常量类型 ====================

// 导出常量类型
export type AnimationDurationKeys = keyof typeof ANIMATION_DURATIONS;
export type AnimationEasingKeys = keyof typeof ANIMATION_EASINGS; 
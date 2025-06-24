/**
 * WebGL图像查看器接口定义
 */

// 滚轮配置接口
export interface WheelConfig {
  step: number;                    // 缩放步长
  wheelDisabled: boolean;          // 是否禁用滚轮
  touchPadDisabled: boolean;       // 是否禁用触摸板
}

// 手势缩放配置接口
export interface PinchConfig {
  step: number;                    // 缩放步长
  disabled: boolean;               // 是否禁用手势缩放
}

// 双击配置接口
export interface DoubleClickConfig {
  step: number;                    // 缩放步长
  disabled: boolean;               // 是否禁用双击
  mode: 'toggle' | 'zoom';         // 双击模式：切换或缩放
  animationTime: number;           // 动画时间(ms)
}

// 平移配置接口
export interface PanningConfig {
  disabled: boolean;               // 是否禁用平移
  velocityDisabled: boolean;       // 是否禁用惯性滑动
}

// 对齐动画配置接口
export interface AlignmentAnimationConfig {
  sizeX: number;                   // X轴对齐尺寸
  sizeY: number;                   // Y轴对齐尺寸
  velocityAlignmentTime: number;   // 速度对齐时间
}

// 速度动画配置接口
export interface VelocityAnimationConfig {
  sensitivity: number;             // 灵敏度
  animationTime: number;           // 动画时间
}

// 查看器状态接口
export interface ViewerState {
  scale: number;                   // 当前缩放比例
  translateX: number;              // X轴平移量
  translateY: number;              // Y轴平移量
  isDragging: boolean;             // 是否正在拖拽
  isAnimating: boolean;            // 是否正在动画
  imageLoaded: boolean;            // 图片是否已加载
  canvasWidth: number;             // 画布宽度
  canvasHeight: number;            // 画布高度
  imageWidth: number;              // 图片宽度
  imageHeight: number;             // 图片高度
}

// 瓦片信息接口
export interface TileInfo {
  texture: WebGLTexture | null;    // WebGL纹理
  lastUsed: number;                // 最后使用时间
  loading: boolean;                // 是否正在加载
  priority: number;                // 优先级
}

// LOD配置接口
export interface LODConfig {
  scale: number;                   // 缩放比例
}

// 瓦片请求接口
export interface TileRequest {
  key: string;                     // 瓦片键
  priority: number;                // 优先级
}

// 加载中的瓦片信息接口
export interface LoadingTileInfo {
  priority: number;                // 优先级
}

// WebGL图像查看器属性接口
export interface WebGLImageViewerProps {
  src: string;                                    // 图片源URL
  className?: string;                             // CSS类名
  width?: number;                                 // 预知图片宽度
  height?: number;                                // 预知图片高度
  initialScale?: number;                          // 初始缩放比例
  minScale?: number;                              // 最小缩放比例
  maxScale?: number;                              // 最大缩放比例
  wheel?: Partial<WheelConfig>;                   // 滚轮配置
  pinch?: Partial<PinchConfig>;                   // 手势配置
  doubleClick?: Partial<DoubleClickConfig>;       // 双击配置
  panning?: Partial<PanningConfig>;               // 平移配置
  limitToBounds?: boolean;                        // 是否限制边界
  centerOnInit?: boolean;                         // 是否初始居中
  smooth?: boolean;                               // 是否平滑动画
  alignmentAnimation?: Partial<AlignmentAnimationConfig>; // 对齐动画配置
  velocityAnimation?: Partial<VelocityAnimationConfig>;   // 速度动画配置
  onZoomChange?: (originalScale: number, relativeScale: number) => void; // 缩放变化回调
  onImageCopied?: () => void;                     // 图片复制回调
  onLoadingStateChange?: (                        // 加载状态变化回调
    isLoading: boolean,
    message?: string,
    quality?: 'high' | 'medium' | 'low' | 'unknown'
  ) => void;
  debug?: boolean;                                // 是否启用调试模式
}

// WebGL图像查看器引用接口
export interface WebGLImageViewerRef {
  zoomIn: (animated?: boolean) => void;           // 放大
  zoomOut: (animated?: boolean) => void;          // 缩小
  resetZoom: (animated?: boolean) => void;        // 重置缩放
  fitToScreen: (animated?: boolean) => void;      // 适应屏幕
  zoomTo: (scale: number, animated?: boolean) => void; // 缩放到指定比例
  zoomAt: (x: number, y: number, scaleFactor: number, animated?: boolean) => void; // 在指定点缩放
  getState: () => ViewerState;                    // 获取当前状态
  copyOriginalImageToClipboard: () => Promise<void>; // 复制原图到剪贴板
  forceRender: () => void;                        // 强制重新渲染（调试用）
}

// 工作线程消息类型
export type WorkerMessageType = 
  | 'init'
  | 'create-tile'
  | 'tile-ready'
  | 'error';

// 工作线程消息接口
export interface WorkerMessage {
  type: WorkerMessageType;
  payload?: any;
}

// 工作线程初始化消息
export interface WorkerInitMessage extends WorkerMessage {
  type: 'init';
  payload: {
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
  };
}

// 创建瓦片消息
export interface WorkerCreateTileMessage extends WorkerMessage {
  type: 'create-tile';
  payload: {
    x: number;
    y: number;
    lodLevel: number;
    lodConfig: LODConfig;
    imageWidth: number;
    imageHeight: number;
    key: string;
  };
}

// 瓦片就绪消息
export interface WorkerTileReadyMessage extends WorkerMessage {
  type: 'tile-ready';
  payload: {
    key: string;
    imageData: ImageData;
    x: number;
    y: number;
    lodLevel: number;
  };
}

// 工作线程错误消息
export interface WorkerErrorMessage extends WorkerMessage {
  type: 'error';
  payload: {
    message: string;
    key?: string;
  };
} 
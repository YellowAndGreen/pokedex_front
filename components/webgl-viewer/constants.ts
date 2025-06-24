/**
 * WebGL图像查看器常量配置
 */

import type {
  WheelConfig,
  PinchConfig,
  DoubleClickConfig,
  PanningConfig,
  AlignmentAnimationConfig,
  VelocityAnimationConfig,
  LODConfig
} from './interfaces';

// 瓦片系统常量
export const TILE_SIZE = 256;                    // 瓦片大小（像素）
export const TILE_CACHE_SIZE = 100;              // 瓦片缓存数量
export const MAX_TILES_PER_FRAME = 3;            // 每帧最大瓦片加载数量

// 简化的LOD级别配置
export const SIMPLE_LOD_LEVELS: readonly LODConfig[] = [
  { scale: 0.25 },  // 极低质量
  { scale: 0.5 },   // 低质量
  { scale: 1 },     // 正常质量
  { scale: 2 },     // 高质量
  { scale: 4 },     // 超高质量
] as const;

// 默认滚轮配置
export const DEFAULT_WHEEL_CONFIG: WheelConfig = {
  step: 0.1,
  wheelDisabled: false,
  touchPadDisabled: false,
};

// 默认手势缩放配置
export const DEFAULT_PINCH_CONFIG: PinchConfig = {
  step: 0.5,
  disabled: false,
};

// 默认双击配置
export const DEFAULT_DOUBLE_CLICK_CONFIG: DoubleClickConfig = {
  step: 2,
  disabled: false,
  mode: 'toggle',
  animationTime: 200,
};

// 默认平移配置
export const DEFAULT_PANNING_CONFIG: PanningConfig = {
  disabled: false,
  velocityDisabled: true,
};

// 默认对齐动画配置
export const DEFAULT_ALIGNMENT_ANIMATION: AlignmentAnimationConfig = {
  sizeX: 0,
  sizeY: 0,
  velocityAlignmentTime: 0.2,
};

// 默认速度动画配置
export const DEFAULT_VELOCITY_ANIMATION: VelocityAnimationConfig = {
  sensitivity: 1,
  animationTime: 0.2,
};

// WebGL着色器源码
export const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  
  uniform mat3 u_matrix;
  
  varying vec2 v_texCoord;
  
  void main() {
    vec3 position = u_matrix * vec3(a_position, 1);
    gl_Position = vec4(position.xy, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

export const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  
  uniform sampler2D u_texture;
  uniform float u_opacity;
  
  varying vec2 v_texCoord;
  
  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    gl_FragColor = vec4(color.rgb, color.a * u_opacity);
  }
`;

// 动画相关常量
export const DEFAULT_ANIMATION_DURATION = 300;   // 默认动画持续时间(ms)
export const MIN_SCALE = 0.1;                    // 最小缩放比例
export const MAX_SCALE = 10.0;                   // 最大缩放比例
export const INITIAL_SCALE = 1.0;                // 初始缩放比例

// 性能相关常量
export const RENDER_FPS = 60;                    // 目标渲染帧率
export const DEBOUNCE_TIME = 16;                 // 防抖时间(ms) - 约60fps
export const VIEWPORT_CHANGE_THRESHOLD = 0.001;  // 视口变化阈值

// 触摸和手势常量
export const DOUBLE_TAP_DELAY = 300;             // 双击检测延迟(ms)
export const DOUBLE_TAP_DISTANCE = 50;           // 双击检测距离(px)
export const MIN_PINCH_DISTANCE = 10;            // 最小手势距离(px)

// 错误消息
export const ERROR_MESSAGES = {
  WEBGL_NOT_SUPPORTED: '您的浏览器不支持WebGL，无法使用高级图片查看功能',
  WEBGL_CONTEXT_LOST: 'WebGL上下文丢失，正在尝试恢复',
  IMAGE_LOAD_FAILED: '图片加载失败',
  SHADER_COMPILE_ERROR: '着色器编译失败',
  PROGRAM_LINK_ERROR: '着色器程序链接失败',
  TEXTURE_CREATE_ERROR: '纹理创建失败',
} as const;

// 调试相关常量
export const DEBUG_COLORS = {
  TILE_BORDER: 'rgba(255, 0, 0, 0.5)',
  VIEWPORT_BOUNDS: 'rgba(0, 255, 0, 0.3)',
  CENTER_POINT: 'rgba(255, 255, 0, 0.8)',
} as const; 
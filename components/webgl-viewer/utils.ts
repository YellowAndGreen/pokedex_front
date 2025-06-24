/**
 * WebGL图像查看器工具函数
 */

import { ERROR_MESSAGES } from './constants';

// WebGL工具函数

/**
 * 创建着色器
 * @param gl WebGL上下文
 * @param type 着色器类型
 * @param source 着色器源码
 * @returns 编译后的着色器
 */
export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error(ERROR_MESSAGES.SHADER_COMPILE_ERROR);
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`${ERROR_MESSAGES.SHADER_COMPILE_ERROR}: ${info}`);
  }

  return shader;
}

/**
 * 创建着色器程序
 * @param gl WebGL上下文
 * @param vertexShader 顶点着色器
 * @param fragmentShader 片段着色器
 * @returns 链接后的着色器程序
 */
export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error(ERROR_MESSAGES.PROGRAM_LINK_ERROR);
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`${ERROR_MESSAGES.PROGRAM_LINK_ERROR}: ${info}`);
  }

  return program;
}

/**
 * 检查WebGL支持
 * @param canvas Canvas元素
 * @returns WebGL上下文或null
 */
export function getWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  try {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl as WebGLRenderingContext | null;
  } catch (error) {
    console.warn('WebGL context creation failed:', error);
    return null;
  }
}

/**
 * 创建WebGL纹理
 * @param gl WebGL上下文
 * @param source 图像源
 * @returns WebGL纹理
 */
export function createTexture(
  gl: WebGLRenderingContext,
  source: HTMLCanvasElement | HTMLImageElement | ImageBitmap
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

  return texture;
}

// 数学计算工具函数

/**
 * 创建2D变换矩阵
 * @param translateX X轴平移
 * @param translateY Y轴平移
 * @param scaleX X轴缩放
 * @param scaleY Y轴缩放
 * @returns 3x3变换矩阵
 */
export function createTransformMatrix(
  translateX: number,
  translateY: number,
  scaleX: number,
  scaleY: number
): Float32Array {
  return new Float32Array([
    scaleX, 0, 0,
    0, scaleY, 0,
    translateX, translateY, 1
  ]);
}

/**
 * 矩阵乘法
 * @param a 矩阵A (3x3)
 * @param b 矩阵B (3x3)
 * @returns 结果矩阵
 */
export function multiplyMatrix(a: Float32Array, b: Float32Array): Float32Array {
  const result = new Float32Array(9);
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result[i * 3 + j] = 
        a[i * 3 + 0] * b[0 * 3 + j] +
        a[i * 3 + 1] * b[1 * 3 + j] +
        a[i * 3 + 2] * b[2 * 3 + j];
    }
  }
  
  return result;
}

/**
 * 屏幕坐标转画布坐标
 * @param clientX 屏幕X坐标
 * @param clientY 屏幕Y坐标
 * @param rect 画布边界矩形
 * @returns 画布坐标
 */
export function screenToCanvas(
  clientX: number,
  clientY: number,
  rect: DOMRect
): { x: number; y: number } {
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

/**
 * 画布坐标转图像坐标
 * @param canvasX 画布X坐标
 * @param canvasY 画布Y坐标
 * @param scale 缩放比例
 * @param translateX X轴平移
 * @param translateY Y轴平移
 * @param canvasWidth 画布宽度
 * @param canvasHeight 画布高度
 * @returns 图像坐标
 */
export function canvasToImage(
  canvasX: number,
  canvasY: number,
  scale: number,
  translateX: number,
  translateY: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: (canvasX - canvasWidth / 2 - translateX) / scale,
    y: (canvasY - canvasHeight / 2 - translateY) / scale
  };
}

/**
 * 限制数值范围
 * @param value 数值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值
 * @param start 起始值
 * @param end 结束值
 * @param t 插值参数 (0-1)
 * @returns 插值结果
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 缓动函数 - 四次方程出
 * @param t 时间参数 (0-1)
 * @returns 缓动值
 */
export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * 缓动函数 - 三次方程出
 * @param t 时间参数 (0-1)
 * @returns 缓动值
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// 事件处理工具函数

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 限制时间
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 获取触摸点之间的距离
 * @param touch1 触摸点1
 * @param touch2 触摸点2
 * @returns 距离
 */
export function getTouchDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 获取触摸点的中心坐标
 * @param touch1 触摸点1
 * @param touch2 触摸点2
 * @returns 中心坐标
 */
export function getTouchCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  };
}

// 纹理处理工具函数

/**
 * 加载图片
 * @param src 图片URL
 * @returns Promise<HTMLImageElement>
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // 验证URL
    if (!src || typeof src !== 'string' || src.trim() === '') {
      reject(new Error('图片URL为空或无效'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeout = setTimeout(() => {
      reject(new Error(`图片加载超时: ${src}`));
    }, 30000); // 30秒超时

    img.onload = () => {
      clearTimeout(timeout);
      console.log('图片加载成功:', src, `${img.width}x${img.height}`);
      resolve(img);
    };
    
    img.onerror = (event) => {
      clearTimeout(timeout);
      console.error('图片加载失败:', src, event);
      
      // 提供更详细的错误信息
      let errorMessage = `图片加载失败: ${src}`;
      
      // 检查是否是CORS问题
      if (src.startsWith('http') && !src.startsWith(window.location.origin)) {
        errorMessage += ' (可能是CORS问题)';
      }
      
      // 检查是否是文件路径问题
      if (src.startsWith('/') && !src.startsWith('//')) {
        errorMessage += ' (检查文件路径是否正确)';
      }
      
      reject(new Error(errorMessage));
    };
    
    try {
      img.src = src;
      console.log('开始加载图片:', src);
    } catch (error) {
      clearTimeout(timeout);
      reject(new Error(`设置图片源失败: ${error}`));
    }
  });
}

/**
 * 创建离屏Canvas
 * @param width 宽度
 * @param height 高度
 * @returns Canvas和2D上下文
 */
export function createOffscreenCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建2D画布上下文');
  }
  
  return { canvas, ctx };
}

/**
 * 调整图片大小
 * @param image 原始图片
 * @param targetWidth 目标宽度
 * @param targetHeight 目标高度
 * @returns 调整后的Canvas
 */
export function resizeImage(
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreenCanvas(targetWidth, targetHeight);
  
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  
  return canvas;
}

/**
 * 计算适应尺寸
 * @param sourceWidth 原始宽度
 * @param sourceHeight 原始高度
 * @param targetWidth 目标宽度
 * @param targetHeight 目标高度
 * @returns 适应后的尺寸
 */
export function calculateFitSize(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): { width: number; height: number; scale: number } {
  const scaleX = targetWidth / sourceWidth;
  const scaleY = targetHeight / sourceHeight;
  const scale = Math.min(scaleX, scaleY);
  
  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
    scale
  };
} 
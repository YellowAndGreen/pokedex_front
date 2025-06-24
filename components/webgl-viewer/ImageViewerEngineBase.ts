/**
 * WebGL图像查看器引擎基类
 * 提供通用的状态管理和生命周期方法
 */

import type {
  ViewerState,
  WebGLImageViewerProps,
  WheelConfig,
  PinchConfig,
  DoubleClickConfig,
  PanningConfig,
  AlignmentAnimationConfig,
  VelocityAnimationConfig
} from './interfaces';
import {
  DEFAULT_WHEEL_CONFIG,
  DEFAULT_PINCH_CONFIG,
  DEFAULT_DOUBLE_CLICK_CONFIG,
  DEFAULT_PANNING_CONFIG,
  DEFAULT_ALIGNMENT_ANIMATION,
  DEFAULT_VELOCITY_ANIMATION,
  INITIAL_SCALE,
  MIN_SCALE,
  MAX_SCALE,
  DEFAULT_ANIMATION_DURATION
} from './constants';

export abstract class ImageViewerEngineBase {
  // Canvas和WebGL上下文
  protected canvas: HTMLCanvasElement;
  protected gl: WebGLRenderingContext | null = null;

  // 配置参数
  protected config: {
    wheel: WheelConfig;
    pinch: PinchConfig;
    doubleClick: DoubleClickConfig;
    panning: PanningConfig;
    alignmentAnimation: AlignmentAnimationConfig;
    velocityAnimation: VelocityAnimationConfig;
    minScale: number;
    maxScale: number;
    limitToBounds: boolean;
    centerOnInit: boolean;
    smooth: boolean;
    debug: boolean;
  };

  // 视图状态
  protected scale: number = INITIAL_SCALE;
  protected translateX: number = 0;
  protected translateY: number = 0;
  protected canvasWidth: number = 0;
  protected canvasHeight: number = 0;
  protected imageWidth: number = 0;
  protected imageHeight: number = 0;
  protected imageLoaded: boolean = false;
  protected isDragging: boolean = false;

  // 动画状态
  protected isAnimating: boolean = false;
  protected animationStartTime: number = 0;
  protected animationDuration: number = DEFAULT_ANIMATION_DURATION;
  protected startScale: number = INITIAL_SCALE;
  protected targetScale: number = INITIAL_SCALE;
  protected startTranslateX: number = 0;
  protected targetTranslateX: number = 0;
  protected startTranslateY: number = 0;
  protected targetTranslateY: number = 0;

  // 交互状态
  protected lastMouseX: number = 0;
  protected lastMouseY: number = 0;
  protected lastTouchDistance: number = 0;
  protected lastTouchTime: number = 0;
  protected lastTouchX: number = 0;
  protected lastTouchY: number = 0;
  protected lastDoubleClickTime: number = 0;

  // 事件回调
  protected onZoomChange?: (originalScale: number, relativeScale: number) => void;
  protected onLoadingStateChange?: (isLoading: boolean, message?: string, quality?: 'high' | 'medium' | 'low' | 'unknown') => void;
  protected onImageCopied?: () => void;

  // 图片源和目标尺寸
  protected imageSrc: string = '';
  protected targetImageWidth: number | undefined;
  protected targetImageHeight: number | undefined;

  constructor(canvas: HTMLCanvasElement, props: WebGLImageViewerProps) {
    this.canvas = canvas;
    this.imageSrc = props.src;
    this.targetImageWidth = props.width;
    this.targetImageHeight = props.height;

    // 合并配置参数
    this.config = {
      wheel: { ...DEFAULT_WHEEL_CONFIG, ...props.wheel },
      pinch: { ...DEFAULT_PINCH_CONFIG, ...props.pinch },
      doubleClick: { ...DEFAULT_DOUBLE_CLICK_CONFIG, ...props.doubleClick },
      panning: { ...DEFAULT_PANNING_CONFIG, ...props.panning },
      alignmentAnimation: { ...DEFAULT_ALIGNMENT_ANIMATION, ...props.alignmentAnimation },
      velocityAnimation: { ...DEFAULT_VELOCITY_ANIMATION, ...props.velocityAnimation },
      minScale: props.minScale ?? MIN_SCALE,
      maxScale: props.maxScale ?? MAX_SCALE,
      limitToBounds: props.limitToBounds ?? true,
      centerOnInit: props.centerOnInit ?? true,
      smooth: props.smooth ?? true,
      debug: props.debug ?? false
    };

    // 设置初始缩放
    if (props.initialScale !== undefined) {
      this.scale = props.initialScale;
      this.targetScale = props.initialScale;
      this.startScale = props.initialScale;
    }

    // 绑定回调函数
    this.onZoomChange = props.onZoomChange;
    this.onLoadingStateChange = props.onLoadingStateChange;
    this.onImageCopied = props.onImageCopied;

    // 初始化画布尺寸
    this.updateCanvasSize();
  }

  /**
   * 初始化引擎
   */
  public async initialize(): Promise<void> {
    try {
      await this.initializeEngine();
      await this.loadImage(this.imageSrc);
      this.bindEvents();
      this.render();
    } catch (error) {
      console.error('Engine initialization failed:', error);
      throw error;
    }
  }

  /**
   * 销毁引擎
   */
  public destroy(): void {
    this.unbindEvents();
    this.cleanup();
  }

  /**
   * 更新属性
   */
  public updateProps(props: Partial<WebGLImageViewerProps>): void {
    // 更新配置
    if (props.wheel) {
      this.config.wheel = { ...this.config.wheel, ...props.wheel };
    }
    if (props.pinch) {
      this.config.pinch = { ...this.config.pinch, ...props.pinch };
    }
    if (props.doubleClick) {
      this.config.doubleClick = { ...this.config.doubleClick, ...props.doubleClick };
    }
    if (props.panning) {
      this.config.panning = { ...this.config.panning, ...props.panning };
    }
    if (props.alignmentAnimation) {
      this.config.alignmentAnimation = { ...this.config.alignmentAnimation, ...props.alignmentAnimation };
    }
    if (props.velocityAnimation) {
      this.config.velocityAnimation = { ...this.config.velocityAnimation, ...props.velocityAnimation };
    }

    // 更新其他配置
    if (props.minScale !== undefined) {
      this.config.minScale = props.minScale;
    }
    if (props.maxScale !== undefined) {
      this.config.maxScale = props.maxScale;
    }
    if (props.limitToBounds !== undefined) {
      this.config.limitToBounds = props.limitToBounds;
    }
    if (props.centerOnInit !== undefined) {
      this.config.centerOnInit = props.centerOnInit;
    }
    if (props.smooth !== undefined) {
      this.config.smooth = props.smooth;
    }
    if (props.debug !== undefined) {
      this.config.debug = props.debug;
    }

    // 更新回调
    if (props.onZoomChange !== undefined) {
      this.onZoomChange = props.onZoomChange;
    }
    if (props.onLoadingStateChange !== undefined) {
      this.onLoadingStateChange = props.onLoadingStateChange;
    }
    if (props.onImageCopied !== undefined) {
      this.onImageCopied = props.onImageCopied;
    }

    // 更新目标尺寸
    if (props.width !== undefined) {
      this.targetImageWidth = props.width;
    }
    if (props.height !== undefined) {
      this.targetImageHeight = props.height;
    }

    // 如果图片源改变，重新加载图片
    if (props.src && props.src !== this.imageSrc) {
      this.imageSrc = props.src;
      this.loadImage(this.imageSrc).catch(console.error);
    }
  }

  /**
   * 获取当前状态
   */
  public getState(): ViewerState {
    return {
      scale: this.scale,
      translateX: this.translateX,
      translateY: this.translateY,
      isDragging: this.isDragging,
      isAnimating: this.isAnimating,
      imageLoaded: this.imageLoaded,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight
    };
  }

  /**
   * 更新画布尺寸
   */
  protected updateCanvasSize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;

    this.canvasWidth = rect.width * devicePixelRatio;
    this.canvasHeight = rect.height * devicePixelRatio;

    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
    }
  }

  /**
   * 通知缩放变化
   */
  protected notifyZoomChange(): void {
    if (this.onZoomChange && this.imageLoaded) {
      const fitToScreenScale = this.getFitToScreenScale();
      const relativeScale = this.scale / fitToScreenScale;
      this.onZoomChange(this.scale, relativeScale);
    }
  }

  /**
   * 通知加载状态变化
   */
  protected notifyLoadingStateChange(isLoading: boolean, message?: string, quality?: 'high' | 'medium' | 'low' | 'unknown'): void {
    if (this.onLoadingStateChange) {
      this.onLoadingStateChange(isLoading, message, quality);
    }
  }

  /**
   * 获取适应屏幕的缩放比例
   */
  protected getFitToScreenScale(): number {
    if (!this.imageLoaded || this.imageWidth === 0 || this.imageHeight === 0) {
      return 1;
    }

    const scaleX = this.canvasWidth / this.imageWidth;
    const scaleY = this.canvasHeight / this.imageHeight;
    return Math.min(scaleX, scaleY);
  }

  /**
   * 缓动函数
   */
  protected easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
  }

  /**
   * 开始动画
   */
  protected startAnimation(targetScale: number, targetTranslateX: number, targetTranslateY: number): void {
    this.isAnimating = true;
    this.animationStartTime = performance.now();
    this.startScale = this.scale;
    this.targetScale = targetScale;
    this.startTranslateX = this.translateX;
    this.targetTranslateX = targetTranslateX;
    this.startTranslateY = this.translateY;
    this.targetTranslateY = targetTranslateY;
    this.animate();
  }

  /**
   * 动画循环
   */
  protected animate(): void {
    if (!this.isAnimating) return;

    const now = performance.now();
    const elapsed = now - this.animationStartTime;
    const progress = Math.min(elapsed / this.animationDuration, 1);
    const easedProgress = this.config.smooth ? this.easeOutQuart(progress) : progress;

    this.scale = this.startScale + (this.targetScale - this.startScale) * easedProgress;
    this.translateX = this.startTranslateX + (this.targetTranslateX - this.startTranslateX) * easedProgress;
    this.translateY = this.startTranslateY + (this.targetTranslateY - this.startTranslateY) * easedProgress;

    this.render();
    this.notifyZoomChange();

    if (progress < 1) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.isAnimating = false;
      this.scale = this.targetScale;
      this.translateX = this.targetTranslateX;
      this.translateY = this.targetTranslateY;
      this.render();
      this.notifyZoomChange();
    }
  }

  // 抽象方法，由子类实现
  protected abstract initializeEngine(): Promise<void>;
  protected abstract loadImage(src: string): Promise<void>;
  protected abstract render(): void;
  protected abstract bindEvents(): void;
  protected abstract unbindEvents(): void;
  protected abstract cleanup(): void;
} 
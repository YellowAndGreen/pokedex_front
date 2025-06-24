/**
 * WebGL图像查看器引擎核心类
 * 实现WebGL渲染和交互功能
 */

import { ImageViewerEngineBase } from './ImageViewerEngineBase';
import { TextureWorker } from './TextureWorker';
import type {
  WebGLImageViewerProps,
  TileInfo,
  LoadingTileInfo,
  TileRequest,
  LODConfig,
  WorkerMessage
} from './interfaces';
import {
  VERTEX_SHADER_SOURCE,
  FRAGMENT_SHADER_SOURCE,
  SIMPLE_LOD_LEVELS,
  TILE_SIZE,
  TILE_CACHE_SIZE,
  MAX_TILES_PER_FRAME,
  ERROR_MESSAGES,
  DOUBLE_TAP_DELAY,
  DOUBLE_TAP_DISTANCE,
  MIN_PINCH_DISTANCE
} from './constants';
import {
  createShader,
  createProgram,
  getWebGLContext,
  createTexture,
  loadImage,
  clamp,
  getTouchDistance,
  getTouchCenter,
  screenToCanvas
} from './utils';

type TileKey = string; // 格式：`${x}-${y}-${lodLevel}`

export class WebGLImageViewerEngine extends ImageViewerEngineBase {
  // WebGL相关
  private program!: WebGLProgram;
  private positionBuffer!: WebGLBuffer;
  private texCoordBuffer!: WebGLBuffer;
  private positionLocation!: number;
  private texCoordLocation!: number;
  private matrixLocation!: WebGLUniformLocation;
  private textureLocation!: WebGLUniformLocation;
  private opacityLocation!: WebGLUniformLocation;

  // 纹理和瓦片系统
  private worker: TextureWorker | null = null;
  private textureWorkerInitialized: boolean = false;
  private mainTexture: WebGLTexture | null = null;
  private tileCache: Map<TileKey, TileInfo> = new Map();
  private loadingTiles: Map<TileKey, LoadingTileInfo> = new Map();
  private pendingTileRequests: TileRequest[] = [];
  private currentVisibleTiles: Set<TileKey> = new Set();
  private lastViewportHash: string = '';

  // LOD系统
  private lodTextures: Map<number, WebGLTexture> = new Map();
  private animationStartLOD: number = -1;

  constructor(canvas: HTMLCanvasElement, props: WebGLImageViewerProps) {
    super(canvas, props);
  }

  protected async initializeEngine(): Promise<void> {
    // 获取WebGL上下文
    this.gl = getWebGLContext(this.canvas);
    if (!this.gl) {
      throw new Error(ERROR_MESSAGES.WEBGL_NOT_SUPPORTED);
    }

    // 初始化WebGL
    this.initWebGL();
    
    // 初始化工作线程
    this.initWorker();

    // 处理WebGL上下文丢失
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost.bind(this));
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored.bind(this));
  }

  protected async loadImage(src: string): Promise<void> {
    try {
      this.notifyLoadingStateChange(true, '正在加载图片...', 'low');

      // 验证图片URL
      if (!src || typeof src !== 'string') {
        throw new Error('无效的图片URL');
      }

      console.log('WebGL引擎开始加载图片:', src);

      // 重置图片加载状态
      this.imageLoaded = false;
      
      // 清理旧的纹理资源
      if (this.gl && this.mainTexture) {
        this.gl.deleteTexture(this.mainTexture);
        this.mainTexture = null;
      }

      // 加载图片获取尺寸信息
      const img = await loadImage(src);
      
      console.log('图片加载成功，实际尺寸:', img.width, 'x', img.height);
      
      // 优先使用props传入的尺寸，否则使用实际图片尺寸
      // 这样可以确保缩略图使用目标图片的尺寸信息进行缩放计算
      this.imageWidth = this.targetImageWidth || img.width;
      this.imageHeight = this.targetImageHeight || img.height;
      this.imageLoaded = true;
      
      console.log('使用的图片尺寸:', this.imageWidth, 'x', this.imageHeight);

      // 创建主纹理
      if (this.gl) {
        this.mainTexture = createTexture(this.gl, img);
        if (!this.mainTexture) {
          throw new Error('创建WebGL纹理失败');
        }
      }

      // 初始化工作线程
      if (this.worker && !this.textureWorkerInitialized) {
        try {
          await this.worker.init(src, this.imageWidth, this.imageHeight);
          this.textureWorkerInitialized = true;
          console.log('纹理工作线程初始化成功');
        } catch (workerError) {
          console.warn('工作线程初始化失败，但主纹理可用:', workerError);
          // 工作线程失败不应该影响基础功能
        }
      }

      // 如果启用居中，则居中图片
      if (this.config.centerOnInit) {
        this.centerImage();
      }

      this.notifyLoadingStateChange(false, '图片加载完成', 'high');
      this.updateTileCache();
      
      // 立即渲染图片
      this.render();
      
      console.log('WebGL引擎图片加载完成');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('WebGL引擎图片加载失败:', {
        src,
        error,
        message: errorMessage
      });
      
      this.notifyLoadingStateChange(false, `图片加载失败: ${errorMessage}`, 'unknown');
      throw error;
    }
  }

  protected render(): void {
    if (!this.gl || !this.imageLoaded) return;

    const { gl } = this;

    // 检查WebGL上下文是否丢失
    if (gl.isContextLost()) {
      console.warn('WebGL上下文已丢失，跳过渲染');
      return;
    }

    // 检查关键WebGL资源是否有效
    if (!this.program || !this.positionBuffer || !this.texCoordBuffer) {
      console.warn('WebGL资源无效，跳过渲染:', {
        hasProgram: !!this.program,
        hasPositionBuffer: !!this.positionBuffer,
        hasTexCoordBuffer: !!this.texCoordBuffer
      });
      return;
    }

    // 检查program是否被删除
    if (!gl.isProgram(this.program)) {
      console.warn('WebGL程序已被删除，跳过渲染');
      return;
    }

    try {
      // 清空画布
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 使用着色器程序
      gl.useProgram(this.program);

      // 创建变换矩阵
      const matrix = this.createTransformMatrix();
      gl.uniformMatrix3fv(this.matrixLocation, false, matrix);

      // 设置透明度
      gl.uniform1f(this.opacityLocation, 1.0);

      // 渲染主纹理或瓦片
      if (this.shouldUseMainTexture()) {
        this.renderMainTexture();
      } else {
        this.renderTiles();
      }
    } catch (error) {
      console.error('WebGL渲染错误:', error);
      // 可能需要重新初始化WebGL
      this.handleRenderError();
    }
  }

  protected bindEvents(): void {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));

    // 触摸事件
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // WebGL上下文事件
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost.bind(this));
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored.bind(this));

    // 阻止右键菜单
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // 窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  protected unbindEvents(): void {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.removeEventListener('dblclick', this.handleDoubleClick.bind(this));

    this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));

    // WebGL上下文事件
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost.bind(this));
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored.bind(this));

    this.canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  protected cleanup(): void {
    // 清理工作线程
    if (this.worker) {
      this.worker.destroy();
      this.worker = null;
    }

    // 清理WebGL资源
    if (this.gl) {
      if (this.mainTexture) {
        this.gl.deleteTexture(this.mainTexture);
      }
      
      this.cleanupLODTextures();
      this.cleanupTileTextures();

      if (this.program) {
        this.gl.deleteProgram(this.program);
      }
      if (this.positionBuffer) {
        this.gl.deleteBuffer(this.positionBuffer);
      }
      if (this.texCoordBuffer) {
        this.gl.deleteBuffer(this.texCoordBuffer);
      }
    }
  }

  // WebGL初始化
  private initWebGL(): void {
    if (!this.gl) return;

    const { gl } = this;

    // 创建着色器
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

    // 创建程序
    this.program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(this.program);

    // 获取attribute和uniform位置
    this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
    this.texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');
    this.matrixLocation = gl.getUniformLocation(this.program, 'u_matrix')!;
    this.textureLocation = gl.getUniformLocation(this.program, 'u_texture')!;
    this.opacityLocation = gl.getUniformLocation(this.program, 'u_opacity')!;

    // 启用混合
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 创建几何体
    this.createGeometry();
  }

  private createGeometry(): void {
    if (!this.gl) return;

    const { gl } = this;

    // 位置数据 (四边形)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    // 纹理坐标
    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      0, 0,
      1, 1,
      1, 0,
    ]);

    // 创建位置缓冲
    this.positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // 创建纹理坐标缓冲
    this.texCoordBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  }

  private initWorker(): void {
    this.worker = new TextureWorker();
    
    this.worker.onMessage((message: WorkerMessage) => {
      if (message.type === 'tile-ready' && message.payload.key !== 'init-success') {
        this.handleTileReady(message.payload);
      } else if (message.type === 'error') {
        console.error('纹理工作线程错误:', message.payload.message);
      }
    });
  }

  // 变换矩阵创建
  private createTransformMatrix(): Float32Array {
    if (!this.imageLoaded) {
      return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }

    // 计算图片在画布中的尺寸
    const imageAspect = this.imageWidth / this.imageHeight;
    const canvasAspect = this.canvasWidth / this.canvasHeight;

    let renderWidth: number;
    let renderHeight: number;

    if (imageAspect > canvasAspect) {
      renderWidth = this.canvasWidth;
      renderHeight = this.canvasWidth / imageAspect;
    } else {
      renderWidth = this.canvasHeight * imageAspect;
      renderHeight = this.canvasHeight;
    }

    // 应用缩放
    renderWidth *= this.scale;
    renderHeight *= this.scale;

    // 转换为NDC坐标
    const scaleX = renderWidth / this.canvasWidth;
    const scaleY = renderHeight / this.canvasHeight;
    const translateX = (this.translateX * 2) / this.canvasWidth;
    const translateY = -(this.translateY * 2) / this.canvasHeight;

    return new Float32Array([
      scaleX, 0, 0,
      0, scaleY, 0,
      translateX, translateY, 1
    ]);
  }

  // 纹理渲染
  private shouldUseMainTexture(): boolean {
    // 如果缩放比例较小或瓦片系统未准备好，使用主纹理
    const useMain = this.scale <= 1.5 || !this.textureWorkerInitialized || !this.mainTexture;
    console.log('纹理选择决策:', {
      scale: this.scale,
      textureWorkerInitialized: this.textureWorkerInitialized,
      hasMainTexture: !!this.mainTexture,
      useMainTexture: useMain
    });
    return useMain;
  }

  private renderMainTexture(): void {
    if (!this.gl || !this.mainTexture) {
      console.warn('无法渲染主纹理:', { 
        hasGL: !!this.gl, 
        hasMainTexture: !!this.mainTexture,
        imageLoaded: this.imageLoaded
      });
      return;
    }

    const { gl } = this;

    // 检查纹理是否有效
    if (!gl.isTexture(this.mainTexture)) {
      console.warn('主纹理已被删除，跳过渲染');
      return;
    }

    try {
      // 绑定主纹理
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.mainTexture);
      gl.uniform1i(this.textureLocation, 0);

      this.drawGeometry();
      console.log('主纹理渲染完成');
    } catch (error) {
      console.error('主纹理渲染失败:', error);
    }
  }

  private renderTiles(): void {
    if (!this.gl) return;

    // 渲染当前可见的瓦片
    for (const tileKey of this.currentVisibleTiles) {
      const tileInfo = this.tileCache.get(tileKey);
      if (tileInfo && tileInfo.texture) {
        this.renderTile(tileKey, tileInfo.texture);
      }
    }

    // 如果没有可用瓦片，回退到主纹理
    if (this.currentVisibleTiles.size === 0 && this.mainTexture) {
      this.renderMainTexture();
    }
  }

  private renderTile(tileKey: TileKey, texture: WebGLTexture): void {
    if (!this.gl) return;

    const { gl } = this;

    // 解析瓦片坐标
    const [x, y, lodLevel] = tileKey.split('-').map(Number);

    // 计算瓦片的变换矩阵
    const tileMatrix = this.calculateTileMatrix(x, y, lodLevel);

    // 绑定纹理
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.textureLocation, 0);

    // 更新变换矩阵
    gl.uniformMatrix3fv(this.matrixLocation, false, tileMatrix);

    this.drawGeometry();
  }

  private calculateTileMatrix(tileX: number, tileY: number, lodLevel: number): Float32Array {
    const lodConfig = SIMPLE_LOD_LEVELS[lodLevel];
    const scaledWidth = this.imageWidth * lodConfig.scale;
    const scaledHeight = this.imageHeight * lodConfig.scale;

    // 计算瓦片在图片中的位置和大小
    const tileWidth = TILE_SIZE;
    const tileHeight = TILE_SIZE;
    const tileStartX = tileX * tileWidth;
    const tileStartY = tileY * tileHeight;

    // 转换为NDC坐标系
    const normalizedX = (tileStartX / scaledWidth) * 2 - 1;
    const normalizedY = 1 - (tileStartY / scaledHeight) * 2;
    const normalizedWidth = (tileWidth / scaledWidth) * 2;
    const normalizedHeight = (tileHeight / scaledHeight) * 2;

    // 应用全局变换
    const globalMatrix = this.createTransformMatrix();
    
    // 创建瓦片本地矩阵
    const localMatrix = new Float32Array([
      normalizedWidth, 0, 0,
      0, normalizedHeight, 0,
      normalizedX, normalizedY, 1
    ]);

    // 组合矩阵
    return this.multiplyMatrices(globalMatrix, localMatrix);
  }

  private multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
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

  private drawGeometry(): void {
    if (!this.gl) return;

    const { gl } = this;

    // 检查缓冲区是否有效
    if (!gl.isBuffer(this.positionBuffer) || !gl.isBuffer(this.texCoordBuffer)) {
      console.warn('几何缓冲区无效，跳过绘制');
      return;
    }

    try {
      // 绑定位置缓冲
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.enableVertexAttribArray(this.positionLocation);
      gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

      // 绑定纹理坐标缓冲
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.enableVertexAttribArray(this.texCoordLocation);
      gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      // 绘制
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } catch (error) {
      console.error('几何绘制失败:', error);
    }
  }

  // 事件处理
  private handleMouseDown(e: MouseEvent): void {
    if (this.isAnimating) {
      this.isAnimating = false;
    }
    if (this.config.panning.disabled) return;

    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging || this.config.panning.disabled) return;

    const deltaX = e.clientX - this.lastMouseX;
    const deltaY = e.clientY - this.lastMouseY;

    this.translateX += deltaX;
    this.translateY += deltaY;

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    this.constrainImagePosition();
    this.render();
  }

  private handleMouseUp(): void {
    this.isDragging = false;
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    if (this.config.wheel.wheelDisabled) return;

    if (this.isAnimating) {
      this.isAnimating = false;
    }

    const rect = this.canvas.getBoundingClientRect();
    const mousePos = screenToCanvas(e.clientX, e.clientY, rect);

    const scaleFactor = e.deltaY > 0 
      ? 1 - this.config.wheel.step 
      : 1 + this.config.wheel.step;
    
    this.zoomAt(mousePos.x, mousePos.y, scaleFactor);
  }

  private handleDoubleClick(e: MouseEvent): void {
    e.preventDefault();
    if (this.config.doubleClick.disabled) return;

    const now = Date.now();
    if (now - this.lastDoubleClickTime < 300) return;
    this.lastDoubleClickTime = now;

    const rect = this.canvas.getBoundingClientRect();
    const clickPos = screenToCanvas(e.clientX, e.clientY, rect);

    this.performDoubleClickAction(clickPos.x, clickPos.y);
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();

    if (this.isAnimating) {
      this.isAnimating = false;
    }

    if (e.touches.length === 1 && !this.config.panning.disabled) {
      const touch = e.touches[0];
      const now = Date.now();

      // 检测双击
      if (!this.config.doubleClick.disabled &&
          now - this.lastTouchTime < DOUBLE_TAP_DELAY &&
          Math.abs(touch.clientX - this.lastTouchX) < DOUBLE_TAP_DISTANCE &&
          Math.abs(touch.clientY - this.lastTouchY) < DOUBLE_TAP_DISTANCE) {
        this.handleTouchDoubleTap(touch.clientX, touch.clientY);
        this.lastTouchTime = 0;
        return;
      }

      this.isDragging = true;
      this.lastMouseX = touch.clientX;
      this.lastMouseY = touch.clientY;
      this.lastTouchTime = now;
      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;
    } else if (e.touches.length === 2 && !this.config.pinch.disabled) {
      this.isDragging = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      this.lastTouchDistance = getTouchDistance(touch1, touch2);
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();

    if (e.touches.length === 1 && this.isDragging && !this.config.panning.disabled) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.lastMouseX;
      const deltaY = touch.clientY - this.lastMouseY;

      this.translateX += deltaX;
      this.translateY += deltaY;

      this.lastMouseX = touch.clientX;
      this.lastMouseY = touch.clientY;

      this.constrainImagePosition();
      this.render();
    } else if (e.touches.length === 2 && !this.config.pinch.disabled) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = getTouchDistance(touch1, touch2);

      if (this.lastTouchDistance > MIN_PINCH_DISTANCE && distance > MIN_PINCH_DISTANCE) {
        const scaleFactor = distance / this.lastTouchDistance;
        const center = getTouchCenter(touch1, touch2);
        const rect = this.canvas.getBoundingClientRect();
        const centerPos = screenToCanvas(center.x, center.y, rect);

        this.zoomAt(centerPos.x, centerPos.y, scaleFactor);
      }

      this.lastTouchDistance = distance;
    }
  }

  private handleTouchEnd(): void {
    this.isDragging = false;
    this.lastTouchDistance = 0;
  }

  private handleTouchDoubleTap(clientX: number, clientY: number): void {
    if (this.config.doubleClick.disabled) return;

    const rect = this.canvas.getBoundingClientRect();
    const touchPos = screenToCanvas(clientX, clientY, rect);

    this.performDoubleClickAction(touchPos.x, touchPos.y);
  }

  private handleResize(): void {
    this.updateCanvasSize();
    this.render();
  }

  // 工具方法
  private performDoubleClickAction(x: number, y: number): void {
    if (this.config.doubleClick.mode === 'toggle') {
      const fitScale = this.getFitToScreenScale();
      const targetScale = this.scale > fitScale * 1.1 ? fitScale : fitScale * this.config.doubleClick.step;
      
      if (this.config.smooth) {
        this.zoomAt(x, y, targetScale / this.scale, true);
      } else {
        this.zoomAt(x, y, targetScale / this.scale);
      }
    }
  }

  private zoomAt(x: number, y: number, scaleFactor: number, animated: boolean = false): void {
    const newScale = clamp(
      this.scale * scaleFactor,
      this.config.minScale * this.getFitToScreenScale(),
      this.config.maxScale * this.getFitToScreenScale()
    );

    if (newScale === this.scale) return;

    const zoomX = (x - this.canvasWidth / 2 - this.translateX) / this.scale;
    const zoomY = (y - this.canvasHeight / 2 - this.translateY) / this.scale;

    const targetTranslateX = x - this.canvasWidth / 2 - zoomX * newScale;
    const targetTranslateY = y - this.canvasHeight / 2 - zoomY * newScale;

    if (animated && this.config.smooth) {
      this.startAnimation(newScale, targetTranslateX, targetTranslateY);
    } else {
      this.scale = newScale;
      this.translateX = targetTranslateX;
      this.translateY = targetTranslateY;
      this.constrainImagePosition();
      this.render();
      this.notifyZoomChange();
    }

    this.updateTileCache();
  }

  private centerImage(): void {
    this.scale = this.getFitToScreenScale();
    this.translateX = 0;
    this.translateY = 0;
  }

  private constrainImagePosition(): void {
    if (!this.config.limitToBounds || !this.imageLoaded) return;

    const fitScale = this.getFitToScreenScale();

    if (this.scale <= fitScale) {
      this.translateX = 0;
      this.translateY = 0;
      return;
    }

    const scaledWidth = this.imageWidth * this.scale;
    const scaledHeight = this.imageHeight * this.scale;
    const maxTranslateX = Math.max(0, (scaledWidth - this.canvasWidth) / 2);
    const maxTranslateY = Math.max(0, (scaledHeight - this.canvasHeight) / 2);

    this.translateX = clamp(this.translateX, -maxTranslateX, maxTranslateX);
    this.translateY = clamp(this.translateY, -maxTranslateY, maxTranslateY);
  }

  // LOD和瓦片系统
  private selectOptimalLOD(): number {
    const fitScale = this.getFitToScreenScale();
    const relativeScale = this.scale / fitScale;

    if (relativeScale <= 0.5) return 0;      // 极低质量
    if (relativeScale <= 1) return 1;        // 低质量
    if (relativeScale <= 2) return 2;        // 正常质量
    if (relativeScale <= 4) return 3;        // 高质量
    return 4;                                // 超高质量
  }

  private async updateTileCache(): Promise<void> {
    if (!this.textureWorkerInitialized || !this.imageLoaded) return;

    const visibleTiles = this.calculateVisibleTiles();
    this.currentVisibleTiles = new Set(visibleTiles.map(t => this.getTileKey(t.x, t.y, t.lodLevel)));

    // 请求缺失的瓦片
    for (const tile of visibleTiles) {
      const key = this.getTileKey(tile.x, tile.y, tile.lodLevel);
      if (!this.tileCache.has(key) && !this.loadingTiles.has(key)) {
        this.requestTile(tile.x, tile.y, tile.lodLevel, key);
      }
    }

    // 清理旧瓦片
    this.cleanupOldTiles();
  }

  private calculateVisibleTiles(): Array<{ x: number; y: number; lodLevel: number }> {
    const lodLevel = this.selectOptimalLOD();
    const lodConfig = SIMPLE_LOD_LEVELS[lodLevel];
    const scaledWidth = this.imageWidth * lodConfig.scale;
    const scaledHeight = this.imageHeight * lodConfig.scale;

    const cols = Math.ceil(scaledWidth / TILE_SIZE);
    const rows = Math.ceil(scaledHeight / TILE_SIZE);

    // 计算可视区域
    const viewLeft = Math.max(0, -this.translateX / this.scale);
    const viewTop = Math.max(0, -this.translateY / this.scale);
    const viewRight = Math.min(this.imageWidth, (this.canvasWidth - this.translateX) / this.scale);
    const viewBottom = Math.min(this.imageHeight, (this.canvasHeight - this.translateY) / this.scale);

    const tileWidthInImage = this.imageWidth / cols;
    const tileHeightInImage = this.imageHeight / rows;

    const startTileX = Math.max(0, Math.floor(viewLeft / tileWidthInImage));
    const endTileX = Math.min(cols - 1, Math.ceil(viewRight / tileWidthInImage));
    const startTileY = Math.max(0, Math.floor(viewTop / tileHeightInImage));
    const endTileY = Math.min(rows - 1, Math.ceil(viewBottom / tileHeightInImage));

    const tiles: Array<{ x: number; y: number; lodLevel: number }> = [];

    for (let y = startTileY; y <= endTileY; y++) {
      for (let x = startTileX; x <= endTileX; x++) {
        tiles.push({ x, y, lodLevel });
      }
    }

    return tiles;
  }

  private getTileKey(x: number, y: number, lodLevel: number): TileKey {
    return `${x}-${y}-${lodLevel}`;
  }

  private requestTile(x: number, y: number, lodLevel: number, key: TileKey): void {
    if (!this.worker) return;

    this.loadingTiles.set(key, { priority: 1 });

    const lodConfig = SIMPLE_LOD_LEVELS[lodLevel];
    this.worker.createTile(x, y, lodLevel, lodConfig, key);
  }

  private handleTileReady(payload: any): void {
    if (!this.gl) return;

    const { key, imageData } = payload;

    // 从加载中移除
    this.loadingTiles.delete(key);

    // 创建WebGL纹理
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    const texture = createTexture(this.gl, canvas);
    if (texture) {
      this.tileCache.set(key, {
        texture,
        lastUsed: performance.now(),
        loading: false,
        priority: 1
      });

      // 如果是当前可见瓦片，重新渲染
      if (this.currentVisibleTiles.has(key)) {
        this.render();
      }
    }
  }

  private cleanupOldTiles(): void {
    if (this.tileCache.size <= TILE_CACHE_SIZE) return;

    const tilesToRemove = Array.from(this.tileCache.entries())
      .filter(([key]) => !this.currentVisibleTiles.has(key))
      .sort(([, a], [, b]) => a.lastUsed - b.lastUsed)
      .slice(0, this.tileCache.size - TILE_CACHE_SIZE + 5);

    for (const [key, tileInfo] of tilesToRemove) {
      if (tileInfo.texture && this.gl) {
        this.gl.deleteTexture(tileInfo.texture);
      }
      this.tileCache.delete(key);
    }
  }

  private cleanupTileTextures(): void {
    if (!this.gl) return;

    for (const [, tileInfo] of this.tileCache) {
      if (tileInfo.texture) {
        this.gl.deleteTexture(tileInfo.texture);
      }
    }
    this.tileCache.clear();
  }

  private cleanupLODTextures(): void {
    if (!this.gl) return;

    for (const [, texture] of this.lodTextures) {
      this.gl.deleteTexture(texture);
    }
    this.lodTextures.clear();
  }

  // WebGL上下文处理
  private handleContextLost(e: Event): void {
    e.preventDefault();
    console.warn(ERROR_MESSAGES.WEBGL_CONTEXT_LOST);
    this.notifyLoadingStateChange(true, ERROR_MESSAGES.WEBGL_CONTEXT_LOST);
  }

  private handleContextRestored(): void {
    console.log('WebGL上下文已恢复');
    this.initializeEngine().then(() => {
      this.loadImage(this.imageSrc);
    }).catch(console.error);
  }

  private handleRenderError(): void {
    console.warn('WebGL渲染错误，尝试重新初始化');
    try {
      // 清理现有资源
      this.cleanup();
      // 重新初始化WebGL
      this.initializeEngine().then(() => {
        if (this.imageSrc) {
          this.loadImage(this.imageSrc);
        }
      }).catch((error) => {
        console.error('WebGL重新初始化失败:', error);
        this.notifyLoadingStateChange(false, '图片渲染失败', 'unknown');
      });
    } catch (error) {
      console.error('处理渲染错误时发生异常:', error);
    }
  }

  // 公共API方法
  public async copyOriginalImageToClipboard(): Promise<void> {
    try {
      const img = await loadImage(this.imageSrc);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && navigator.clipboard.write) {
          const clipboardItem = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([clipboardItem]);
          this.onImageCopied?.();
        }
      });
    } catch (error) {
      console.error('复制图片失败:', error);
    }
  }

  // 暴露给React组件的公共方法
  public zoomAtPublic(x: number, y: number, scaleFactor: number, animated: boolean = false): void {
    this.zoomAt(x, y, scaleFactor, animated);
  }

  public getFitToScreenScalePublic(): number {
    return this.getFitToScreenScale();
  }

  /**
   * 强制重新渲染（调试用）
   */
  public forceRender(): void {
    console.log('强制渲染 - 状态:', {
      imageLoaded: this.imageLoaded,
      hasMainTexture: !!this.mainTexture,
      imageSize: `${this.imageWidth}x${this.imageHeight}`,
      canvasSize: `${this.canvasWidth}x${this.canvasHeight}`,
      scale: this.scale,
      translate: `${this.translateX}, ${this.translateY}`
    });
    
    if (this.gl) {
      // 强制清空画布
      this.gl.clearColor(1, 0, 0, 1); // 红色背景用于调试
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      
      // 如果有图片，尝试渲染
      if (this.imageLoaded && this.mainTexture) {
        this.render();
      }
    }
  }
} 
/**
 * WebGL纹理工作线程
 * 用于离线处理图片加载、尺寸调整、瓦片切割和LOD生成
 */

import type {
  WorkerMessage,
  WorkerInitMessage,
  WorkerCreateTileMessage,
  WorkerTileReadyMessage,
  WorkerErrorMessage,
  LODConfig
} from './interfaces';
import { TILE_SIZE } from './constants';

// 工作线程内部状态
let sourceImage: HTMLImageElement | null = null;
let imageWidth: number = 0;
let imageHeight: number = 0;
let isInitialized: boolean = false;

/**
 * 主线程通信处理
 */
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  try {
    const { type, payload } = event.data;

    switch (type) {
      case 'init':
        await handleInit(payload);
        break;
      case 'create-tile':
        await handleCreateTile(payload);
        break;
      default:
        sendError(`未知的消息类型: ${type}`);
    }
  } catch (error) {
    sendError(`处理消息时发生错误: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 初始化工作线程
 */
async function handleInit(payload: WorkerInitMessage['payload']): Promise<void> {
  try {
    const { imageUrl, imageWidth: width, imageHeight: height } = payload;

    // 加载源图片
    sourceImage = await loadImageInWorker(imageUrl);
    imageWidth = width;
    imageHeight = height;
    isInitialized = true;

    // 发送初始化成功消息
    sendMessage({
      type: 'tile-ready',
      payload: {
        key: 'init-success',
        imageData: new ImageData(1, 1), // 占位数据
        x: 0,
        y: 0,
        lodLevel: 0
      }
    });
  } catch (error) {
    sendError(`初始化失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 创建瓦片
 */
async function handleCreateTile(payload: WorkerCreateTileMessage['payload']): Promise<void> {
  if (!isInitialized || !sourceImage) {
    sendError('工作线程未初始化');
    return;
  }

  try {
    const { x, y, lodLevel, lodConfig, key } = payload;

    // 创建瓦片图像数据
    const imageData = createTileImageData(x, y, lodLevel, lodConfig);

    // 发送瓦片就绪消息
    const message: WorkerTileReadyMessage = {
      type: 'tile-ready',
      payload: {
        key,
        imageData,
        x,
        y,
        lodLevel
      }
    };

    sendMessage(message);
  } catch (error) {
    sendError(`创建瓦片失败: ${error instanceof Error ? error.message : String(error)}`, payload.key);
  }
}

/**
 * 在工作线程中加载图片
 */
function loadImageInWorker(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`图片加载失败: ${url}`));
    
    img.src = url;
  });
}

/**
 * 创建瓦片图像数据
 */
function createTileImageData(
  tileX: number,
  tileY: number,
  lodLevel: number,
  lodConfig: LODConfig
): ImageData {
  if (!sourceImage) {
    throw new Error('源图片未加载');
  }

  // 计算LOD缩放后的尺寸
  const scaledWidth = imageWidth * lodConfig.scale;
  const scaledHeight = imageHeight * lodConfig.scale;

  // 计算瓦片网格
  const cols = Math.ceil(scaledWidth / TILE_SIZE);
  const rows = Math.ceil(scaledHeight / TILE_SIZE);

  // 验证瓦片坐标
  if (tileX >= cols || tileY >= rows || tileX < 0 || tileY < 0) {
    throw new Error(`瓦片坐标超出范围: (${tileX}, ${tileY}), 网格大小: ${cols}x${rows}`);
  }

  // 计算瓦片在原图中的区域
  const sourceX = (tileX * TILE_SIZE) / lodConfig.scale;
  const sourceY = (tileY * TILE_SIZE) / lodConfig.scale;
  const sourceWidth = TILE_SIZE / lodConfig.scale;
  const sourceHeight = TILE_SIZE / lodConfig.scale;

  // 确保不超出图片边界
  const actualSourceX = Math.max(0, Math.min(sourceX, imageWidth));
  const actualSourceY = Math.max(0, Math.min(sourceY, imageHeight));
  const actualSourceWidth = Math.min(sourceWidth, imageWidth - actualSourceX);
  const actualSourceHeight = Math.min(sourceHeight, imageHeight - actualSourceY);

  // 计算输出瓦片的实际尺寸
  const outputWidth = Math.min(TILE_SIZE, Math.ceil(actualSourceWidth * lodConfig.scale));
  const outputHeight = Math.min(TILE_SIZE, Math.ceil(actualSourceHeight * lodConfig.scale));

  // 创建离屏Canvas
  const canvas = new OffscreenCanvas(outputWidth, outputHeight);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('无法创建2D画布上下文');
  }

  // 绘制瓦片
  ctx.drawImage(
    sourceImage,
    actualSourceX,
    actualSourceY,
    actualSourceWidth,
    actualSourceHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  // 获取图像数据
  return ctx.getImageData(0, 0, outputWidth, outputHeight);
}

/**
 * 发送消息到主线程
 */
function sendMessage(message: WorkerMessage): void {
  self.postMessage(message);
}

/**
 * 发送错误消息到主线程
 */
function sendError(message: string, key?: string): void {
  const errorMessage: WorkerErrorMessage = {
    type: 'error',
    payload: {
      message,
      key
    }
  };
  sendMessage(errorMessage);
}

/**
 * 创建WebGL纹理工作线程的工厂函数
 * 这个函数将在主线程中使用
 */
export function createTextureWorker(): Worker {
  // 将工作线程代码转换为Blob URL
  const workerCode = `
    ${handleInit.toString()}
    ${handleCreateTile.toString()}
    ${loadImageInWorker.toString()}
    ${createTileImageData.toString()}
    ${sendMessage.toString()}
    ${sendError.toString()}
    
    // 工作线程内部状态
    let sourceImage = null;
    let imageWidth = 0;
    let imageHeight = 0;
    let isInitialized = false;
    
    // 常量
    const TILE_SIZE = ${TILE_SIZE};
    
    // 主线程通信处理
    self.onmessage = async (event) => {
      try {
        const { type, payload } = event.data;
        
        switch (type) {
          case 'init':
            await handleInit(payload);
            break;
          case 'create-tile':
            await handleCreateTile(payload);
            break;
          default:
            sendError(\`未知的消息类型: \${type}\`);
        }
      } catch (error) {
        sendError(\`处理消息时发生错误: \${error instanceof Error ? error.message : String(error)}\`);
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  
  return new Worker(workerUrl);
}

/**
 * 纹理工作线程包装器类
 * 提供类型安全的工作线程接口
 */
export class TextureWorker {
  private worker: Worker;
  private messageHandlers: Map<string, (message: WorkerMessage) => void> = new Map();
  private isReady: boolean = false;

  constructor() {
    this.worker = createTextureWorker();
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { type, payload } = event.data;

      // 处理初始化成功
      if (type === 'tile-ready' && payload.key === 'init-success') {
        this.isReady = true;
      }

      // 触发消息处理器
      this.messageHandlers.forEach(handler => handler(event.data));
    };

    this.worker.onerror = (error) => {
      console.error('纹理工作线程错误:', error);
    };
  }

  /**
   * 初始化工作线程
   */
  public async init(imageUrl: string, imageWidth: number, imageHeight: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('工作线程初始化超时'));
      }, 10000);

      const handler = (message: WorkerMessage) => {
        if (message.type === 'tile-ready' && message.payload.key === 'init-success') {
          clearTimeout(timeout);
          this.messageHandlers.delete('init-handler');
          resolve();
        } else if (message.type === 'error') {
          clearTimeout(timeout);
          this.messageHandlers.delete('init-handler');
          reject(new Error(message.payload.message));
        }
      };

      this.messageHandlers.set('init-handler', handler);

      const initMessage: WorkerInitMessage = {
        type: 'init',
        payload: { imageUrl, imageWidth, imageHeight }
      };

      this.worker.postMessage(initMessage);
    });
  }

  /**
   * 创建瓦片
   */
  public createTile(
    x: number,
    y: number,
    lodLevel: number,
    lodConfig: LODConfig,
    key: string
  ): void {
    if (!this.isReady) {
      throw new Error('工作线程未就绪');
    }

    const message: WorkerCreateTileMessage = {
      type: 'create-tile',
      payload: {
        x,
        y,
        lodLevel,
        lodConfig,
        imageWidth,
        imageHeight,
        key
      }
    };

    this.worker.postMessage(message);
  }

  /**
   * 添加消息处理器
   */
  public onMessage(handler: (message: WorkerMessage) => void): void {
    const key = `handler-${Date.now()}-${Math.random()}`;
    this.messageHandlers.set(key, handler);
  }

  /**
   * 销毁工作线程
   */
  public destroy(): void {
    this.messageHandlers.clear();
    this.worker.terminate();
  }
} 
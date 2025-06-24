/**
 * React WebGL图像查看器组件
 * 提供易用的React接口来使用WebGL图像查看器引擎
 */

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { WebGLImageViewerEngine } from './WebGLImageViewerEngine';
import type { WebGLImageViewerProps, WebGLImageViewerRef, ViewerState } from './interfaces';

interface WebGLImageViewerComponentProps extends WebGLImageViewerProps {
  className?: string;
  style?: React.CSSProperties;
}

const WebGLImageViewer = forwardRef<WebGLImageViewerRef, WebGLImageViewerComponentProps>(
  (props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<WebGLImageViewerEngine | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [currentQuality, setCurrentQuality] = useState<'high' | 'medium' | 'low' | 'unknown'>('unknown');

    // 创建引擎实例
    const initializeEngine = useCallback(async () => {
      if (!canvasRef.current) return;

      try {
        setError(null);
        setIsLoading(true);

        // 验证图片URL
        if (!props.src) {
          throw new Error('图片URL不能为空');
        }

        console.log('开始初始化WebGL查看器，图片URL:', props.src);

        // 创建新的引擎实例
        const engine = new WebGLImageViewerEngine(canvasRef.current, {
          ...props,
          onLoadingStateChange: (loading, message, quality) => {
            setIsLoading(loading);
            if (message) setLoadingMessage(message);
            if (quality) setCurrentQuality(quality);
            
            // 调用用户提供的回调
            props.onLoadingStateChange?.(loading, message, quality);
          }
        });

        // 初始化引擎
        await engine.initialize();
        engineRef.current = engine;

        setIsLoading(false);
        console.log('WebGL查看器初始化成功');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '初始化WebGL查看器失败';
        setError(errorMessage);
        setIsLoading(false);
        console.error('WebGL图像查看器初始化失败:', {
          error: err,
          src: props.src,
          message: errorMessage
        });
        
        // 通知上层组件错误
        props.onLoadingStateChange?.(false, `加载失败: ${errorMessage}`, 'unknown');
      }
    }, [props]);

    // 清理引擎实例
    const cleanupEngine = useCallback(() => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    }, []);

    // 组件挂载时初始化引擎
    useEffect(() => {
      initializeEngine();

      // 组件卸载时清理引擎
      return cleanupEngine;
    }, []); // 只在首次挂载时执行

    // 监听props变化并更新引擎配置
    useEffect(() => {
      if (engineRef.current) {
        engineRef.current.updateProps(props);
      }
    }, [
      props.src,
      props.minScale,
      props.maxScale,
      props.initialScale,
      props.wheel,
      props.pinch,
      props.doubleClick,
      props.panning,
      props.limitToBounds,
      props.centerOnInit,
      props.smooth,
      props.alignmentAnimation,
      props.velocityAnimation,
      props.onZoomChange,
      props.onLoadingStateChange,
      props.onImageCopied,
      props.debug
    ]);

    // 暴露引擎方法给父组件
    useImperativeHandle(ref, () => ({
             zoomIn: (animated = true) => {
         if (engineRef.current) {
           const state = engineRef.current.getState();
           const zoomFactor = 1.5;
           const centerX = state.canvasWidth / 2;
           const centerY = state.canvasHeight / 2;
           
           engineRef.current.zoomAtPublic(centerX, centerY, zoomFactor, animated);
         }
       },

       zoomOut: (animated = true) => {
         if (engineRef.current) {
           const state = engineRef.current.getState();
           const zoomFactor = 1 / 1.5;
           const centerX = state.canvasWidth / 2;
           const centerY = state.canvasHeight / 2;
           
           engineRef.current.zoomAtPublic(centerX, centerY, zoomFactor, animated);
         }
       },

       resetZoom: (animated = true) => {
         if (engineRef.current) {
           const state = engineRef.current.getState();
           const fitScale = engineRef.current.getFitToScreenScalePublic();
           const currentScale = state.scale;
           const zoomFactor = fitScale / currentScale;
           const centerX = state.canvasWidth / 2;
           const centerY = state.canvasHeight / 2;
           
           engineRef.current.zoomAtPublic(centerX, centerY, zoomFactor, animated);
         }
       },

       fitToScreen: (animated = true) => {
         // resetZoom 已经实现了适应屏幕功能
         if (engineRef.current) {
           const state = engineRef.current.getState();
           const fitScale = engineRef.current.getFitToScreenScalePublic();
           const currentScale = state.scale;
           const zoomFactor = fitScale / currentScale;
           const centerX = state.canvasWidth / 2;
           const centerY = state.canvasHeight / 2;
           
           engineRef.current.zoomAtPublic(centerX, centerY, zoomFactor, animated);
         }
       },

       zoomTo: (scale: number, animated = true) => {
         if (engineRef.current) {
           const state = engineRef.current.getState();
           const zoomFactor = scale / state.scale;
           const centerX = state.canvasWidth / 2;
           const centerY = state.canvasHeight / 2;
           
           engineRef.current.zoomAtPublic(centerX, centerY, zoomFactor, animated);
         }
       },

       zoomAt: (x: number, y: number, scaleFactor: number, animated = true) => {
         if (engineRef.current) {
           engineRef.current.zoomAtPublic(x, y, scaleFactor, animated);
         }
       },

      getState: (): ViewerState => {
        if (engineRef.current) {
          return engineRef.current.getState();
        }
        
        // 返回默认状态
        return {
          scale: 1,
          translateX: 0,
          translateY: 0,
          isDragging: false,
          isAnimating: false,
          imageLoaded: false,
          canvasWidth: 0,
          canvasHeight: 0,
          imageWidth: 0,
          imageHeight: 0
        };
      },

      copyOriginalImageToClipboard: async () => {
        if (engineRef.current) {
          return engineRef.current.copyOriginalImageToClipboard();
        }
      },

      // 调试方法
      forceRender: () => {
        if (engineRef.current && 'forceRender' in engineRef.current) {
          (engineRef.current as any).forceRender();
        }
      }
    }), []);

    // 渲染加载状态
    const renderLoadingState = () => {
      if (error) {
        return (
          <div className="webgl-viewer-error">
            <div className="error-message">
              <h3>WebGL查看器错误</h3>
              <p>{error}</p>
              <button 
                onClick={initializeEngine}
                className="retry-button"
              >
                重试
              </button>
            </div>
          </div>
        );
      }

      if (isLoading) {
        return (
          <div className="webgl-viewer-loading">
            <div className="loading-spinner"></div>
            <div className="loading-message">
              {loadingMessage || '正在加载...'}
            </div>
            <div className="loading-quality">
              质量: {currentQuality}
            </div>
          </div>
        );
      }

      return null;
    };

    return (
      <div 
        className={`webgl-image-viewer ${props.className || ''}`}
        style={props.style}
      >
        <canvas
          ref={canvasRef}
          className="webgl-viewer-canvas"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            touchAction: 'none', // 禁用默认触摸行为
            ...((isLoading || error) && { opacity: 0.3 })
          }}
        />
        
        {/* 加载状态覆盖层 */}
        {(isLoading || error) && (
          <div className="webgl-viewer-overlay">
            {renderLoadingState()}
          </div>
        )}

        {/* 调试信息 */}
        {props.debug && engineRef.current && (
          <div className="webgl-viewer-debug">
            <DebugInfo engine={engineRef.current} />
          </div>
        )}
      </div>
    );
  }
);

// 调试信息组件
const DebugInfo: React.FC<{ engine: WebGLImageViewerEngine }> = ({ engine }) => {
  const [debugState, setDebugState] = useState<ViewerState | null>(null);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugState(engine.getState());
    };

    // 定期更新调试信息
    const interval = setInterval(updateDebugInfo, 100);
    updateDebugInfo(); // 立即更新一次

    return () => clearInterval(interval);
  }, [engine]);

  if (!debugState) return null;

  return (
    <div className="debug-info">
      <h4>WebGL Viewer Debug Info</h4>
      <div className="debug-item">
        <strong>Scale:</strong> {debugState.scale.toFixed(3)}
      </div>
      <div className="debug-item">
        <strong>Translate:</strong> ({debugState.translateX.toFixed(1)}, {debugState.translateY.toFixed(1)})
      </div>
      <div className="debug-item">
        <strong>Canvas:</strong> {debugState.canvasWidth}x{debugState.canvasHeight}
      </div>
      <div className="debug-item">
        <strong>Image:</strong> {debugState.imageWidth}x{debugState.imageHeight}
      </div>
      <div className="debug-item">
        <strong>States:</strong> 
        {debugState.isDragging && ' Dragging'}
        {debugState.isAnimating && ' Animating'}
        {debugState.imageLoaded && ' Loaded'}
      </div>
    </div>
  );
};

WebGLImageViewer.displayName = 'WebGLImageViewer';

export default WebGLImageViewer; 
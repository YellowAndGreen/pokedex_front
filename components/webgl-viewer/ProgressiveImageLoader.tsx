/**
 * 渐进式图片加载组件
 * 支持从缩略图到高分辨率图片的渐进式加载
 */

import React, { useState, useEffect, useRef } from 'react';
import WebGLImageViewer from './WebGLImageViewer';
import type { WebGLImageViewerRef, WebGLImageViewerProps } from './interfaces';

interface ProgressiveImageLoaderProps extends Omit<WebGLImageViewerProps, 'src' | 'onLoadingStateChange'> {
  /** 高分辨率图片URL */
  highResUrl: string;
  /** 缩略图URL（可选，用于快速预览） */
  thumbnailUrl?: string;
  /** 加载状态变化回调 */
  onLoadingStateChange?: (isLoading: boolean, message?: string, stage?: 'thumbnail' | 'high-res') => void;
  /** 质量变化回调 */
  onQualityChange?: (quality: 'low' | 'medium' | 'high') => void;
}

const ProgressiveImageLoader = React.forwardRef<WebGLImageViewerRef, ProgressiveImageLoaderProps>(
  ({ highResUrl, thumbnailUrl, onLoadingStateChange, onQualityChange, ...otherProps }, ref) => {
    const [currentSrc, setCurrentSrc] = useState<string>('');
    const [loadingStage, setLoadingStage] = useState<'init' | 'thumbnail' | 'high-res' | 'complete'>('init');
    const [highResLoaded, setHighResLoaded] = useState(false);
    
    // 预加载高分辨率图片
    const preloadHighRes = () => {
      if (!highResUrl || highResLoaded) return;
      
      setLoadingStage('high-res');
      onLoadingStateChange?.(true, '正在加载高分辨率图片...', 'high-res');
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('高分辨率图片加载成功:', highResUrl);
        setCurrentSrc(highResUrl);
        setHighResLoaded(true);
        setLoadingStage('complete');
        onLoadingStateChange?.(false, '高分辨率图片加载完成', 'high-res');
        onQualityChange?.('high');
      };
      
      img.onerror = (error) => {
        console.warn('高分辨率图片加载失败，保持缩略图质量:', highResUrl, error);
        setLoadingStage('complete');
        onLoadingStateChange?.(false, '高分辨率图片加载失败，使用缩略图', 'high-res');
        // 不设置新的src，保持使用缩略图
        onQualityChange?.('low');
      };
      
      img.src = highResUrl;
    };

    // 验证并加载缩略图
    const loadThumbnail = (url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          console.log('缩略图加载成功:', url);
          resolve(true);
        };
        
        img.onerror = (error) => {
          console.warn('缩略图加载失败:', url, error);
          resolve(false);
        };
        
        img.src = url;
      });
    };

    // 初始化加载逻辑
    useEffect(() => {
      let isMounted = true;
      
      const initializeLoader = async () => {
        // 重置状态
        setCurrentSrc('');
        setHighResLoaded(false);
        
        if (thumbnailUrl && thumbnailUrl !== highResUrl) {
          // 先尝试使用缩略图
          setLoadingStage('thumbnail');
          onLoadingStateChange?.(true, '正在验证预览图...', 'thumbnail');
          
          const thumbnailValid = await loadThumbnail(thumbnailUrl);
          
          if (!isMounted) return;
          
          if (thumbnailValid) {
            setCurrentSrc(thumbnailUrl);
            setLoadingStage('thumbnail');
            onQualityChange?.('low');
            onLoadingStateChange?.(false, '预览图加载完成', 'thumbnail');
            
            // 延迟加载高分辨率图片
            setTimeout(() => {
              if (isMounted) preloadHighRes();
            }, 500);
          } else {
            // 缩略图加载失败，直接尝试高分辨率图片
            console.log('缩略图不可用，直接加载高分辨率图片');
            if (isMounted) {
              setCurrentSrc(highResUrl);
              setLoadingStage('high-res');
              onLoadingStateChange?.(true, '正在加载图片...', 'high-res');
              onQualityChange?.('medium');
            }
          }
        } else if (highResUrl) {
          // 直接加载高分辨率图片
          setCurrentSrc(highResUrl);
          setLoadingStage('high-res');
          onLoadingStateChange?.(true, '正在加载图片...', 'high-res');
          onQualityChange?.('medium');
        } else {
          // 没有可用的图片URL
          setLoadingStage('complete');
          onLoadingStateChange?.(false, '没有可用的图片', 'high-res');
        }
      };
      
      initializeLoader();
      
      return () => {
        isMounted = false;
      };
    }, [highResUrl, thumbnailUrl]);

    // 处理WebGL查看器的加载状态
    const handleWebGLLoadingStateChange = (
      isLoading: boolean, 
      message?: string, 
      quality?: 'high' | 'medium' | 'low' | 'unknown'
    ) => {
      console.log('WebGL查看器状态变化:', { isLoading, message, quality, loadingStage, currentSrc });
      
      // 传递WebGL查看器的状态，但保持当前阶段信息
      const currentStage = loadingStage === 'thumbnail' ? 'thumbnail' : 'high-res';
      
      // 如果是加载失败，传递错误信息
      if (!isLoading && message && message.includes('失败')) {
        onLoadingStateChange?.(false, message, currentStage);
        return;
      }
      
      // 正常状态传递
      if (isLoading) {
        const loadingMsg = loadingStage === 'thumbnail' ? '正在显示预览图...' : message;
        onLoadingStateChange?.(true, loadingMsg, currentStage);
      } else {
        const completeMsg = loadingStage === 'thumbnail' ? '预览图显示完成' : '图片加载完成';
        onLoadingStateChange?.(false, completeMsg, currentStage);
      }
      
      // 根据加载阶段调整质量回调
      if (!isLoading && quality && quality !== 'unknown') {
        if (loadingStage === 'thumbnail') {
          onQualityChange?.('low');
        } else if (loadingStage === 'high-res' || loadingStage === 'complete') {
          const mappedQuality = quality === 'high' ? 'high' : quality === 'medium' ? 'medium' : 'low';
          onQualityChange?.(mappedQuality);
        }
      }
    };

    // 只有在有有效图片URL时才渲染WebGL查看器
    if (!currentSrc) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-gray-500 dark:text-gray-400">
            {loadingStage === 'init' ? '准备加载图片...' : '正在加载...'}
          </div>
        </div>
      );
    }

    return (
      <WebGLImageViewer
        ref={ref}
        {...otherProps}
        src={currentSrc}
        onLoadingStateChange={handleWebGLLoadingStateChange}
      />
    );
  }
);

ProgressiveImageLoader.displayName = 'ProgressiveImageLoader';

export default ProgressiveImageLoader; 
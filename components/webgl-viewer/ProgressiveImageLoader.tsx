/**
 * 渐进式图片加载组件
 * 支持从缩略图到高分辨率图片的渐进式加载
 */

import React, { useState, useEffect, useRef } from 'react';
import WebGLImageViewer from './WebGLImageViewer';
import type { WebGLImageViewerRef, WebGLImageViewerProps } from './interfaces';

interface ProgressiveImageLoaderProps extends Omit<WebGLImageViewerProps, 'src' | 'onLoadingStateChange' | 'width' | 'height'> {
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
    const [targetImageDimensions, setTargetImageDimensions] = useState<{ width: number; height: number } | null>(null);
    
    // 获取目标图片尺寸（高分辨率图片的尺寸）
    const getTargetImageDimensions = async (url: string): Promise<{ width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        
        img.onerror = (error) => {
          reject(error);
        };
        
        img.src = url;
      });
    };
    
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
        setTargetImageDimensions(null);
        
        // 如果有缩略图，立即开始加载缩略图，并行获取目标图片尺寸
        if (thumbnailUrl && thumbnailUrl !== highResUrl) {
          // 立即开始缩略图验证和目标图片尺寸获取（并行执行）
          setLoadingStage('thumbnail');
          onLoadingStateChange?.(true, '正在加载预览图...', 'thumbnail');
          
          // 并行执行缩略图验证和目标尺寸获取
          const [thumbnailValid, dimensions] = await Promise.allSettled([
            loadThumbnail(thumbnailUrl),
            getTargetImageDimensions(highResUrl)
          ]);
          
          if (!isMounted) return;
          
          // 处理目标尺寸获取结果
          if (dimensions.status === 'fulfilled') {
            setTargetImageDimensions(dimensions.value);
            console.log('目标图片尺寸:', dimensions.value);
          } else {
            console.warn('获取目标图片尺寸失败:', dimensions.reason);
          }
          
          // 处理缩略图验证结果
          if (thumbnailValid.status === 'fulfilled' && thumbnailValid.value) {
            console.log('缩略图验证成功，立即显示');
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
          // 没有缩略图，直接加载高分辨率图片
          onLoadingStateChange?.(true, '正在获取图片信息...', 'high-res');
          
          try {
            const dimensions = await getTargetImageDimensions(highResUrl);
            if (isMounted) {
              setTargetImageDimensions(dimensions);
              console.log('目标图片尺寸:', dimensions);
            }
          } catch (error) {
            console.warn('获取图片尺寸失败，但继续加载:', error);
          }
          
          if (isMounted) {
            setCurrentSrc(highResUrl);
            setLoadingStage('high-res');
            onLoadingStateChange?.(true, '正在加载图片...', 'high-res');
            onQualityChange?.('medium');
          }
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
        width={targetImageDimensions?.width}
        height={targetImageDimensions?.height}
        onLoadingStateChange={handleWebGLLoadingStateChange}
      />
    );
  }
);

ProgressiveImageLoader.displayName = 'ProgressiveImageLoader';

export default ProgressiveImageLoader; 
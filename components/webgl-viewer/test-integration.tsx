/**
 * WebGL图像查看器集成测试组件
 * 用于验证WebGL查看器在不同环境下的工作状态
 */

import React, { useRef, useState } from 'react';
import WebGLImageViewer from './WebGLImageViewer';
import ProgressiveImageLoader from './ProgressiveImageLoader';
import type { WebGLImageViewerRef } from './interfaces';

const TestIntegration: React.FC = () => {
  const viewerRef = useRef<WebGLImageViewerRef>(null);
  const [testImage] = useState('/api/placeholder/800/600');
  const [thumbnailImage] = useState('/api/placeholder/200/150');
  const [loadingState, setLoadingState] = useState<string>('');
  const [qualityState, setQualityState] = useState<string>('');

  const handleZoomIn = () => {
    viewerRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    viewerRef.current?.zoomOut();
  };

  const handleReset = () => {
    viewerRef.current?.resetZoom();
  };

  const handleFitToScreen = () => {
    viewerRef.current?.fitToScreen();
  };

  const handleGetState = () => {
    const state = viewerRef.current?.getState();
    console.log('当前查看器状态:', state);
    alert(`缩放: ${state?.scale.toFixed(2)}, 位置: (${state?.translateX.toFixed(0)}, ${state?.translateY.toFixed(0)})`);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 shadow-sm">
        <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          WebGL图像查看器测试
        </h1>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleZoomIn}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            放大
          </button>
          <button
            onClick={handleZoomOut}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            缩小
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            重置
          </button>
          <button
            onClick={handleFitToScreen}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            适应屏幕
          </button>
          <button
            onClick={handleGetState}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            获取状态
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <div>加载状态: {loadingState}</div>
          <div>图片质量: {qualityState}</div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="w-full h-full bg-black rounded-lg overflow-hidden">
          <ProgressiveImageLoader
            ref={viewerRef}
            highResUrl={testImage}
            thumbnailUrl={thumbnailImage}
            className="w-full h-full"
            onLoadingStateChange={(isLoading, message, stage) => {
              setLoadingState(isLoading ? `加载中: ${message || ''} (${stage || ''})` : '加载完成');
            }}
            onQualityChange={(quality) => {
              setQualityState(quality);
            }}
            onZoomChange={(originalScale, relativeScale) => {
              console.log('缩放变化:', { originalScale, relativeScale });
            }}
            wheel={{
              step: 0.1,
              wheelDisabled: false,
              touchPadDisabled: false,
            }}
            pinch={{
              step: 0.1,
              disabled: false,
            }}
            doubleClick={{
              step: 1.5,
              disabled: false,
              mode: 'toggle',
              animationTime: 300,
            }}
            panning={{
              disabled: false,
              velocityDisabled: false,
            }}
            limitToBounds={true}
            centerOnInit={true}
            smooth={true}
            minScale={0.1}
            maxScale={10}
            initialScale={1}
            debug={true}
          />
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <h3 className="font-semibold mb-2">操作指南:</h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>滚轮缩放 - 使用鼠标滚轮进行缩放</li>
            <li>拖拽平移 - 按住左键拖拽图片</li>
            <li>双击缩放 - 双击图片进行缩放</li>
            <li>触摸操作 - 支持双指缩放和单指拖拽</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestIntegration; 
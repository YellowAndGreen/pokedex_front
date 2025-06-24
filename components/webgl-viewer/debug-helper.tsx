/**
 * WebGL图像查看器调试帮助工具
 * 用于测试和调试图片加载问题
 */

import React, { useState } from 'react';

interface ImageTestResult {
  url: string;
  success: boolean;
  error?: string;
  size?: string;
  cors?: boolean;
  timing?: number;
}

const DebugHelper: React.FC<{ imageUrl?: string; thumbnailUrl?: string }> = ({ 
  imageUrl, 
  thumbnailUrl 
}) => {
  const [testResults, setTestResults] = useState<ImageTestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const testImageUrl = async (url: string, label: string): Promise<ImageTestResult> => {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const timing = Date.now() - startTime;
        resolve({
          url: `${label}: ${url}`,
          success: true,
          size: `${img.width}x${img.height}`,
          timing
        });
      };
      
      img.onerror = (error) => {
        const timing = Date.now() - startTime;
        let errorMessage = '加载失败';
        
        // 检查是否是CORS问题
        if (url.startsWith('http') && !url.startsWith(window.location.origin)) {
          errorMessage += ' (可能是CORS问题)';
        }
        
        resolve({
          url: `${label}: ${url}`,
          success: false,
          error: errorMessage,
          timing
        });
      };
      
      // 测试CORS
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    const tests: Promise<ImageTestResult>[] = [];
    
    if (thumbnailUrl) {
      tests.push(testImageUrl(thumbnailUrl, '缩略图'));
    }
    
    if (imageUrl) {
      tests.push(testImageUrl(imageUrl, '高清图'));
    }
    
    try {
      const results = await Promise.all(tests);
      setTestResults(results);
    } catch (error) {
      console.error('测试失败:', error);
    } finally {
      setTesting(false);
    }
  };

  const checkNetworkInfo = () => {
    const info = [];
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      info.push(`网络类型: ${connection.effectiveType || '未知'}`);
      info.push(`下行速度: ${connection.downlink || '未知'} Mbps`);
    }
    
    info.push(`用户代理: ${navigator.userAgent}`);
    info.push(`当前域名: ${window.location.origin}`);
    
    return info;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
      <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
        🔧 WebGL查看器调试工具
      </h3>
      
      <div className="space-y-4">
        {/* 图片URL信息 */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">图片URL:</h4>
          <div className="space-y-1 text-sm">
            {thumbnailUrl && (
              <div className="break-all bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <span className="font-medium">缩略图:</span> {thumbnailUrl}
              </div>
            )}
            {imageUrl && (
              <div className="break-all bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <span className="font-medium">高清图:</span> {imageUrl}
              </div>
            )}
          </div>
        </div>

        {/* 测试按钮 */}
        <button
          onClick={runTests}
          disabled={testing || (!imageUrl && !thumbnailUrl)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? '测试中...' : '测试图片加载'}
        </button>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">测试结果:</h4>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-lg ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="font-medium text-sm">
                      {result.url.split(': ')[0]}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                    {result.success && result.size && (
                      <div>尺寸: {result.size}</div>
                    )}
                    {result.error && (
                      <div className="text-red-600 dark:text-red-400">错误: {result.error}</div>
                    )}
                    <div>耗时: {result.timing}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 系统信息 */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">系统信息:</h4>
          <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
            {checkNetworkInfo().map((info, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {info}
              </div>
            ))}
          </div>
        </div>

        {/* WebGL支持检测 */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">WebGL支持:</h4>
          <div className="text-sm">
            {(() => {
                             try {
                 const canvas = document.createElement('canvas');
                 const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                 
                 if (gl && gl instanceof WebGLRenderingContext) {
                   const renderer = gl.getParameter(gl.RENDERER);
                   return (
                     <div className="text-green-600 dark:text-green-400">
                       ✅ WebGL已支持 - {renderer}
                     </div>
                   );
                 } else {
                   return (
                     <div className="text-red-600 dark:text-red-400">
                       ❌ WebGL不支持
                     </div>
                   );
                 }
               } catch (error) {
                 return (
                   <div className="text-red-600 dark:text-red-400">
                     ❌ WebGL检测失败: {String(error)}
                   </div>
                 );
               }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugHelper; 
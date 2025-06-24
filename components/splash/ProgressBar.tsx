import React from 'react';

// 进度条配置接口
export interface ProgressBarProps {
  progress?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  progressColors?: string[];
  animationEnabled?: boolean;
  animationDuration?: number;
  showPercentage?: boolean;
  className?: string;
}

// 默认配置
const DEFAULT_PROPS: Required<ProgressBarProps> = {
  progress: 0,
  width: 192, // 12rem = 192px
  height: 2,
  backgroundColor: '#1a1a1a',
  progressColors: [
    'transparent',
    '#666',
    '#999',
    '#666',
    'transparent'
  ],
  animationEnabled: true,
  animationDuration: 2,
  showPercentage: false,
  className: ''
};

/**
 * 进度条组件
 * 包含加载进度条动画和progressMove移动动画效果
 */
const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const { 
    progress,
    width,
    height,
    backgroundColor,
    progressColors,
    animationEnabled,
    animationDuration,
    showPercentage,
    className
  } = config;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '1.5rem',
    justifyContent: 'center'
  };

  const progressBarStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    background: backgroundColor,
    borderRadius: `${height / 2}px`,
    overflow: 'hidden',
    position: 'relative'
  };

  const progressFillStyle: React.CSSProperties = {
    width: `${Math.min(Math.max(progress, 0), 100)}%`,
    height: '100%',
    background: `linear-gradient(90deg, ${progressColors.join(', ')})`,
    transition: 'width 0.1s ease-out',
    animation: animationEnabled && progress < 100 
      ? `progressMove ${animationDuration}s ease-in-out infinite` 
      : 'none',
    position: 'relative'
  };

  const percentageStyle: React.CSSProperties = {
    color: '#a3a3a3',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    minWidth: '3rem',
    textAlign: 'right'
  };

  return (
    <>
      <div className={`progress-area ${className}`} style={containerStyle}>
        <div
          className="progress-bar"
          style={progressBarStyle}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Loading progress: ${Math.round(progress)}%`}
        >
          <div
            className="progress-fill"
            style={progressFillStyle}
          />
        </div>
        
        {showPercentage && (
          <span
            className="progress-percentage"
            style={percentageStyle}
            aria-live="polite"
          >
            {Math.round(progress)}%
          </span>
        )}
      </div>

      {/* CSS动画定义 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes progressMove {
            0% { 
              transform: translateX(-100%); 
            }
            100% { 
              transform: translateX(400%); 
            }
          }
          
          /* 进度条光效动画 */
          @keyframes progressGlow {
            0%, 100% { 
              box-shadow: 0 0 5px rgba(153, 153, 153, 0.3); 
            }
            50% { 
              box-shadow: 0 0 15px rgba(153, 153, 153, 0.6); 
            }
          }
          
          /* 减少动画偏好支持 */
          @media (prefers-reduced-motion: reduce) {
            .progress-fill {
              animation: none !important;
            }
          }
          
          /* 响应式设计 */
          @media (max-width: 640px) {
            .progress-area .progress-bar { 
              width: ${width * 0.83}px !important; /* 10rem = 160px */
            }
          }

          @media (max-width: 480px) {
            .progress-area { 
              gap: 1rem !important; 
            }
            
            .progress-area .progress-bar { 
              width: ${width * 0.67}px !important; /* 8rem = 128px */
            }
          }
          
          /* 性能优化 */
          .progress-fill {
            will-change: transform, width;
            transform: translateZ(0);
          }
          
          /* 完成状态样式 */
          .progress-fill[data-complete="true"] {
            animation: progressGlow 1s ease-in-out;
          }
          
          /* 高对比度模式支持 */
          @media (prefers-contrast: high) {
            .progress-bar {
              border: 1px solid #666;
            }
            
            .progress-fill {
              background: linear-gradient(90deg, 
                transparent, 
                #ffffff, 
                #ffffff, 
                #ffffff, 
                transparent
              ) !important;
            }
          }
        `
      }} />
    </>
  );
};

export default React.memo(ProgressBar); 
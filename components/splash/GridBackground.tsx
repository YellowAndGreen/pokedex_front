import React from 'react';

// 网格背景配置接口
export interface GridBackgroundProps {
  opacity?: number;
  gridSize?: number;
  lineColor?: string;
  animationDuration?: number;
  animationEnabled?: boolean;
}

// 默认配置
const DEFAULT_PROPS: Required<GridBackgroundProps> = {
  opacity: 0.02,
  gridSize: 30,
  lineColor: 'rgba(255, 255, 255, 0.1)',
  animationDuration: 20,
  animationEnabled: true
};

/**
 * 动态网格背景组件
 * 通过CSS动画实现网格移动效果
 */
const GridBackground: React.FC<GridBackgroundProps> = (props) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const { opacity, gridSize, lineColor, animationDuration, animationEnabled } = config;

  const gridBackgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity,
    backgroundImage: `
      linear-gradient(${lineColor} 1px, transparent 1px),
      linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
    animation: animationEnabled ? `gridMove ${animationDuration}s linear infinite` : 'none',
    pointerEvents: 'none',
    zIndex: 2
  };

  return (
    <>
      <div
        className="grid-background"
        style={gridBackgroundStyle}
        aria-hidden="true"
      />
      
      {/* CSS动画定义 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gridMove {
            0% { 
              transform: translate(0, 0); 
            }
            100% { 
              transform: translate(${gridSize}px, ${gridSize}px); 
            }
          }
          
          /* 减少动画偏好支持 */
          @media (prefers-reduced-motion: reduce) {
            .grid-background {
              animation: none !important;
            }
          }
        `
      }} />
    </>
  );
};

export default React.memo(GridBackground); 
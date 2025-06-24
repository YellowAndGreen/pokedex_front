import React from 'react';

// 旋转光线配置接口
export interface RotatingLightProps {
  opacity?: number;
  rotationDuration?: number;
  lightColors?: string[];
  animationEnabled?: boolean;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
}

// 默认配置
const DEFAULT_PROPS: Required<RotatingLightProps> = {
  opacity: 1,
  rotationDuration: 30,
  lightColors: [
    'transparent',
    'rgba(255, 255, 255, 0.01)',
    'transparent',
    'rgba(255, 255, 255, 0.02)',
    'transparent'
  ],
  animationEnabled: true,
  blendMode: 'normal'
};

/**
 * 旋转光线效果组件
 * 使用圆锥渐变(conic-gradient)和旋转动画创建动态光效
 */
const RotatingLight: React.FC<RotatingLightProps> = (props) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const { opacity, rotationDuration, lightColors, animationEnabled, blendMode } = config;

  // 生成圆锥渐变字符串
  const conicGradient = `conic-gradient(
    from 0deg,
    ${lightColors.join(', ')}
  )`;

  const rotatingLightStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: conicGradient,
    animation: animationEnabled ? `rotate ${rotationDuration}s linear infinite` : 'none',
    opacity,
    mixBlendMode: blendMode,
    pointerEvents: 'none',
    zIndex: 3,
    willChange: 'transform'
  };

  return (
    <>
      <div
        className="rotating-light"
        style={rotatingLightStyle}
        aria-hidden="true"
      />
      
      {/* CSS动画定义 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes rotate {
            0% { 
              transform: rotate(0deg); 
            }
            100% { 
              transform: rotate(360deg); 
            }
          }
          
          /* 减少动画偏好支持 */
          @media (prefers-reduced-motion: reduce) {
            .rotating-light {
              animation: none !important;
            }
          }
          
          /* 性能优化 */
          .rotating-light {
            transform: translateZ(0);
            backface-visibility: hidden;
          }
        `
      }} />
    </>
  );
};

export default React.memo(RotatingLight); 
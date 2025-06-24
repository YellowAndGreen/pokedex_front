import React from 'react';

// 几何背景配置接口
export interface GeometricBackgroundProps {
  opacity?: number;
  colors?: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  positions?: {
    circle1: { x: string; y: string };
    circle2: { x: string; y: string };
    circle3: { x: string; y: string };
  };
}

// 默认配置
const DEFAULT_PROPS: Required<GeometricBackgroundProps> = {
  opacity: 1,
  colors: {
    primary: 'rgba(46, 229, 157, 0.08)', // RetroTech Dark emerald色调
    secondary: 'rgba(110, 231, 183, 0.06)', // 更浅的emerald色调
    tertiary: 'rgba(16, 185, 129, 0.04)' // 深emerald色调
  },
  positions: {
    circle1: { x: '20%', y: '30%' },
    circle2: { x: '80%', y: '70%' },
    circle3: { x: '40%', y: '80%' }
  }
};

/**
 * 几何背景装饰组件
 * 使用径向渐变创建多层背景效果
 */
const GeometricBackground: React.FC<GeometricBackgroundProps> = (props) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const { opacity, colors, positions } = config;

  return (
    <div
      className="geometric-background"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity,
        background: `
          radial-gradient(
            circle at ${positions.circle1.x} ${positions.circle1.y}, 
            ${colors.primary} 0%, 
            transparent 50%
          ),
          radial-gradient(
            circle at ${positions.circle2.x} ${positions.circle2.y}, 
            ${colors.secondary} 0%, 
            transparent 50%
          ),
          radial-gradient(
            circle at ${positions.circle3.x} ${positions.circle3.y}, 
            ${colors.tertiary} 0%, 
            transparent 50%
          )
        `,
        pointerEvents: 'none',
        zIndex: 1
      }}
      aria-hidden="true"
    />
  );
};

export default React.memo(GeometricBackground); 
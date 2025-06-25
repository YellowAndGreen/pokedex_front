import React from 'react';

// Logo容器配置接口
export interface LogoContainerProps {
  logoSize?: number;
  glowSize?: number;
  glowColor?: string;
  logoColors?: {
    primary: string;
    secondary: string;
    border: string;
    icon: string;
  };
  animationEnabled?: boolean;
  floatDuration?: number;
  glowDuration?: number;
}

// 默认配置
const DEFAULT_PROPS: Required<LogoContainerProps> = {
  logoSize: 72, // 4.5rem = 72px
  glowSize: 128, // 8rem = 128px
  glowColor: 'rgba(255, 255, 255, 0.1)',
  logoColors: {
    primary: '#1a1a1a',
    secondary: '#2d2d2d',
    border: '#333',
    icon: '#e5e5e5'
  },
  animationEnabled: true,
  floatDuration: 4,
  glowDuration: 3
};

/**
 * Logo容器组件
 * 包含背景光晕效果、相机图标和logoFloat浮动动画、glowPulse光晕脉冲动画
 */
const LogoContainer: React.FC<LogoContainerProps> = (props) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const { 
    logoSize, 
    glowSize, 
    glowColor, 
    logoColors, 
    animationEnabled, 
    floatDuration, 
    glowDuration 
  } = config;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem'
  };

  const glowStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${glowSize}px`,
    height: `${glowSize}px`,
    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
    borderRadius: '50%',
    animation: animationEnabled ? `glowPulse ${glowDuration}s ease-in-out infinite` : 'none',
    pointerEvents: 'none',
    zIndex: 1
  };

  const logoStyle: React.CSSProperties = {
    width: `${logoSize}px`,
    height: `${logoSize}px`,
    background: `linear-gradient(135deg, ${logoColors.primary}, ${logoColors.secondary})`,
    border: `1px solid ${logoColors.border}`,
    borderRadius: `${logoSize / 3}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `
      0 0 0 1px rgba(255, 255, 255, 0.05),
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    animation: animationEnabled ? `logoFloat ${floatDuration}s ease-in-out infinite` : 'none',
    backdropFilter: 'blur(10px)',
    zIndex: 2,
    position: 'relative'
  };

  return (
    <>
      <div className="logo-container" style={containerStyle}>
        {/* Logo背景光晕 */}
        <div
          className="logo-glow"
          style={glowStyle}
          aria-hidden="true"
        />

        {/* Logo主体 */}
        <div
          className="logo"
          style={logoStyle}
          role="img"
          aria-label="Pokedex 鸟类图鉴 Logo"
        >
          {/* 优雅鸟类图标 SVG */}
                      <svg
              width="56"
              height="48"
              viewBox="10 30 75 25"
              fill="none"
              className="elegant-bird"
              aria-hidden="true"
            >
            {/* 鸟尾巴 */}
            <path 
              className="bird-tail" 
              d="M15 45 Q8 48 10 55 Q12 58 15 55 Q18 52 20 48 Q18 44 15 45" 
              fill={logoColors.icon} 
              opacity="0.8"
            />
            
            {/* 鸟身体 */}
            <ellipse 
              className="bird-body" 
              cx="50" 
              cy="45" 
              rx="22" 
              ry="12" 
              fill={logoColors.icon} 
              opacity="0.6"
            />
            
            {/* 鸟头部 */}
            <circle 
              className="bird-head" 
              cx="65" 
              cy="38" 
              r="10" 
              fill={logoColors.icon}
              opacity="0.8"
            />
            
            {/* 鸟嘴 */}
            <path 
              className="bird-beak" 
              d="M73 38 L82 36 L82 40 L73 38" 
              fill={logoColors.icon}
              opacity="0.9"
            />
            
            {/* 鸟眼睛 */}
            <circle 
              className="bird-eye" 
              cx="69" 
              cy="35" 
              r="2.5" 
              fill="#ffffff"
            />
            <circle 
              className="bird-pupil" 
              cx="70" 
              cy="34" 
              r="1" 
              fill="#1f2937"
            />
            
            {/* 左翅膀 */}
            <g className="wing-left">
              <path 
                d="M35 40 Q20 32 15 42 Q18 52 30 50 Q38 48 35 40" 
                fill={logoColors.icon}
                opacity="0.7"
              />
              <path 
                className="wing-detail" 
                d="M32 42 Q22 36 18 44 Q20 48 30 47" 
                fill={logoColors.icon} 
                opacity="0.5"
              />
            </g>
            
            {/* 右翅膀 */}
            <g className="wing-right">
              <path 
                d="M65 40 Q80 32 85 42 Q82 52 70 50 Q62 48 65 40" 
                fill={logoColors.icon}
                opacity="0.7"
              />
              <path 
                className="wing-detail" 
                d="M68 42 Q78 36 82 44 Q80 48 70 47" 
                fill={logoColors.icon} 
                opacity="0.5"
              />
            </g>
            
            {/* 胸部特色羽毛 */}
            <ellipse 
              fill={logoColors.icon} 
              cx="50" 
              cy="50" 
              rx="15" 
              ry="6" 
              opacity="0.4"
            />
          </svg>
        </div>
      </div>

      {/* CSS动画定义 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes glowPulse {
            0%, 100% { 
              opacity: 0.3; 
              transform: scale(1); 
            }
            50% { 
              opacity: 0.6; 
              transform: scale(1.1); 
            }
          }
          
          @keyframes logoFloat {
            0%, 100% { 
              transform: translateY(0) scale(1); 
            }
            50% { 
              transform: translateY(-8px) scale(1.02); 
            }
          }

          /* 鸟类动画效果 */
          .elegant-bird .wing-left {
            transform-origin: 35px 40px;
            animation: wingFlapLeft 0.8s ease-in-out infinite;
          }

          .elegant-bird .wing-right {
            transform-origin: 65px 40px;
            animation: wingFlapRight 0.8s ease-in-out infinite;
          }

          .elegant-bird .bird-tail {
            transform-origin: 15px 45px;
            animation: tailSway 1.2s ease-in-out infinite;
          }

          @keyframes wingFlapLeft {
            0%, 100% {
              transform: rotate(-5deg) scaleY(1);
            }
            50% {
              transform: rotate(-25deg) scaleY(0.8);
            }
          }

          @keyframes wingFlapRight {
            0%, 100% {
              transform: rotate(5deg) scaleY(1);
            }
            50% {
              transform: rotate(25deg) scaleY(0.8);
            }
          }

          @keyframes tailSway {
            0%, 100% {
              transform: rotate(0deg);
            }
            25% {
              transform: rotate(-3deg);
            }
            75% {
              transform: rotate(3deg);
            }
          }
          
          /* 减少动画偏好支持 */
          @media (prefers-reduced-motion: reduce) {
            .logo-glow,
            .logo,
            .elegant-bird .wing-left,
            .elegant-bird .wing-right,
            .elegant-bird .bird-tail {
              animation: none !important;
            }
          }
          
          /* 性能优化 */
          .logo {
            will-change: transform;
            transform: translateZ(0);
          }
          
          .logo-glow {
            will-change: transform, opacity;
            transform: translateZ(0);
          }
          
          /* 响应式适配 */
          @media (max-width: 480px) {
            .logo-container .logo {
              width: ${logoSize * 0.8}px !important;
              height: ${logoSize * 0.8}px !important;
            }
            
            .logo-container .logo-glow {
              width: ${glowSize * 0.8}px !important;
              height: ${glowSize * 0.8}px !important;
            }
          }
        `
      }} />
    </>
  );
};

export default React.memo(LogoContainer); 
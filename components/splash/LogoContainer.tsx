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
          {/* 现代化鸟类图标 SVG */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={logoColors.icon}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* 鸟类轮廓 */}
            <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-5-6.5 5 2-7L2 9h7l3-7z" fill={logoColors.icon} fillOpacity="0.2" />
            {/* 鸟身体 */}
            <path d="M5 12c0 0 2-1 7-1s7 1 7 1" />
            <path d="M12 2c-1 0-2 1-2 2.5S11 7 12 7s2-1.5 2-2.5S13 2 12 2z" fill={logoColors.icon} fillOpacity="0.3" />
            {/* 翅膀 */}
            <path d="M7 9c-1.5 0-3 1-3 3s1.5 2 3 2" />
            <path d="M17 9c1.5 0 3 1 3 3s-1.5 2-3 2" />
            {/* 鸟眼睛 */}
            <circle cx="10" cy="6" r="0.5" fill={logoColors.icon} />
            <circle cx="14" cy="6" r="0.5" fill={logoColors.icon} />
            {/* 鸟尾巴 */}
            <path d="M12 15c0 2-1 4-1 4s1-2 1-4 1-4 1-4-1 2-1 4z" />
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
          
          /* 减少动画偏好支持 */
          @media (prefers-reduced-motion: reduce) {
            .logo-glow,
            .logo {
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
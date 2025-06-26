import React from 'react';

// 开屏动画状态类型
export interface SplashAnimationState {
  phase: 'loading' | 'loaded' | 'hidden';
  progress: number;
}

// 开屏动画配置类型
export interface SplashConfig {
  duration: number;
  showTime: number;
  title: string;
  description: string;
}

// 开屏动画组件属性
export interface SplashScreenProps {
  onAnimationComplete?: () => void;
  config?: Partial<SplashConfig>;
  progress?: number; // 新增：从外部传入进度
  phase?: 'loading' | 'loaded' | 'hidden'; // 新增：从外部传入阶段
}

// 默认配置
const DEFAULT_CONFIG: SplashConfig = {
  duration: 3000, // 动画持续时间 3秒
  showTime: 1500, // 显示时间 1.5秒
  title: 'Pokedex',
  description: ''
};

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  config: userConfig,
  progress = 0,
  phase = 'loading'
}) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // 如果动画已隐藏，不渲染组件
  if (phase === 'hidden') {
    return null;
  }

  return (
    <div
      className="splash-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#1A1A2E', // RetroTech Dark 主背景色
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        overflow: 'hidden',
        opacity: phase === 'loaded' ? 1 : 0.95,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {/* 几何背景装饰 - 使用RetroTech Dark配色 */}
      <div
        className="geometric-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 20% 30%, rgba(46, 229, 157, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(110, 231, 183, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 50%)
          `
        }}
      />

      {/* 网格背景 - 使用emerald色调 */}
      <div
        className="grid-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(rgba(46, 229, 157, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46, 229, 157, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          animation: 'gridMove 20s linear infinite'
        }}
      />

      {/* 旋转光线效果 - 使用emerald色调 */}
      <div
        className="rotating-light"
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `conic-gradient(
            from 0deg,
            transparent,
            rgba(46, 229, 157, 0.02),
            transparent,
            rgba(110, 231, 183, 0.03),
            transparent
          )`,
          animation: 'rotate 30s linear infinite'
        }}
      />

      {/* 主要内容区域 */}
      <div className="splash-content" style={{ textAlign: 'center', zIndex: 10 }}>
        {/* Logo容器 */}
        <div
          className="logo-container"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}
        >
          {/* Logo背景光晕 - 使用emerald色调 */}
          <div
            className="logo-glow"
            style={{
              position: 'absolute',
              width: '8rem',
              height: '8rem',
              background: 'radial-gradient(circle, rgba(46, 229, 157, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'glowPulse 3s ease-in-out infinite'
            }}
          />

          {/* Logo - 使用RetroTech Dark配色 */}
          <div
            className="logo"
            style={{
              width: '4.5rem',
              height: '4.5rem',
              background: 'linear-gradient(135deg, #151515, #1f2937)', // RetroTech Dark卡片背景渐变
              border: '1px solid #374151', // 深灰边框
              borderRadius: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `
                0 0 0 1px rgba(46, 229, 157, 0.1),
                0 8px 32px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(46, 229, 157, 0.1)
              `,
              animation: 'logoFloat 4s ease-in-out infinite',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* 优雅鸟类图标 SVG - 使用emerald色调 */}
            <svg
              width="56"
              height="48"
              viewBox="10 30 75 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(46, 229, 157, 0.3))'
              }}
            >
              <defs>
                <linearGradient id="birdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2EE59D" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              
              {/* 鸟身体 */}
              <ellipse cx="45" cy="42" rx="15" ry="8" fill="url(#birdGradient)" />
              
              {/* 鸟头部 */}
              <circle cx="30" cy="35" r="6" fill="url(#birdGradient)" />
              
              {/* 鸟嘴 */}
              <path d="M20 35 L25 37 L25 33 Z" fill="#10B981" />
              
              {/* 鸟翅膀 */}
              <ellipse cx="50" cy="40" rx="12" ry="6" fill="#059669" opacity="0.8" transform="rotate(15 50 40)" />
              
              {/* 鸟尾巴 */}
              <ellipse cx="65" cy="44" rx="8" ry="4" fill="#059669" opacity="0.7" transform="rotate(25 65 44)" />
              
              {/* 鸟眼睛 */}
              <circle cx="28" cy="33" r="1.5" fill="#ffffff" />
              <circle cx="28" cy="33" r="0.8" fill="#1f2937" />
              
              {/* 装饰性羽毛纹理 */}
              <path d="M40 38 Q45 36 50 38" stroke="#2EE59D" strokeWidth="0.5" fill="none" opacity="0.6" />
              <path d="M42 41 Q47 39 52 41" stroke="#2EE59D" strokeWidth="0.5" fill="none" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* 应用标题 */}
        <div className="app-title" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1
            style={{
              color: '#ffffff',
              fontSize: '2.25rem',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.025em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              animation: 'titleSlide 1s ease-out'
            }}
          >
            {config.title}
          </h1>
          
          <p
            style={{
              color: '#9CA3AF', // RetroTech zinc-400
              fontSize: '0.95rem',
              margin: 0,
              fontWeight: 400,
              letterSpacing: '0.025em',
              animation: 'subtitleFade 1.5s ease-out both',
              opacity: phase === 'loaded' ? 1 : 0
            }}
          >
            {config.description}
          </p>
        </div>

        {/* 进度条区域 */}
        <div
          className="progress-area"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginTop: '1.5rem',
            justifyContent: 'center'
          }}
        >
          <div
            className="progress-bar"
            style={{
              width: '12rem',
              height: '2px',
              background: '#151515', // RetroTech Dark卡片背景
              borderRadius: '1px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, transparent, #10B981, #2EE59D, #10B981, transparent)', // RetroTech emerald渐变
                transition: 'width 0.1s ease-out',
                animation: phase === 'loading' ? 'progressMove 2s ease-in-out infinite' : 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* 基础CSS动画样式 */}
      <style>
        {`
          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(30px, 30px); }
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes glowPulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          
          @keyframes logoFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes titleSlide {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes subtitleFade {
            0% { opacity: 0; }
            70% { opacity: 0; }
            100% { opacity: 1; }
          }
          
          @keyframes progressMove {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );
};

export default SplashScreen; 
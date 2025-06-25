import React, { useState, useEffect } from 'react';

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
}

// 默认配置
const DEFAULT_CONFIG: SplashConfig = {
  duration: 3000, // 动画持续时间 3秒
  showTime: 1500, // 显示时间 1.5秒
  title: 'Pokedex',
  description: ''
};

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onAnimationComplete, 
  config: userConfig 
}) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const [animationState, setAnimationState] = useState<SplashAnimationState>({
    phase: 'loading',
    progress: 0
  });

  useEffect(() => {
    // 模拟加载进度
    const progressInterval = setInterval(() => {
      setAnimationState(prev => {
        const newProgress = Math.min(prev.progress + 2, 100);
        return {
          ...prev,
          progress: newProgress,
          phase: newProgress === 100 ? 'loaded' : 'loading'
        };
      });
    }, config.duration / 50);

    // 动画完成后隐藏
    const hideTimer = setTimeout(() => {
      setAnimationState(prev => ({ ...prev, phase: 'hidden' }));
      onAnimationComplete?.();
    }, config.duration + config.showTime);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(hideTimer);
    };
  }, [config.duration, config.showTime, onAnimationComplete]);

  // 如果动画已隐藏，不渲染组件
  if (animationState.phase === 'hidden') {
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
        opacity: animationState.phase === 'loaded' ? 1 : 0.95,
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
              className="elegant-bird"
            >
              {/* 鸟尾巴 */}
              <path 
                className="bird-tail" 
                d="M15 45 Q8 48 10 55 Q12 58 15 55 Q18 52 20 48 Q18 44 15 45" 
                fill="#10B981" 
                opacity="0.8"
              />
              
              {/* 鸟身体 */}
              <ellipse 
                className="bird-body" 
                cx="50" 
                cy="45" 
                rx="22" 
                ry="12" 
                fill="#2EE59D" 
                opacity="0.9"
              />
              
              {/* 鸟头部 */}
              <circle 
                className="bird-head" 
                cx="65" 
                cy="38" 
                r="10" 
                fill="#10B981"
              />
              
              {/* 鸟嘴 */}
              <path 
                className="bird-beak" 
                d="M73 38 L82 36 L82 40 L73 38" 
                fill="#059669"
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
                  fill="#34D399"
                />
                <path 
                  className="wing-detail" 
                  d="M32 42 Q22 36 18 44 Q20 48 30 47" 
                  fill="#10B981" 
                  opacity="0.8"
                />
              </g>
              
              {/* 右翅膀 */}
              <g className="wing-right">
                <path 
                  d="M65 40 Q80 32 85 42 Q82 52 70 50 Q62 48 65 40" 
                  fill="#34D399"
                />
                <path 
                  className="wing-detail" 
                  d="M68 42 Q78 36 82 44 Q80 48 70 47" 
                  fill="#10B981" 
                  opacity="0.8"
                />
              </g>
              
              {/* 胸部特色羽毛 - 翡翠色调 */}
              <ellipse 
                fill="#6EE7B7" 
                cx="50" 
                cy="50" 
                rx="15" 
                ry="6" 
                opacity="0.8"
              />
            </svg>
          </div>
        </div>

        {/* 应用标题区域 */}
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
              opacity: animationState.phase === 'loaded' ? 1 : 0
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
                width: `${animationState.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, transparent, #10B981, #2EE59D, #10B981, transparent)', // RetroTech emerald渐变
                transition: 'width 0.1s ease-out',
                animation: animationState.phase === 'loading' ? 'progressMove 2s ease-in-out infinite' : 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* 基础CSS动画样式 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(30px, 30px); }
          }

          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes glowPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }

          @keyframes logoFloat {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-8px) scale(1.02); }
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

          @keyframes titleSlide {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }



          @keyframes subtitleFade {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }

          @keyframes progressMove {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }

          /* 响应式设计 */
          @media (max-width: 640px) {
            .splash-content h1 { font-size: 1.875rem !important; }
            .splash-content p { font-size: 0.875rem !important; }
            .progress-bar { width: 10rem !important; }
          }

          @media (max-width: 480px) {
            .splash-content h1 { font-size: 1.5rem !important; }
            .splash-content { gap: 2rem !important; }
          }

          /* 减少动画偏好支持 */
          @media (prefers-reduced-motion: reduce) {
            *,
            .elegant-bird .wing-left,
            .elegant-bird .wing-right,
            .elegant-bird .bird-tail {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default React.memo(SplashScreen); 
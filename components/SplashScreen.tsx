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
        background: '#0a0a0a',
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
      {/* 几何背景装饰 - 暂时使用基础实现，待后续组件创建后替换 */}
      <div
        className="geometric-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 20% 30%, rgba(64, 64, 64, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(64, 64, 64, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(96, 96, 96, 0.05) 0%, transparent 50%)
          `
        }}
      />

      {/* 网格背景 - 基础实现 */}
      <div
        className="grid-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.02,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          animation: 'gridMove 20s linear infinite'
        }}
      />

      {/* 旋转光线效果 - 基础实现 */}
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
            rgba(255, 255, 255, 0.01),
            transparent,
            rgba(255, 255, 255, 0.02),
            transparent
          )`,
          animation: 'rotate 30s linear infinite'
        }}
      />

      {/* 主要内容区域 */}
      <div className="splash-content" style={{ textAlign: 'center', zIndex: 10 }}>
        {/* Logo容器 - 基础实现 */}
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
          {/* Logo背景光晕 */}
          <div
            className="logo-glow"
            style={{
              position: 'absolute',
              width: '8rem',
              height: '8rem',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'glowPulse 3s ease-in-out infinite'
            }}
          />

          {/* Logo */}
          <div
            className="logo"
            style={{
              width: '4.5rem',
              height: '4.5rem',
              background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
              border: '1px solid #333',
              borderRadius: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.05),
                0 8px 32px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
              animation: 'logoFloat 4s ease-in-out infinite',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* 鸟类图标 SVG */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* 鸟类轮廓 */}
              <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-5-6.5 5 2-7L2 9h7l3-7z" fill="#e5e5e5" fillOpacity="0.2" />
              {/* 鸟身体 */}
              <path d="M5 12c0 0 2-1 7-1s7 1 7 1" />
              <path d="M12 2c-1 0-2 1-2 2.5S11 7 12 7s2-1.5 2-2.5S13 2 12 2z" fill="#e5e5e5" fillOpacity="0.3" />
              {/* 翅膀 */}
              <path d="M7 9c-1.5 0-3 1-3 3s1.5 2 3 2" />
              <path d="M17 9c1.5 0 3 1 3 3s-1.5 2-3 2" />
              {/* 鸟眼睛 */}
              <circle cx="10" cy="6" r="0.5" fill="#e5e5e5" />
              <circle cx="14" cy="6" r="0.5" fill="#e5e5e5" />
              {/* 鸟尾巴 */}
              <path d="M12 15c0 2-1 4-1 4s1-2 1-4 1-4 1-4-1 2-1 4z" />
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
          
          <div
            className="title-line"
            style={{
              width: '3rem',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #666, transparent)',
              margin: '0 auto',
              animation: 'lineGrow 1.5s ease-out both'
            }}
          />
          
          <p
            style={{
              color: '#a3a3a3',
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
              background: '#1a1a1a',
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
                background: 'linear-gradient(90deg, transparent, #666, #999, #666, transparent)',
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

          @keyframes titleSlide {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes lineGrow {
            0% { width: 0; opacity: 0; }
            100% { width: 3rem; opacity: 1; }
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
            * {
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
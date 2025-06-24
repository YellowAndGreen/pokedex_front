import React from 'react';

// 应用标题配置接口
export interface AppTitleProps {
  title?: string;
  description?: string;
  titleColor?: string;
  descriptionColor?: string;

  fontSize?: {
    title: string;
    description: string;
  };
  animationEnabled?: boolean;
  animationDelays?: {
    title: number;
    description: number;
  };
  animationDurations?: {
    title: number;
    description: number;
  };
}

// 默认配置
const DEFAULT_PROPS: Required<AppTitleProps> = {
  title: 'Pokedex',
  description: '',
  titleColor: '#ffffff',
  descriptionColor: '#a3a3a3',
  fontSize: {
    title: '2.25rem',
    description: '0.95rem'
  },
  animationEnabled: true,
  animationDelays: {
    title: 0,
    description: 1
  },
  animationDurations: {
    title: 1,
    description: 1.5
  }
};

/**
 * 应用标题组件
 * 包含标题、描述文本和titleSlide滑入动画、subtitleFade渐现动画、lineGrow线条生长动画
 */
const AppTitle: React.FC<AppTitleProps> = (props) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const { 
    title, 
    description, 
    titleColor, 
    descriptionColor, 
    fontSize,
    animationEnabled, 
    animationDelays,
    animationDurations
  } = config;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    textAlign: 'center'
  };

  const titleStyle: React.CSSProperties = {
    color: titleColor,
    fontSize: fontSize.title,
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.025em',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    animation: animationEnabled 
      ? `titleSlide ${animationDurations.title}s ease-out ${animationDelays.title}s both` 
      : 'none'
  };



  const descriptionStyle: React.CSSProperties = {
    color: descriptionColor,
    fontSize: fontSize.description,
    margin: 0,
    fontWeight: 400,
    letterSpacing: '0.025em',
    animation: animationEnabled 
      ? `subtitleFade ${animationDurations.description}s ease-out ${animationDelays.description}s both` 
      : 'none',
    opacity: animationEnabled ? 0 : 1
  };

  return (
    <>
      <div className="app-title" style={containerStyle}>
        <h1
          className="app-title-heading"
          style={titleStyle}
        >
          {title}
        </h1>
        

        
        <p
          className="app-title-description"
          style={descriptionStyle}
        >
          {description}
        </p>
      </div>

      {/* CSS动画定义 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes titleSlide {
            0% { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            100% { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          

          
          @keyframes subtitleFade {
            0% { 
              opacity: 0; 
              transform: translateY(10px);
            }
            100% { 
              opacity: 1; 
              transform: translateY(0);
            }
          }
          
          /* 减少动画偏好支持 */
          @media (prefers-reduced-motion: reduce) {
            .app-title-heading,
            .app-title-description {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
          
          /* 响应式设计 */
          @media (max-width: 640px) {
            .app-title-heading { 
              font-size: 1.875rem !important; 
            }
            .app-title-description { 
              font-size: 0.875rem !important; 
            }
          }

          @media (max-width: 480px) {
            .app-title-heading { 
              font-size: 1.5rem !important; 
            }
            .app-title { 
              gap: 0.75rem !important; 
            }
          }
          
          /* 性能优化 */
          .app-title-heading,
          .app-title-description {
            will-change: transform, opacity;
          }
          
          .title-line {
            will-change: width, opacity;
          }
        `
      }} />
    </>
  );
};

export default React.memo(AppTitle); 
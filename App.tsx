import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CategoryList from './components/CategoryList';
import CategoryDetail from './components/CategoryDetail';
import AnalyticsPage from './components/AnalyticsPage';
import LoginPage from './components/LoginPage';
import TagPage from './components/TagPage';
import SplashScreen from './components/SplashScreen';
import { CategoryProvider } from './contexts/CategoryContext';
import { AuthProvider } from './contexts/AuthContext';
import useSplashAnimation, { SplashAnimationPhase } from './hooks/useSplashAnimation';

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);

  // 配置开屏动画 - 优化后的简化配置
  const splashAnimation = useSplashAnimation({
    duration: 3000,
    showTime: 1000,
    autoHide: true,
    maxTimeout: 8000,
    onComplete: () => {
      setIsAppReady(true);
    },
    onError: (error) => {
      console.error('Splash animation error:', error);
      setIsAppReady(true);
    },
    onTimeout: () => {
      console.warn('Splash animation timed out');
      setIsAppReady(true);
    }
  });

  // 简化的极端超时保护
  useEffect(() => {
    const extremeTimeout = 16000;
    
    const timeoutId = setTimeout(() => {
      if (!isAppReady) {
        console.error('Extreme timeout - forcing app to show');
        setIsAppReady(true);
      }
    }, extremeTimeout);

    return () => clearTimeout(timeoutId);
  }, []);

  // 手动跳过开屏动画的处理函数
  const handleSkipSplash = useCallback(() => {
    try {
      splashAnimation.hide();
      setIsAppReady(true);
    } catch (error) {
      console.error('Error skipping splash:', error);
      setIsAppReady(true);
    }
  }, [splashAnimation]);

  // 添加键盘快捷键跳过动画
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isAppReady) {
        handleSkipSplash();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAppReady, handleSkipSplash]);

  // 简化渲染逻辑：仅基于 isAppReady 判断
  if (!isAppReady) {
    return (
      <SplashScreen
        onAnimationComplete={handleSkipSplash}
        progress={splashAnimation.progress}
        phase={splashAnimation.phase}
        config={{
          title: 'Pokedex',
          description: '正在加载应用...',
          duration: splashAnimation.config.duration,
          showTime: splashAnimation.config.showTime
        }}
      />
    );
  }

  // 主应用渲染
  return (
    <HashRouter>
      <AuthProvider>
        <CategoryProvider>
          <Layout>
            <Routes>
              <Route path='/' element={<CategoryList />} />
              <Route path='/categories' element={<Navigate to='/' replace />} />
              <Route path='/categories/:categoryId' element={<CategoryDetail />} />
              <Route path='/tags/:tagName' element={<TagPage />} />
              <Route path='/species' element={<AnalyticsPage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </Layout>
        </CategoryProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;

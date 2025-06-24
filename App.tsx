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
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // 配置开屏动画
  const splashAnimation = useSplashAnimation({
    duration: 3000,
    showTime: 1000,
    autoHide: true,
    onPhaseChange: (phase) => {
      console.log('Splash animation phase:', phase);
    },
    onProgressChange: (progress) => {
      // 当进度达到80%时，开始预加载主应用
      if (progress >= 80 && !initialDataLoaded) {
        setInitialDataLoaded(true);
      }
    },
    onComplete: () => {
      console.log('Splash animation completed');
      setIsAppReady(true);
    },
    onError: (error) => {
      console.error('Splash animation error:', error);
      // 出错时也要显示主应用
      setIsAppReady(true);
    }
  });

  // 模拟应用初始化和数据预加载
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 模拟关键数据的预加载
        await Promise.all([
          // 模拟API调用
          new Promise(resolve => setTimeout(resolve, 500)),
          // 模拟资源加载
          new Promise(resolve => setTimeout(resolve, 300)),
        ]);
        
        console.log('App initialization completed');
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    if (initialDataLoaded) {
      initializeApp();
    }
  }, [initialDataLoaded]);

  // 手动跳过开屏动画的处理函数
  const handleSkipSplash = useCallback(() => {
    splashAnimation.hide();
    setIsAppReady(true);
  }, [splashAnimation]);

  // 如果开屏动画还在显示，渲染开屏动画
  if (!splashAnimation.isHidden && !isAppReady) {
    return (
      <SplashScreen
        onAnimationComplete={handleSkipSplash}
        config={{
          title: 'Pokedex',
          description: '',
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

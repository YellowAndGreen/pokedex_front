import { useState, useEffect, useCallback, useRef } from 'react';

// 动画状态枚举
export enum SplashAnimationPhase {
  LOADING = 'loading',
  LOADED = 'loaded',
  HIDDEN = 'hidden'
}

// 动画状态接口
export interface SplashAnimationState {
  phase: SplashAnimationPhase;
  progress: number;
  isVisible: boolean;
  hasError: boolean;
}

// Hook配置接口
export interface SplashAnimationConfig {
  duration?: number;
  showTime?: number;
  progressStep?: number;
  autoHide?: boolean;
  onPhaseChange?: (phase: SplashAnimationPhase) => void;
  onProgressChange?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// 默认配置
const DEFAULT_CONFIG: Required<SplashAnimationConfig> = {
  duration: 3000,
  showTime: 1500,
  progressStep: 2,
  autoHide: true,
  onPhaseChange: () => {},
  onProgressChange: () => {},
  onComplete: () => {},
  onError: () => {}
};

/**
 * 开屏动画Hook
 * 控制开屏动画的显示时机、管理动画状态、提供动画完成回调
 */
export const useSplashAnimation = (userConfig?: SplashAnimationConfig) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const {
    duration,
    showTime,
    progressStep,
    autoHide,
    onPhaseChange,
    onProgressChange,
    onComplete,
    onError
  } = config;

  // 状态管理
  const [animationState, setAnimationState] = useState<SplashAnimationState>({
    phase: SplashAnimationPhase.LOADING,
    progress: 0,
    isVisible: true,
    hasError: false
  });

  // 引用管理
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // 安全的状态更新函数
  const safeSetState = useCallback((updater: (prev: SplashAnimationState) => SplashAnimationState) => {
    if (isMountedRef.current) {
      setAnimationState(updater);
    }
  }, []);

  // 清理定时器函数
  const clearTimers = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // 手动隐藏动画
  const hide = useCallback(() => {
    try {
      clearTimers();
      safeSetState(prev => {
        const newState = {
          ...prev,
          phase: SplashAnimationPhase.HIDDEN,
          isVisible: false
        };
        onPhaseChange(newState.phase);
        return newState;
      });
      onComplete();
    } catch (error) {
      console.error('Error hiding splash animation:', error);
      onError(error as Error);
    }
  }, [clearTimers, safeSetState, onPhaseChange, onComplete, onError]);

  // 手动显示动画
  const show = useCallback(() => {
    try {
      safeSetState(prev => {
        const newState = {
          ...prev,
          phase: SplashAnimationPhase.LOADING,
          progress: 0,
          isVisible: true,
          hasError: false
        };
        onPhaseChange(newState.phase);
        return newState;
      });
    } catch (error) {
      console.error('Error showing splash animation:', error);
      onError(error as Error);
    }
  }, [safeSetState, onPhaseChange, onError]);

  // 重置动画状态
  const reset = useCallback(() => {
    try {
      clearTimers();
      safeSetState(() => ({
        phase: SplashAnimationPhase.LOADING,
        progress: 0,
        isVisible: true,
        hasError: false
      }));
    } catch (error) {
      console.error('Error resetting splash animation:', error);
      onError(error as Error);
    }
  }, [clearTimers, safeSetState, onError]);

  // 设置错误状态
  const setError = useCallback((error: Error) => {
    clearTimers();
    safeSetState(prev => ({
      ...prev,
      hasError: true
    }));
    onError(error);
  }, [clearTimers, safeSetState, onError]);

  // 主要动画逻辑
  useEffect(() => {
    if (!animationState.isVisible || animationState.hasError) {
      return;
    }

    try {
      // 进度更新逻辑
      const progressUpdateInterval = duration / (100 / progressStep);
      
      progressIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current) return;
        
        safeSetState(prev => {
          const newProgress = Math.min(prev.progress + progressStep, 100);
          const newPhase = newProgress === 100 ? SplashAnimationPhase.LOADED : prev.phase;
          
          // 触发回调
          if (newProgress !== prev.progress) {
            onProgressChange(newProgress);
          }
          if (newPhase !== prev.phase) {
            onPhaseChange(newPhase);
          }
          
          return {
            ...prev,
            progress: newProgress,
            phase: newPhase
          };
        });
      }, progressUpdateInterval);

      // 自动隐藏逻辑
      if (autoHide) {
        hideTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            hide();
          }
        }, duration + showTime);
      }

    } catch (error) {
      console.error('Error in splash animation effect:', error);
      setError(error as Error);
    }

    // 清理函数
    return () => {
      clearTimers();
    };
  }, [
    duration,
    showTime,
    progressStep,
    autoHide,
    animationState.isVisible,
    animationState.hasError,
    hide,
    setError,
    safeSetState,
    onProgressChange,
    onPhaseChange,
    clearTimers
  ]);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearTimers();
    };
  }, [clearTimers]);

  // 返回状态和控制函数
  return {
    // 状态
    ...animationState,
    
    // 计算属性
    isLoading: animationState.phase === SplashAnimationPhase.LOADING,
    isLoaded: animationState.phase === SplashAnimationPhase.LOADED,
    isHidden: animationState.phase === SplashAnimationPhase.HIDDEN,
    isComplete: animationState.progress === 100,
    
    // 控制函数
    hide,
    show,
    reset,
    setError,
    
    // 配置信息
    config: {
      duration,
      showTime,
      progressStep,
      autoHide
    }
  };
};

// 导出Hook作为默认导出
export default useSplashAnimation; 
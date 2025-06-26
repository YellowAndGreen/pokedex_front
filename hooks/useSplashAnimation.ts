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
  maxTimeout?: number;
  onPhaseChange?: (phase: SplashAnimationPhase) => void;
  onProgressChange?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  onTimeout?: () => void;
}

// 默认配置
const DEFAULT_CONFIG: Required<SplashAnimationConfig> = {
  duration: 3000,
  showTime: 1500,
  progressStep: 2,
  autoHide: true,
  maxTimeout: 12000,
  onPhaseChange: () => {},
  onProgressChange: () => {},
  onComplete: () => {},
  onError: () => {},
  onTimeout: () => {}
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
    maxTimeout,
    onPhaseChange,
    onProgressChange,
    onComplete,
    onError,
    onTimeout
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
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // 关键修复：使用 ref 保存回调函数，避免依赖变化
  const callbacksRef = useRef({
    onPhaseChange,
    onProgressChange,
    onComplete,
    onError,
    onTimeout
  });

  // 更新回调引用（但不触发重新渲染）
  useEffect(() => {
    callbacksRef.current = {
      onPhaseChange,
      onProgressChange,
      onComplete,
      onError,
      onTimeout
    };
  });

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
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, []);

  // 手动隐藏动画
  const hide = useCallback(() => {
    try {
      clearTimers();
      safeSetState(prev => {
        // 只有在未隐藏状态下才执行隐藏操作
        if (prev.phase !== SplashAnimationPhase.HIDDEN) {
          const newState = {
            ...prev,
            phase: SplashAnimationPhase.HIDDEN,
            isVisible: false
          };
          callbacksRef.current.onPhaseChange(newState.phase);
          setTimeout(() => {
            callbacksRef.current.onComplete();
          }, 0);
          return newState;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error hiding splash animation:', error);
      callbacksRef.current.onError(error as Error);
    }
  }, [clearTimers, safeSetState]);

  // 手动显示动画
  const show = useCallback(() => {
    try {
      clearTimers();
      safeSetState(prev => {
        const newState = {
          ...prev,
          phase: SplashAnimationPhase.LOADING,
          progress: 0,
          isVisible: true,
          hasError: false
        };
        callbacksRef.current.onPhaseChange(newState.phase);
        return newState;
      });
    } catch (error) {
      console.error('Error showing splash animation:', error);
      callbacksRef.current.onError(error as Error);
    }
  }, [clearTimers, safeSetState]);

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
      callbacksRef.current.onError(error as Error);
    }
  }, [clearTimers, safeSetState]);

  // 设置错误状态
  const setError = useCallback((error: Error) => {
    clearTimers();
    safeSetState(prev => ({
      ...prev,
      hasError: true,
      isVisible: false
    }));
    callbacksRef.current.onError(error);
  }, [clearTimers, safeSetState]);

  // 强制超时处理
  const forceTimeout = useCallback(() => {
    console.warn(`Splash animation timed out after ${maxTimeout}ms`);
    callbacksRef.current.onTimeout();
    hide();
  }, [maxTimeout, hide]);

  // 主要动画逻辑
  useEffect(() => {
    if (!animationState.isVisible || animationState.hasError) {
      return;
    }

    try {
      // 设置最大超时保护
      timeoutTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          forceTimeout();
        }
      }, maxTimeout);

      // 进度更新逻辑
      const progressUpdateInterval = Math.max(duration / (100 / progressStep), 16);
      
      progressIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current) return;
        
        safeSetState(prev => {
          const newProgress = Math.min(prev.progress + progressStep, 100);
          const newPhase = newProgress === 100 ? SplashAnimationPhase.LOADED : prev.phase;
          
          // 只在有实际变化时才执行回调
          if (newProgress !== prev.progress || newPhase !== prev.phase) {
            try {
              if (newProgress !== prev.progress) {
                callbacksRef.current.onProgressChange(newProgress);
              }
              if (newPhase !== prev.phase) {
                callbacksRef.current.onPhaseChange(newPhase);
              }
            } catch (callbackError) {
              console.error('Error in animation callbacks:', callbackError);
            }
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
        const totalDuration = duration + showTime;
        hideTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            hide();
          }
        }, totalDuration);
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
    maxTimeout,
    hide,
    setError,
    safeSetState,
    clearTimers,
    forceTimeout
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
    ...animationState,
    
    isLoading: animationState.phase === SplashAnimationPhase.LOADING,
    isLoaded: animationState.phase === SplashAnimationPhase.LOADED,
    isHidden: animationState.phase === SplashAnimationPhase.HIDDEN,
    isComplete: animationState.progress === 100,
    
    hide,
    show,
    reset,
    setError,
    forceTimeout,
    
    config: {
      duration,
      showTime,
      progressStep,
      autoHide,
      maxTimeout
    }
  };
};

export default useSplashAnimation; 
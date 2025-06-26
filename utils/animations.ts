/**
 * 统一动画配置文件
 * 提供可复用的Framer Motion动画变体和配置
 */

import React from 'react';
import { Variants, Transition } from 'framer-motion';

// 基础动画时长
export const ANIMATION_DURATIONS = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
} as const;

// 缓动函数
export const EASING = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: { type: 'spring', stiffness: 300, damping: 25 },
} as const;

// 卡片动画变体
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut,
    },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: EASING.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: EASING.easeOut,
    },
  },
};

// 图片动画变体
export const imageVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.1,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut,
    },
  },
};

// 模态框动画变体
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.bounce,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 20,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: EASING.easeIn,
    },
  },
};

// 背景遮罩动画变体
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: EASING.easeIn,
    },
  },
};

// 列表项错步动画
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut,
    },
  },
};

// 淡入动画变体
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut,
    },
  },
};

// 滑入动画变体
export const slideInVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut,
    },
  },
};

// Toast消息动画变体
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.bounce,
    },
  },
  exit: {
    opacity: 0,
    y: 50,
    scale: 0.9,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: EASING.easeIn,
    },
  },
};

// 震动动画变体（用于错误提示）
export const shakeVariants: Variants = {
  shake: {
    x: [-3, 3, -3, 3, 0],
    transition: {
      duration: 0.4,
      ease: EASING.easeOut,
    },
  },
};

// 按钮波纹效果变体
export const rippleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0.6,
  },
  animate: {
    scale: 2,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: EASING.easeOut,
    },
  },
};

// 检查是否应该减少动画
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// 获取动画配置（考虑用户偏好）
export const getAnimationConfig = (variants: Variants): Variants => {
  if (shouldReduceMotion()) {
    // 如果用户偏好减少动画，返回简化版本
    const reducedVariants: Variants = {};
    Object.keys(variants).forEach(key => {
      reducedVariants[key] = {
        ...variants[key],
        transition: { duration: 0.01 },
      };
    });
    return reducedVariants;
  }
  return variants;
};

// 通用过渡配置
export const defaultTransition: Transition = {
  duration: ANIMATION_DURATIONS.normal,
  ease: EASING.easeOut,
};

// 弹性过渡配置
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

// 快速过渡配置
export const fastTransition: Transition = {
  duration: ANIMATION_DURATIONS.fast,
  ease: EASING.easeOut,
};

// GPU加速动画变体（用于性能优化）
export const gpuAcceleratedVariants: Variants = {
  hidden: {
    opacity: 0,
    transform: 'translateZ(0)', // 强制GPU加速
  },
  visible: {
    opacity: 1,
    transform: 'translateZ(0)',
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut,
    },
  },
};

// 针对大列表优化的动画变体
export const largeListVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATIONS.fast, // 使用更快的动画
      ease: EASING.easeOut,
    },
  },
};

// 高性能错步动画（减少延迟）
export const performantStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.02, // 减少错步延迟
      delayChildren: 0.05,   // 减少初始延迟
    },
  },
};

// 检查设备性能并返回相应的动画配置
export const getPerformanceOptimizedConfig = (variants: Variants): Variants => {
  if (typeof window === 'undefined') return variants;
  
  // 检查设备性能指标
  const isLowEndDevice = () => {
    // 检查硬件并发数（CPU核心数指示器）
    const cores = navigator.hardwareConcurrency || 4;
    
    // 检查内存（如果可用）
    const memory = (navigator as any).deviceMemory || 4;
    
    // 检查连接类型（如果可用）
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && 
      (connection.effectiveType === 'slow-2g' || 
       connection.effectiveType === '2g' || 
       connection.saveData);
    
    return cores <= 2 || memory <= 2 || isSlowConnection;
  };
  
  if (shouldReduceMotion()) {
    return getAnimationConfig(variants);
  }
  
  if (isLowEndDevice()) {
    // 为低端设备优化动画
    const optimizedVariants: Variants = {};
    Object.keys(variants).forEach(key => {
      const variant = variants[key];
      if (typeof variant === 'object' && variant.transition) {
        const transition = variant.transition as any;
        optimizedVariants[key] = {
          ...variant,
          transition: {
            ...transition,
            duration: Math.min(transition.duration || ANIMATION_DURATIONS.normal, ANIMATION_DURATIONS.fast),
          },
        };
      } else {
        optimizedVariants[key] = variant;
      }
    });
    return optimizedVariants;
  }
  
  return variants;
};

// 预设的性能级别
export const PERFORMANCE_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium', 
  LOW: 'low',
} as const;

type PerformanceLevel = typeof PERFORMANCE_LEVELS[keyof typeof PERFORMANCE_LEVELS];

// 根据性能级别获取动画配置
export const getConfigByPerformanceLevel = (
  variants: Variants, 
  level: PerformanceLevel = PERFORMANCE_LEVELS.HIGH
): Variants => {
  if (shouldReduceMotion()) {
    return getAnimationConfig(variants);
  }
  
  switch (level) {
    case PERFORMANCE_LEVELS.LOW:
      return largeListVariants;
    case PERFORMANCE_LEVELS.MEDIUM:
      const mediumVariants: Variants = {};
      Object.keys(variants).forEach(key => {
        const variant = variants[key];
        if (typeof variant === 'object' && variant.transition) {
          const transition = variant.transition as any;
          mediumVariants[key] = {
            ...variant,
            transition: {
              ...transition,
              duration: (transition.duration || ANIMATION_DURATIONS.normal) * 0.7,
            },
          };
        } else {
          mediumVariants[key] = variant;
        }
      });
      return mediumVariants;
    case PERFORMANCE_LEVELS.HIGH:
    default:
      return variants;
  }
};

// 用于优化动画的工具函数
export const withPerformanceOptimization = <T extends React.ComponentType<any>>(
  Component: T,
  animationProps?: {
    enableGPUAcceleration?: boolean;
    performanceLevel?: PerformanceLevel;
  }
) => {
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    const optimizedProps = {
      ...props,
      style: {
        ...props.style,
        ...(animationProps?.enableGPUAcceleration && {
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }),
      },
    };
    
    return React.createElement(Component, { ...optimizedProps, ref });
  });
};

// 内存管理：清理未使用的动画
export const cleanupAnimations = () => {
  if (typeof window === 'undefined') return;
  
  // 强制垃圾回收（如果浏览器支持）
  if ('gc' in window && typeof window.gc === 'function') {
    window.gc();
  }
  
  // 清理可能的内存泄漏
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    // 移除可能的事件监听器
    const clonedElement = element.cloneNode(true);
    element.parentNode?.replaceChild(clonedElement, element);
  });
}; 
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { getAnimationConfig, fadeInVariants, ANIMATION_DURATIONS, EASING } from '../utils/animations';

// 替换 fadeIn CSS 动画
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = ANIMATION_DURATIONS.normal,
  className = '' 
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        delay, 
        duration, 
        ease: EASING.easeOut 
      }}
    >
      {children}
    </motion.div>
  );
};

// 替换 fadeInUp CSS 动画
interface FadeInUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export const FadeInUp: React.FC<FadeInUpProps> = ({ 
  children, 
  delay = 0, 
  duration = ANIMATION_DURATIONS.normal,
  distance = 10,
  className = '' 
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay, 
        duration, 
        ease: EASING.easeOut 
      }}
    >
      {children}
    </motion.div>
  );
};

// 增强的骨架屏动画组件
interface ShimmerProps {
  className?: string;
  variant?: 'default' | 'galaxy' | 'arcade';
  children?: React.ReactNode;
}

export const Shimmer: React.FC<ShimmerProps> = ({ 
  className = '', 
  variant = 'default',
  children 
}) => {
  const { theme } = useTheme();
  
  const shimmerVariants: Variants = {
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        duration: variant === 'arcade' ? 1.8 : variant === 'galaxy' ? 2.2 : 2,
        ease: variant === 'arcade' ? 'steps(10, end)' : 'linear',
        repeat: Infinity,
      },
    },
  };

  const getShimmerBackground = () => {
    const isDark = theme.name.includes('dark') || document.documentElement.classList.contains('dark');
    
    switch (variant) {
      case 'galaxy':
        return isDark
          ? 'linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.1) 50%, transparent 100%)'
          : 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.15) 50%, transparent 100%)';
      case 'arcade':
        return isDark
          ? 'linear-gradient(90deg, transparent 0%, rgba(250,204,21,0.15) 20%, transparent 20%, transparent 40%, rgba(220,38,38,0.15) 60%, transparent 60%, transparent 80%, rgba(37,99,235,0.15) 100%)'
          : 'linear-gradient(90deg, transparent 0%, rgba(255,255,0,0.2) 20%, transparent 20%, transparent 40%, rgba(239,68,68,0.2) 60%, transparent 60%, transparent 80%, rgba(59,130,246,0.2) 100%)';
      default:
        return isDark
          ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
          : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)';
    }
  };

  return (
    <motion.div
      className={className}
      variants={getAnimationConfig(shimmerVariants)}
      animate="animate"
      style={{
        background: getShimmerBackground(),
        backgroundSize: '200% 100%',
      }}
    >
      {children}
    </motion.div>
  );
};

// 替换 modal-transition CSS 的增强模态框过渡
interface EnhancedModalTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

export const EnhancedModalTransition: React.FC<EnhancedModalTransitionProps> = ({
  children,
  isOpen,
  className = ''
}) => {
  const modalVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.9,
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

  return (
    <motion.div
      className={className}
      variants={getAnimationConfig(modalVariants)}
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

// 脉冲动画组件（替换 animate-pulse）
interface PulseProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  duration?: number;
}

export const Pulse: React.FC<PulseProps> = ({ 
  children, 
  className = '',
  intensity = 0.7,
  duration = 2
}) => {
  const pulseVariants: Variants = {
    pulse: {
      opacity: [1, intensity, 1],
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={getAnimationConfig(pulseVariants)}
      animate="pulse"
    >
      {children}
    </motion.div>
  );
};

// 通用缓动过渡组件
interface EaseTransitionProps {
  children: React.ReactNode;
  className?: string;
  from: Record<string, any>;
  to: Record<string, any>;
  duration?: number;
  easing?: string | number[];
}

export const EaseTransition: React.FC<EaseTransitionProps> = ({
  children,
  className = '',
  from,
  to,
  duration = ANIMATION_DURATIONS.normal,
  easing = EASING.easeOut
}) => {
  return (
    <motion.div
      className={className}
      initial={from}
      animate={to}
      transition={{ duration, ease: easing }}
    >
      {children}
    </motion.div>
  );
};

// 组合动画包装器
interface AnimationWrapperProps {
  children: React.ReactNode;
  type: 'fadeIn' | 'fadeInUp' | 'shimmer' | 'pulse';
  className?: string;
  delay?: number;
  duration?: number;
  [key: string]: any;
}

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  type,
  className = '',
  delay = 0,
  duration = ANIMATION_DURATIONS.normal,
  ...props
}) => {
  switch (type) {
    case 'fadeIn':
      return (
        <FadeIn className={className} delay={delay} duration={duration} {...props}>
          {children}
        </FadeIn>
      );
    case 'fadeInUp':
      return (
        <FadeInUp className={className} delay={delay} duration={duration} {...props}>
          {children}
        </FadeInUp>
      );
    case 'shimmer':
      return (
        <Shimmer className={className} {...props}>
          {children}
        </Shimmer>
      );
    case 'pulse':
      return (
        <Pulse className={className} duration={duration} {...props}>
          {children}
        </Pulse>
      );
    default:
      return <div className={className}>{children}</div>;
  }
}; 
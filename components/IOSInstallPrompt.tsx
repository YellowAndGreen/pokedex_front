import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { XMarkIcon } from './icons';

// iOS设备检测函数
const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// 检测是否在Safari中
const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// 检测是否已经安装为PWA
const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

interface IOSInstallPromptProps {
  onClose?: () => void;
}

const IOSInstallPrompt: React.FC<IOSInstallPromptProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 检查是否需要显示iOS安装提示
    const checkShowPrompt = () => {
      const isIOSDevice = isIOS();
      const isInSafari = isSafari();
      const isAlreadyInstalled = isPWAInstalled();
      const hasClosedPrompt = localStorage.getItem('ios-install-prompt-closed');

      // 仅在iOS Safari中且未安装且用户未手动关闭时显示
      if (isIOSDevice && isInSafari && !isAlreadyInstalled && !hasClosedPrompt) {
        // 延迟3秒显示，避免干扰用户初始体验
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    checkShowPrompt();

    // 监听页面可见性变化，防止在后台时显示
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowPrompt(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
    // 记住用户已关闭提示，避免重复显示
    localStorage.setItem('ios-install-prompt-closed', 'true');
    onClose?.();
  };

  const handleInstallLater = () => {
    setShowPrompt(false);
    // 30分钟后可以再次显示
    setTimeout(() => {
      localStorage.removeItem('ios-install-prompt-closed');
    }, 30 * 60 * 1000);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div 
        className={`
          ${theme.modal.bg} ${theme.modal.rounded} ${theme.modal.shadow}
          w-full max-w-sm mx-auto transform transition-all duration-300 ease-out
          animate-fadeInUp p-6 relative
        `}
        role="dialog"
        aria-labelledby="ios-install-title"
        aria-describedby="ios-install-description"
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className={`
            absolute top-4 right-4 p-1 rounded-full
            ${theme.input.text} hover:${theme.input.bg}
            transition-colors duration-150
          `}
          aria-label="关闭安装提示"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* 应用图标 */}
        <div className="flex justify-center mb-4">
          <img 
            src="/icons/icon-144x144.png" 
            alt="Pokedex IM" 
            className="w-16 h-16 rounded-2xl shadow-lg"
          />
        </div>

        {/* 标题 */}
        <h3 
          id="ios-install-title"
          className={`text-lg font-semibold text-center ${theme.input.text} mb-2`}
        >
          安装到主屏幕
        </h3>

        {/* 描述 */}
        <p 
          id="ios-install-description"
          className={`text-sm ${theme.input.mutedText} text-center mb-6 leading-relaxed`}
        >
          将Pokedex图鉴添加到主屏幕，享受更好的使用体验！
        </p>

        {/* 安装步骤 */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className={`
              w-8 h-8 rounded-full ${theme.primary.bg} 
              flex items-center justify-center text-white text-sm font-bold
            `}>
              1
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${theme.input.text}`}>
                点击Safari底部的
              </span>
              <div className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                📤 分享
              </div>
              <span className={`text-sm ${theme.input.text}`}>按钮</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`
              w-8 h-8 rounded-full ${theme.primary.bg} 
              flex items-center justify-center text-white text-sm font-bold
            `}>
              2
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${theme.input.text}`}>
                选择
              </span>
              <div className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-xs">
                📱 添加到主屏幕
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`
              w-8 h-8 rounded-full ${theme.primary.bg} 
              flex items-center justify-center text-white text-sm font-bold
            `}>
              3
            </div>
            <span className={`text-sm ${theme.input.text}`}>
              点击右上角的"添加"按钮完成安装
            </span>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex space-x-3">
          <button
            onClick={handleInstallLater}
            className={`
              flex-1 py-2 px-4 rounded-lg border-2 ${theme.input.border}
              ${theme.input.text} ${theme.input.hoverBg}
              transition-colors duration-150 text-sm font-medium
            `}
          >
            稍后安装
          </button>
          <button
            onClick={handleClose}
            className={`
              flex-1 py-2 px-4 rounded-lg ${theme.primary.bg} 
              text-white hover:opacity-90
              transition-opacity duration-150 text-sm font-medium
            `}
          >
            我知道了
          </button>
        </div>

        {/* 提示文字 */}
        <p className={`text-xs ${theme.input.mutedText} text-center mt-3`}>
          安装后可离线使用，加载更快更流畅
        </p>
      </div>
    </div>
  );
};

export default IOSInstallPrompt; 
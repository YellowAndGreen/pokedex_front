/**
 * 环境检测工具函数
 * 用于判断应用运行在何种环境中
 */

/**
 * 检查是否在Electron环境中运行
 * @returns {boolean} 如果在Electron中运行返回true
 */
export const isElectron = (): boolean => {
  // 检查预加载脚本暴露的electronAPI
  return !!(window as any).electronAPI;
};

// PWA相关功能已完全移除

/**
 * 获取运行环境信息
 * @returns {string} 环境类型描述
 */
export const getEnvironmentType = (): string => {
  if (isElectron()) {
    return 'electron';
  } else {
    return 'web';
  }
};

/**
 * 检查是否支持原生通知
 * @returns {boolean} 如果支持通知返回true
 */
export const supportsNotifications = (): boolean => {
  if (isElectron()) {
    // Electron环境下通过IPC支持原生通知
    return true;
  } else {
    // Web环境下检查Notification API
    return 'Notification' in window;
  }
};

/**
 * 获取存储API类型
 * @returns {string} 存储类型描述
 */
export const getStorageType = (): string => {
  if (isElectron()) {
    return 'electron-store';
  } else {
    return 'localStorage';
  }
};

/**
 * 解析静态资源路径
 * 在Electron环境中使用相对路径，在Web环境中使用绝对路径
 * @param {string} resourcePath - 资源路径，例如 '/data/file.json'
 * @returns {string} 解析后的路径
 */
export const resolveResourcePath = (resourcePath: string): string => {
  if (isElectron()) {
    // 在Electron中，移除开头的斜杠，使用相对路径
    return resourcePath.startsWith('/') ? resourcePath.substring(1) : resourcePath;
  } else {
    // 在Web环境中，保持绝对路径
    return resourcePath;
  }
}; 
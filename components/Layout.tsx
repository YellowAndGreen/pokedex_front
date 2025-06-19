
import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme, themeSettings } from '../contexts/ThemeContext';
import { ChevronDownIcon, StarIcon as InstallIcon } from './icons'; // Using StarIcon as a placeholder for Install
import CategorySearch from './CategorySearch';
import { useAuth } from '../contexts/AuthContext';
import { isElectron, supportsNotifications } from '../utils/environment';

const ThemeSwitcher: React.FC = () => {
  const { themeName, setThemeName, theme, isDarkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // PWA相关功能已完全移除


  const availableThemes = Object.entries(themeSettings).map(([key, value]) => ({
    id: key as keyof typeof themeSettings,
    name: value.name,
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={switcherRef} className="h-10 flex items-center justify-center relative"> 
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center p-2 rounded-md ${theme.iconButton} ${theme.button.transition} hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.input.focusRing.replace('focus:ring-2', '').trim()}`}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="Select theme or install app"
        >
          <span className="sr-only">Select Theme</span>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
          <ChevronDownIcon className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div 
            className={`absolute right-0 mt-2 w-48 sm:w-56 ${theme.dropdown.bg} ${theme.modal.rounded} ${theme.modal.shadow} z-50 py-1 animate-fadeInUp top-full`} 
            style={{animationDuration: '0.2s'}}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="theme-options-menu"
          >
            {/* PWA安装按钮已移除 */}
            {availableThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setThemeName(t.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm transition-colors duration-150
                  ${themeName === t.id 
                    ? `${theme.dropdown.itemActiveText} ${theme.dropdown.itemActiveBg}` 
                    : `${theme.dropdown.itemText} ${theme.dropdown.itemHoverText} ${theme.dropdown.itemHoverBg}`
                  }
                `}
                role="menuitem"
              >
                {t.name} {themeName === t.id && '✓'}
              </button>
            ))}
          </div>
        )}
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth(); // Use AuthContext
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleFooterAction = () => {
    if (isAuthenticated) {
      logout();
    } else {
      // Navigation to login is handled by Link component directly
    }
  };

  useEffect(() => {
    // 简化通知权限处理，只保留Electron环境支持
    if (supportsNotifications() && isElectron()) {
      console.log('Notification support available in Electron environment');
      // TODO: 可以在这里通过IPC向主进程请求通知权限
    }
  }, []);


  return (
    <div className={`min-h-screen flex flex-col ${theme.text} transition-colors duration-300`}>
      <header className={`${theme.headerBg} ${theme.headerText} shadow-md sticky top-0 z-40 transition-colors duration-300 h-12`}>
        <div className="container mx-auto px-2 sm:px-4 h-full flex justify-between items-center"> 
          <Link 
            to="/" 
            className={`text-xl sm:text-2xl font-semibold ${theme.brandColor} transition-opacity hover:opacity-80 flex-shrink-0`}
          >
            Pokedex
          </Link>
          
          <nav className="flex items-center flex-shrink-0">
            <div className={`flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 transition-opacity duration-300 ${isSearchActive ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <NavLink 
                to="/" 
                className={({ isActive }) => `${theme.navLink} ${isActive ? theme.navLinkActive : ''} px-1.5 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm whitespace-nowrap`}
              >
                Categories
              </NavLink>
              <NavLink 
                to="/species" 
                className={({ isActive }) => `${theme.navLink} ${isActive ? theme.navLinkActive : ''} px-1.5 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm whitespace-nowrap`}
              >
                Analytics
              </NavLink>
              
              <CategorySearch 
                isExpanded={isSearchActive}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setIsSearchActive(false)}
              />
              
              <ThemeSwitcher />
            </div>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div key={location.pathname} className="animate-fadeInUp" style={{animationDuration: '0.4s'}}>
            {children}
        </div>
      </main>

      <footer className={`${theme.headerBg} text-center py-3 sm:py-4 border-t ${theme.name === 'Modern Clean Pro' ? 'border-slate-200 dark:border-slate-700/50' : (theme.name === 'Neon Galaxy' ? 'border-cyan-500/20 dark:border-cyan-400/20' : theme.name === 'Arcade Flash' ? 'border-black dark:border-yellow-400' : 'border-gray-200 dark:border-gray-700')} transition-colors duration-300`}>
        {isAuthenticated ? (
          <button
            onClick={handleFooterAction}
            className={`text-xs sm:text-sm ${theme.footerText} hover:underline ${theme.brandColor} focus:outline-none`}
            aria-label="Logout"
          >
            &copy; 2025 Made With <span className={`${theme.footerHeartColor} transition-colors duration-300`}>❤</span> By 黄不盈. All rights reserved.
          </button>
        ) : (
          <Link 
            to="/login" 
            onClick={handleFooterAction} // Still call, though it does nothing if not authenticated
            className={`text-xs sm:text-sm ${theme.footerText} hover:underline ${theme.brandColor}`}
            aria-label="Login or Register"
          >
            &copy; 2025 Made With <span className={`${theme.footerHeartColor} transition-colors duration-300`}>❤</span> By 黄不盈. All rights reserved.
          </Link>
        )}
      </footer>
    </div>
  );
};

export default Layout;

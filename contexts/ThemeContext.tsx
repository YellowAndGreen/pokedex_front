/// <reference path="../electron.d.ts" />
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

export type ThemeName = 'modern' | 'nature' | 'neonGalaxy' | 'arcadeFlash' | 'retroTechDark';

export interface ThemeStyling {
  name: string; // Display name
  bg: string;
  text: string;
  headerBg: string;
  headerText: string;
  navLink: string;
  navLinkActive: string;
  brandColor: string;
  button: {
    primary: string;
    primaryText: string;
    secondary: string;
    secondaryText: string;
    danger: string;
    dangerText: string;
    transition: string;
  };
  card: {
    bg: string;
    text: string;
    secondaryText: string;
    shadow: string;
    hoverShadow: string;
    rounded: string;
    border?: string;
    titleHover: string;
    transition: string;
  };
  modal: {
    bg: string;
    titleText: string;
    shadow: string;
    rounded: string;
  };
  input: {
    bg: string;
    border: string;
    focusRing: string;
    focusBorder: string;
    text: string;
    placeholderText: string;
    transition: string;
  };
  iconButton: string;
  bodyBg: string;
  footerText: string; 
  footerHeartColor: string; // Added new property
  dropdown: { 
    bg: string;
    itemText: string;
    itemHoverBg: string;
    itemHoverText: string;
    itemActiveBg: string;
    itemActiveText: string;
  };
  skeletonBase: string;
  skeletonHighlight: string;
}

export const themeSettings: Record<ThemeName, ThemeStyling> = {
  modern: {
    name: 'Modern Clean Pro',
    bg: 'bg-slate-100 dark:bg-slate-950',
    text: 'text-slate-800 dark:text-slate-200',
    headerBg: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md',
    headerText: 'text-slate-900 dark:text-slate-100',
    navLink: 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200',
    navLinkActive: 'text-blue-600 dark:text-blue-400 font-semibold',
    brandColor: 'text-blue-600 dark:text-blue-400',
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-500',
      primaryText: 'text-white',
      secondary: 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 focus-visible:outline-slate-500',
      secondaryText: 'text-slate-800 dark:text-slate-100',
      danger: 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-500',
      dangerText: 'text-white',
      transition: 'transition-all duration-200 ease-in-out transform active:scale-95',
    },
    card: {
      bg: 'bg-white dark:bg-slate-800/90',
      text: 'text-slate-800 dark:text-slate-100',
      secondaryText: 'text-slate-600 dark:text-slate-300',
      shadow: 'shadow-md dark:shadow-slate-900/50',
      hoverShadow: 'hover:shadow-xl dark:hover:shadow-slate-900/70',
      rounded: 'rounded-xl',
      border: 'border border-transparent',
      titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
      transition: 'transition-all duration-300 ease-in-out',
    },
    modal: {
      bg: 'bg-white dark:bg-slate-800',
      titleText: 'text-slate-900 dark:text-slate-100',
      shadow: 'shadow-2xl',
      rounded: 'rounded-lg',
    },
    input: {
      bg: 'bg-slate-50 dark:bg-slate-700/60',
      border: 'border-slate-300 dark:border-slate-600',
      focusRing: 'focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50',
      focusBorder: 'focus:border-blue-500 dark:focus:border-blue-400',
      text: 'text-slate-900 dark:text-slate-50',
      placeholderText: 'placeholder-slate-400 dark:placeholder-slate-500',
      transition: 'transition-colors duration-200 ease-in-out',
    },
    iconButton: 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200',
    bodyBg: 'bg-slate-100 dark:bg-slate-950',
    footerText: 'text-slate-500 dark:text-slate-400',
    footerHeartColor: 'text-blue-600 dark:text-blue-400',
    dropdown: {
      bg: 'bg-white dark:bg-slate-800',
      itemText: 'text-slate-700 dark:text-slate-300',
      itemHoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-700',
      itemHoverText: 'hover:text-blue-600 dark:hover:text-blue-400',
      itemActiveBg: 'bg-blue-50 dark:bg-blue-900/50',
      itemActiveText: 'text-blue-600 dark:text-blue-400 font-medium',
    },
    skeletonBase: 'bg-slate-200 dark:bg-slate-700/80',
    skeletonHighlight: 'shimmer-gradient',
  },
  nature: {
    name: 'Nature Inspired',
    bg: 'bg-lime-50 dark:bg-green-950',
    text: 'text-green-900 dark:text-lime-100',
    headerBg: 'bg-lime-100/80 dark:bg-green-900/80 backdrop-blur-md',
    headerText: 'text-green-800 dark:text-lime-50',
    navLink: 'text-green-700 dark:text-lime-200 hover:text-green-900 dark:hover:text-lime-50 transition-colors duration-200',
    navLinkActive: 'text-green-900 dark:text-lime-50 font-semibold',
    brandColor: 'text-green-700 dark:text-lime-300',
    button: {
      primary: 'bg-green-600 hover:bg-green-700 focus-visible:outline-green-600',
      primaryText: 'text-white',
      secondary: 'bg-lime-200 hover:bg-lime-300 dark:bg-green-800 dark:hover:bg-green-700 focus-visible:outline-lime-400',
      secondaryText: 'text-green-800 dark:text-lime-100',
      danger: 'bg-orange-600 hover:bg-orange-700 focus-visible:outline-orange-600',
      dangerText: 'text-white',
      transition: 'transition-all duration-200 ease-in-out transform active:scale-95',
    },
    card: {
      bg: 'bg-white dark:bg-green-800/90',
      text: 'text-green-900 dark:text-lime-100',
      secondaryText: 'text-green-700 dark:text-lime-300',
      shadow: 'shadow-md',
      hoverShadow: 'hover:shadow-lg',
      rounded: 'rounded-xl',
      border: 'border border-lime-200 dark:border-green-700',
      titleHover: 'group-hover:text-green-600 dark:group-hover:text-lime-300',
      transition: 'transition-all duration-300 ease-in-out',
    },
    modal: {
      bg: 'bg-lime-50 dark:bg-green-800',
      titleText: 'text-green-800 dark:text-lime-50',
      shadow: 'shadow-lg',
      rounded: 'rounded-xl',
    },
    input: {
      bg: 'bg-white dark:bg-green-700/50',
      border: 'border-lime-300 dark:border-green-600',
      focusRing: 'focus:ring-2 focus:ring-green-500/50 dark:focus:ring-lime-400/50',
      focusBorder: 'focus:border-green-500 dark:focus:border-lime-400',
      text: 'text-green-900 dark:text-lime-50',
      placeholderText: 'placeholder-green-400 dark:placeholder-lime-500',
      transition: 'transition-colors duration-200 ease-in-out',
    },
    iconButton: 'text-green-600 hover:text-green-800 dark:text-lime-300 dark:hover:text-lime-100 transition-colors duration-200',
    bodyBg: 'bg-lime-50 dark:bg-green-950',
    footerText: 'text-green-700 dark:text-lime-300',
    footerHeartColor: 'text-green-600 dark:text-lime-400',
    dropdown: {
      bg: 'bg-lime-50 dark:bg-green-800',
      itemText: 'text-green-700 dark:text-lime-200',
      itemHoverBg: 'hover:bg-lime-100 dark:hover:bg-green-700',
      itemHoverText: 'hover:text-green-900 dark:hover:text-lime-50',
      itemActiveBg: 'bg-lime-200 dark:bg-green-900/60',
      itemActiveText: 'text-green-900 dark:text-lime-50 font-medium',
    },
    skeletonBase: 'bg-lime-200 dark:bg-green-700/80',
    skeletonHighlight: 'shimmer-gradient',
  },
  neonGalaxy: {
    name: 'Neon Galaxy',
    bg: 'bg-indigo-950 dark:bg-black',
    text: 'text-indigo-100 dark:text-gray-200',
    headerBg: 'bg-indigo-900/80 dark:bg-black/80 backdrop-blur-md',
    headerText: 'text-indigo-50 dark:text-gray-100',
    navLink: 'text-indigo-300 dark:text-indigo-400 hover:text-cyan-300 dark:hover:text-cyan-200 transition-colors duration-200',
    navLinkActive: 'text-cyan-400 dark:text-cyan-300 font-semibold',
    brandColor: 'text-cyan-400 dark:text-cyan-300',
    button: {
      primary: 'bg-cyan-500 hover:bg-cyan-400 focus-visible:outline-cyan-400',
      primaryText: 'text-black',
      secondary: 'bg-indigo-700 hover:bg-indigo-600 dark:bg-indigo-800 dark:hover:bg-indigo-700 focus-visible:outline-indigo-500',
      secondaryText: 'text-indigo-100 dark:text-indigo-200',
      danger: 'bg-pink-600 hover:bg-pink-500 focus-visible:outline-pink-500',
      dangerText: 'text-white',
      transition: 'transition-all duration-200 ease-in-out transform active:scale-95 hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] dark:hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]',
    },
    card: {
      bg: 'bg-indigo-900/90 dark:bg-gray-950/70',
      text: 'text-indigo-100 dark:text-gray-100',
      secondaryText: 'text-indigo-300 dark:text-gray-400',
      shadow: 'shadow-xl shadow-indigo-950/50 dark:shadow-black/50',
      hoverShadow: 'hover:shadow-2xl hover:shadow-cyan-700/30 dark:hover:shadow-cyan-500/30',
      rounded: 'rounded-lg',
      border: 'border border-cyan-500/30 dark:border-cyan-400/30',
      titleHover: 'group-hover:text-cyan-300 dark:group-hover:text-cyan-200',
      transition: 'transition-all duration-300 ease-in-out',
    },
    modal: {
      bg: 'bg-indigo-900 dark:bg-gray-900',
      titleText: 'text-indigo-50 dark:text-gray-50',
      shadow: 'shadow-2xl shadow-cyan-900/50',
      rounded: 'rounded-lg',
    },
    input: {
      bg: 'bg-indigo-800/70 dark:bg-gray-800/60',
      border: 'border-indigo-600 dark:border-gray-700',
      focusRing: 'focus:ring-2 focus:ring-cyan-400/50 dark:focus:ring-cyan-300/50',
      focusBorder: 'focus:border-cyan-400 dark:focus:border-cyan-300',
      text: 'text-indigo-50 dark:text-gray-50',
      placeholderText: 'placeholder-indigo-400 dark:placeholder-gray-500',
      transition: 'transition-colors duration-200 ease-in-out',
    },
    iconButton: 'text-indigo-300 hover:text-cyan-400 dark:text-indigo-400 dark:hover:text-cyan-300 transition-colors duration-200',
    bodyBg: 'bg-indigo-950 dark:bg-black',
    footerText: 'text-indigo-400 dark:text-gray-500',
    footerHeartColor: 'text-cyan-400 dark:text-cyan-300',
    dropdown: {
      bg: 'bg-indigo-800 dark:bg-gray-900',
      itemText: 'text-indigo-200 dark:text-gray-300',
      itemHoverBg: 'hover:bg-indigo-700 dark:hover:bg-gray-800',
      itemHoverText: 'hover:text-cyan-300 dark:hover:text-cyan-200',
      itemActiveBg: 'bg-cyan-500/20 dark:bg-cyan-400/20',
      itemActiveText: 'text-cyan-300 dark:text-cyan-200 font-medium',
    },
    skeletonBase: 'bg-indigo-800 dark:bg-gray-800',
    skeletonHighlight: 'shimmer-gradient-galaxy',
  },
  arcadeFlash: {
    name: 'Arcade Flash',
    bg: 'bg-slate-50 dark:bg-zinc-900',
    text: 'text-black dark:text-white',
    headerBg: 'bg-yellow-400 dark:bg-yellow-500',
    headerText: 'text-black dark:text-black',
    navLink: 'text-black dark:text-black hover:bg-yellow-500 dark:hover:bg-yellow-600 transition-all duration-150',
    navLinkActive: 'text-black dark:text-black font-bold bg-red-500 dark:bg-red-600 underline decoration-blue-500 decoration-2 underline-offset-2',
    brandColor: 'text-black dark:text-black',
    button: {
      primary: 'bg-red-500 hover:bg-red-600 focus-visible:outline-red-600 border-2 border-black dark:border-red-300',
      primaryText: 'text-white font-bold',
      secondary: 'bg-blue-500 hover:bg-blue-600 focus-visible:outline-blue-600 border-2 border-black dark:border-blue-300',
      secondaryText: 'text-white font-bold',
      danger: 'bg-orange-500 hover:bg-orange-600 focus-visible:outline-orange-600 border-2 border-black dark:border-orange-300',
      dangerText: 'text-black font-bold',
      transition: 'transition-all duration-150 ease-out transform active:translate-y-0.5 active:translate-x-0.5',
    },
    card: {
      bg: 'bg-white dark:bg-zinc-800',
      text: 'text-black dark:text-white',
      secondaryText: 'text-slate-600 dark:text-zinc-400',
      shadow: 'shadow-[2px_2px_0px_#A0A0A0] dark:shadow-[2px_2px_0px_#4A4A4A]',
      hoverShadow: 'hover:shadow-[4px_4px_0px_#000000] dark:hover:shadow-[4px_4px_0px_#FFFF00]',
      rounded: 'rounded', // Sharp corners
      border: 'border-2 border-black dark:border-zinc-500',
      titleHover: 'group-hover:text-red-500 dark:group-hover:text-red-400',
      transition: 'transition-all duration-150 ease-out',
    },
    modal: {
      bg: 'bg-slate-100 dark:bg-zinc-800',
      titleText: 'text-black dark:text-white',
      shadow: 'shadow-xl border-2 border-black dark:border-yellow-400',
      rounded: 'rounded',
    },
    input: {
      bg: 'bg-white dark:bg-zinc-700',
      border: 'border-2 border-slate-500 dark:border-zinc-600',
      focusRing: 'focus:ring-4 focus:ring-yellow-400/50 dark:focus:ring-yellow-300/50',
      focusBorder: 'focus:border-black dark:focus:border-yellow-400',
      text: 'text-black dark:text-white',
      placeholderText: 'placeholder-slate-500 dark:placeholder-zinc-400',
      transition: 'transition-colors duration-150 ease-in-out',
    },
    iconButton: 'text-slate-700 hover:text-red-500 dark:text-zinc-300 dark:hover:text-red-400 transition-colors duration-150',
    bodyBg: 'bg-slate-50 dark:bg-zinc-900',
    footerText: 'text-black dark:text-black', 
    footerHeartColor: 'text-red-500 dark:text-red-400', // Arcade theme's red
    dropdown: {
      bg: 'bg-white dark:bg-zinc-800 border-2 border-black dark:border-yellow-500',
      itemText: 'text-black dark:text-white',
      itemHoverBg: 'hover:bg-yellow-300 dark:hover:bg-yellow-600/50',
      itemHoverText: 'hover:text-black dark:hover:text-white',
      itemActiveBg: 'bg-red-500 dark:bg-red-600',
      itemActiveText: 'text-white dark:text-white font-bold',
    },
    skeletonBase: 'bg-slate-300 dark:bg-zinc-700',
    skeletonHighlight: 'shimmer-gradient-arcade',
  },
  retroTechDark: {
    name: 'RetroTech Dark',
    bg: 'bg-[#1A1A2E]', 
    text: 'text-white', 
    headerBg: 'bg-[#151515]/90 backdrop-blur-md', 
    headerText: 'text-white',
    navLink: 'text-zinc-400 hover:text-emerald-400', 
    navLinkActive: 'text-emerald-400 font-semibold', 
    brandColor: 'text-emerald-400', 
    button: {
      primary: 'bg-emerald-400 hover:bg-emerald-500 focus-visible:outline-emerald-400', 
      primaryText: 'text-black', 
      secondary: 'bg-transparent border border-white hover:bg-white/10 focus-visible:outline-white', 
      secondaryText: 'text-white',
      danger: 'bg-red-700 hover:bg-red-800 focus-visible:outline-red-600', 
      dangerText: 'text-white',
      transition: 'transition-all duration-200 ease-in-out transform active:scale-95',
    },
    card: {
      bg: 'bg-[#151515]', 
      text: 'text-white',
      secondaryText: 'text-zinc-400', 
      shadow: 'shadow-[2px_2px_0px_#2EE59D]', // Mint Green Accent Shadow
      hoverShadow: 'hover:shadow-[4px_4px_0px_#6EE7B7]', // Lighter Mint Green Accent Hover Shadow
      rounded: 'rounded-lg',
      border: 'border border-slate-700', 
      titleHover: 'group-hover:text-emerald-400', 
      transition: 'transition-all duration-300 ease-in-out',
    },
    modal: {
      bg: 'bg-[#151515]', 
      titleText: 'text-white',
      shadow: 'shadow-2xl shadow-black/50',
      rounded: 'rounded-lg',
    },
    input: {
      bg: 'bg-slate-800', 
      border: 'border-slate-600', 
      focusRing: 'focus:ring-2 focus:ring-emerald-400/60', 
      focusBorder: 'focus:border-emerald-400', 
      text: 'text-white',
      placeholderText: 'placeholder-zinc-500', 
      transition: 'transition-colors duration-200 ease-in-out',
    },
    iconButton: 'text-zinc-300 hover:text-emerald-400', 
    bodyBg: 'bg-[#1A1A2E]', 
    footerText: 'text-zinc-400', 
    footerHeartColor: 'text-amber-600', 
    dropdown: {
      bg: 'bg-slate-800', 
      itemText: 'text-zinc-300',
      itemHoverBg: 'hover:bg-slate-700',
      itemHoverText: 'hover:text-emerald-400', 
      itemActiveBg: 'bg-emerald-400/20', 
      itemActiveText: 'text-emerald-400 font-medium',
    },
    skeletonBase: 'bg-slate-800', 
    skeletonHighlight: 'shimmer-gradient-galaxy', 
  },
};

interface ThemeContextType {
  themeName: ThemeName;
  theme: ThemeStyling;
  setThemeName: (themeName: ThemeName) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const defaultThemeName: ThemeName = 'modern';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeNameState] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined' && !window.electronAPI) {
      // 仅在Web环境下同步读取localStorage
      const storedTheme = localStorage.getItem('appTheme') as ThemeName;
      return Object.keys(themeSettings).includes(storedTheme) ? storedTheme : defaultThemeName;
    }
    return defaultThemeName;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && !window.electronAPI) {
      // 仅在Web环境下同步读取localStorage
      const storedTheme = localStorage.getItem('appTheme') as ThemeName;
      if (storedTheme === 'retroTechDark') return true;
      
      return localStorage.getItem('darkMode') === 'true' ||
             (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // 异步加载Electron用户偏好
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.readFile('user-preferences.json')
        .then(data => {
          const preferences = JSON.parse(data);
          if (preferences.themeName && Object.keys(themeSettings).includes(preferences.themeName)) {
            setThemeNameState(preferences.themeName);
          }
          if (typeof preferences.isDarkMode === 'boolean') {
            setIsDarkMode(preferences.isDarkMode);
          }
        })
        .catch(() => {
          // 文件不存在时使用默认值，不输出错误
          console.log('User preferences file not found, using defaults');
        });
    }
  }, []);

  useEffect(() => {
    // Save preferences to electron-store in Electron environment
    if (window.electronAPI) {
      const preferences = {
        themeName,
        isDarkMode
      };
      window.electronAPI.writeFile('user-preferences.json', JSON.stringify(preferences));
    } else {
      localStorage.setItem('appTheme', themeName);
      localStorage.setItem('darkMode', isDarkMode.toString());
    }

    document.body.className = 'antialiased'; 
    document.body.classList.add(...themeSettings[themeName].bodyBg.split(' '));
    
    if (themeName === 'retroTechDark') {
        document.documentElement.classList.add('dark');
    } else {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
  }, [themeName, isDarkMode]);

  useEffect(() => {
    if (themeName === 'retroTechDark') {
      if (!isDarkMode) setIsDarkMode(true); 
      document.documentElement.classList.add('dark');
      if (!window.electronAPI) {
        localStorage.setItem('darkMode', 'true');
      }
    } else {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        if (!window.electronAPI) {
          localStorage.setItem('darkMode', 'true');
        }
      } else {
        document.documentElement.classList.remove('dark');
        if (!window.electronAPI) {
          localStorage.setItem('darkMode', 'false');
        }
      }
    }
  }, [isDarkMode, themeName]);

  const toggleDarkMode = () => {
    if (themeName !== 'retroTechDark') { 
      setIsDarkMode(!isDarkMode);
    }
  };

  const setThemeNameInternal = (newThemeName: ThemeName) => {
    setThemeNameState(newThemeName);
    if (newThemeName === 'retroTechDark') {
      setIsDarkMode(true); 
    }
  };
  
  const currentThemeStyles = useMemo(() => themeSettings[themeName], [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, theme: currentThemeStyles, setThemeName: setThemeNameInternal, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

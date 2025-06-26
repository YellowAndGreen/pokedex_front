/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./types/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // 所有主题的 brandColor 类（确保动态主题样式正确生成）
    'text-emerald-400', 'text-blue-500', 'text-green-500', 'text-cyan-400', 
    'text-red-500', 'text-yellow-400', 'text-lime-400', 'text-indigo-500', 
    'text-pink-500', 'text-slate-500', 'text-white',
    // 所有主题的 hover 变体
    'hover:text-emerald-400', 'hover:text-blue-500', 'hover:text-green-500', 
    'hover:text-cyan-400', 'hover:text-red-500', 'hover:text-yellow-400', 
    'hover:text-lime-400', 'hover:text-indigo-500', 'hover:text-pink-500', 
    'hover:text-slate-500', 'hover:text-white',
    // 透明度
    'opacity-0', 'opacity-50', 'opacity-60', 'opacity-70', 'opacity-80', 'opacity-85', 'opacity-100',
    'hover:opacity-80', 'hover:opacity-85', 'hover:opacity-90', 'hover:opacity-100',
    // 过渡和动画
    'transition-opacity', 'transition-colors', 'transition-all', 'transition-transform',
    'duration-200', 'duration-300', 'duration-500',
    // 字体和文本
    'font-medium', 'font-semibold', 'font-bold',
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl',
    'sm:text-xs', 'sm:text-sm', 'sm:text-base', 'sm:text-lg', 'sm:text-xl', 'sm:text-2xl',
    // 布局
    'flex-shrink-0', 'flex-grow',
    // 所有主题相关的颜色模式（基础颜色）
    { pattern: /bg-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|white|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    // 明确列出项目中使用的 hover 状态（避免正则表达式警告）
    'hover:bg-blue-600', 'hover:bg-blue-700', 'hover:bg-slate-300', 'hover:bg-slate-600', 'hover:bg-slate-700',
    'hover:bg-red-600', 'hover:bg-red-700', 'hover:bg-red-800', 'hover:bg-green-600', 'hover:bg-green-700',
    'hover:bg-lime-300', 'hover:bg-orange-600', 'hover:bg-orange-700', 'hover:bg-cyan-400', 'hover:bg-cyan-500',
    'hover:bg-indigo-600', 'hover:bg-indigo-700', 'hover:bg-pink-500', 'hover:bg-pink-600', 'hover:bg-yellow-500',
    'hover:bg-yellow-600', 'hover:bg-emerald-500', 'hover:bg-emerald-600', 'hover:bg-gray-600', 'hover:bg-gray-800',
    'hover:bg-purple-600', 'hover:bg-black/60', 'hover:bg-black/70', 'hover:bg-white/10',
    // hover text 状态
    'hover:text-blue-400', 'hover:text-blue-600', 'hover:text-green-800', 'hover:text-green-900',
    'hover:text-lime-50', 'hover:text-lime-100', 'hover:text-cyan-200', 'hover:text-cyan-300', 'hover:text-cyan-400',
    'hover:text-red-400', 'hover:text-red-500', 'hover:text-emerald-400', 'hover:text-white', 'hover:text-black',
    // 自定义背景色
    'bg-[#1A1A2E]', 'bg-[#151515]',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'ibm-plex': ['IBM Plex Mono', 'monospace'],
        'inter': ['Inter', 'sans-serif'],
        'noto-serif': ['Noto Serif SC', 'serif'],
        'noto-sans': ['Noto Sans SC', 'sans-serif'],
      },
      colors: {
        'custom-bg': '#1A1A2E',
        'custom-dark': '#151515',
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        fadeInUp: 'fadeInUp 0.5s ease-in-out',
        shimmer: 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
} 
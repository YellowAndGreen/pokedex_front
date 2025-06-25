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
    // 所有主题相关的颜色
    { pattern: /bg-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|white|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /from-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /to-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /via-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    // Hover 状态
    { pattern: /hover:bg-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /hover:text-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|white|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /hover:border-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    // Focus 状态
    { pattern: /focus:bg-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /focus:text-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|white|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /focus:border-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /focus:ring-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    // 透明度变体
    { pattern: /bg-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)\/(50|60|70|80|90)/ },
    { pattern: /hover:bg-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)\/(50|60|70|80|90)/ },
    // 自定义背景色
    'bg-[#1A1A2E]', 'bg-[#151515]',
    // 阴影效果
    { pattern: /shadow-(sm|md|lg|xl|2xl|inner|none)/ },
    { pattern: /hover:shadow-(sm|md|lg|xl|2xl|inner|none)/ },
    // Ring 效果
    { pattern: /ring-(1|2|4|8)/ },
    { pattern: /ring-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /focus:ring-(1|2|4|8)/ },
    { pattern: /focus:ring-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    // placeholder 样式
    { pattern: /placeholder-(slate|blue|green|lime|indigo|cyan|pink|yellow|red|orange|gray|emerald|zinc|neutral)-(50|100|200|300|400|500|600|700|800|900)/ },
    // 焦点可见性
    'focus-visible:outline-green-600', 'focus-visible:outline-cyan-400', 'focus-visible:outline-red-600',
    'focus-visible:outline-orange-600', 'focus-visible:outline-emerald-400', 'focus-visible:outline-yellow-400',
    'focus-visible:outline-lime-400', 'focus-visible:outline-indigo-500', 'focus-visible:outline-pink-500',
    'focus-visible:outline-slate-500', 'focus-visible:outline-white',
    // 重要的交互效果
    'group-hover:scale-105', 'group-hover:scale-103', 'group-hover:-translate-y-1',
    'group-hover:bg-opacity-20', 'group-hover:bg-opacity-10',
    'bg-opacity-0', 'bg-opacity-10', 'bg-opacity-20',
    // 动画相关
    'animate-fadeIn', 'animate-fadeInUp', 'animate-pulse',
    'animation-delay', 'animationDelay', 'animation-fill-mode', 'animationFillMode',
    // 网格和布局
    'aspect-square', 'object-cover', 'object-contain',
    'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6',
    'sm:grid-cols-3', 'sm:grid-cols-4', 'sm:grid-cols-5', 'sm:grid-cols-6',
    'md:grid-cols-4', 'md:grid-cols-5', 'md:grid-cols-6',
    'lg:grid-cols-5', 'lg:grid-cols-6', 'lg:grid-cols-7', 'lg:grid-cols-8',
    // 尺寸和间距
    'min-h-[150px]', 'min-h-[200px]', 'min-h-[300px]', 'min-h-[400px]',
    'max-h-[300px]', 'max-h-[400px]', 'h-48', 'h-56', 'h-64',
    'gap-2', 'gap-3', 'gap-4', 'sm:gap-3', 'sm:gap-4', 'md:gap-4',
    // 位置和变换
    'inset-0', 'absolute', 'relative', 'translate-y-0', '-translate-y-1',
    // Masonry 相关样式
    'my-masonry-grid', 'my-masonry-grid_column',
    // 透明度
    'opacity-0', 'opacity-50', 'opacity-60', 'opacity-70', 'opacity-85', 'opacity-100',
    'hover:opacity-85', 'hover:opacity-90', 'hover:opacity-100',
    'group-hover:opacity-70', 'hover:!opacity-100',
    // 过渡和动画
    'duration-200', 'duration-300', 'duration-500',
    'ease-in-out', 'ease-out', 'ease-linear',
    'transition-transform', 'transition-colors', 'transition-all',
    // 边框和圆角
    'rounded', 'rounded-lg', 'rounded-xl', 'rounded-full',
    'border-2', 'border-black', 'border-white',
    // 字体和文本
    'font-medium', 'font-semibold', 'font-bold',
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl',
    'truncate', 'whitespace-nowrap', 'select-none',
    // 更多颜色变体
    'accent-blue-600', 'accent-green-600', 'accent-cyan-500', 'accent-red-500', 'accent-emerald-500',
    // 自定义CSS类
    'scrollbar-thin', 'modal-transition',
    'shimmer-gradient', 'shimmer-gradient-galaxy', 'shimmer-gradient-arcade',
    'echarts-tooltip',
    // 滚动条相关
    'overflow-x-hidden', 'overflow-y-auto', 'scrollbar-thin::-webkit-scrollbar',
    // 更多动态值
    'max-h-[80vh]', 'max-h-[75vh]', 'max-h-[70vh]', 'min-h-[calc(100vh-10rem)]',
    'w-20', 'w-24', 'h-2.5', 'w-6', 'p-2.5', 'sm:p-3',
    // 更多 group hover 效果
    'group/imagecontainer', 'group-hover/imagecontainer:opacity-70',
    // 更多布局和间距
    'mt-auto', 'pt-4', 'pb-4', 'py-10', 'px-6', 'py-3',
    // 更多变换和位置
    'top-full', 'left-1', 'right-1', 'sm:left-2', 'sm:right-2',
    'active:scale-95', 'scale-95', 'scale-100',
    // 更多文本和字体
    'leading-relaxed', 'leading-normal', 'line-height-1.8',
    // 更多背景和边框
    'backdrop-blur-sm', 'bg-black/20', 'bg-white/90',
    // 更多媒体查询
    'sm:w-24', 'sm:h-12', 'md:w-1/3', 'md:w-1/2', 'lg:w-1/4',
    // 更多flex和grid
    'flex-shrink-0', 'flex-grow', 'justify-items-center', 'items-start',
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
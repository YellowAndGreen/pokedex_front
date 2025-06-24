# WebGL图像查看器

一个基于WebGL的高性能图像查看器，提供流畅的缩放、平移和交互体验。

## 🚀 特性

- **硬件加速渲染**: 使用WebGL进行高性能图像渲染
- **多平台支持**: 支持桌面和移动设备的触摸和鼠标操作
- **渐进式加载**: 从缩略图到高分辨率图片的智能加载
- **内存优化**: 瓦片系统和LOD机制优化大图片渲染
- **平滑动画**: 缩放和平移的平滑过渡效果
- **TypeScript支持**: 完整的类型定义和智能提示

## 📦 安装和使用

### 基础使用

```tsx
import WebGLImageViewer from './webgl-viewer/WebGLImageViewer';

function App() {
  return (
    <WebGLImageViewer
      src="/path/to/image.jpg"
      className="w-full h-96"
      onZoomChange={(originalScale, relativeScale) => {
        console.log('缩放变化:', originalScale, relativeScale);
      }}
    />
  );
}
```

### 渐进式加载

```tsx
import ProgressiveImageLoader from './webgl-viewer/ProgressiveImageLoader';

function App() {
  return (
    <ProgressiveImageLoader
      highResUrl="/path/to/high-res.jpg"
      thumbnailUrl="/path/to/thumbnail.jpg"
      className="w-full h-96"
      onLoadingStateChange={(isLoading, message, stage) => {
        console.log(`${stage}: ${message}`);
      }}
      onQualityChange={(quality) => {
        console.log('图片质量:', quality);
      }}
    />
  );
}
```

### 完整配置示例

```tsx
import { useRef } from 'react';
import WebGLImageViewer from './webgl-viewer/WebGLImageViewer';
import type { WebGLImageViewerRef } from './webgl-viewer/interfaces';

function App() {
  const viewerRef = useRef<WebGLImageViewerRef>(null);

  const handleZoomIn = () => {
    viewerRef.current?.zoomIn();
  };

  const handleReset = () => {
    viewerRef.current?.resetZoom();
  };

  return (
    <div>
      <div>
        <button onClick={handleZoomIn}>放大</button>
        <button onClick={handleReset}>重置</button>
      </div>
      
      <WebGLImageViewer
        ref={viewerRef}
        src="/path/to/image.jpg"
        className="w-full h-96"
        
        // 缩放配置
        minScale={0.1}
        maxScale={10}
        initialScale={1}
        
        // 滚轮配置
        wheel={{
          step: 0.1,
          wheelDisabled: false,
          touchPadDisabled: false,
        }}
        
        // 手势配置
        pinch={{
          step: 0.1,
          disabled: false,
        }}
        
        // 双击配置
        doubleClick={{
          step: 1.5,
          disabled: false,
          mode: 'toggle',
          animationTime: 300,
        }}
        
        // 平移配置
        panning={{
          disabled: false,
          velocityDisabled: false,
        }}
        
        // 其他配置
        limitToBounds={true}
        centerOnInit={true}
        smooth={true}
        debug={false}
        
        // 事件回调
        onZoomChange={(originalScale, relativeScale) => {
          console.log('缩放变化:', originalScale, relativeScale);
        }}
        onLoadingStateChange={(isLoading, message, quality) => {
          console.log('加载状态:', isLoading, message, quality);
        }}
        onImageCopied={() => {
          console.log('图片已复制到剪贴板');
        }}
      />
    </div>
  );
}
```

## 🎮 交互操作

### 鼠标操作
- **左键拖拽**: 平移图片
- **滚轮**: 缩放图片
- **双击**: 缩放切换

### 触摸操作
- **单指拖拽**: 平移图片
- **双指缩放**: 捏合缩放
- **双击**: 缩放切换

### 键盘操作
- **方向键**: 平移图片
- **+/-**: 缩放图片
- **空格**: 重置视图

## 🔧 API 参考

### WebGLImageViewerProps

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `src` | `string` | - | 图片URL |
| `className` | `string` | - | CSS类名 |
| `minScale` | `number` | `0.1` | 最小缩放比例 |
| `maxScale` | `number` | `10` | 最大缩放比例 |
| `initialScale` | `number` | `1` | 初始缩放比例 |
| `limitToBounds` | `boolean` | `true` | 是否限制在边界内 |
| `centerOnInit` | `boolean` | `true` | 是否初始居中 |
| `smooth` | `boolean` | `true` | 是否启用平滑动画 |
| `debug` | `boolean` | `false` | 是否启用调试模式 |

### WebGLImageViewerRef 方法

| 方法 | 参数 | 描述 |
|------|------|------|
| `zoomIn` | `(animated?: boolean)` | 放大图片 |
| `zoomOut` | `(animated?: boolean)` | 缩小图片 |
| `resetZoom` | `(animated?: boolean)` | 重置缩放 |
| `fitToScreen` | `(animated?: boolean)` | 适应屏幕 |
| `zoomTo` | `(scale: number, animated?: boolean)` | 缩放到指定比例 |
| `zoomAt` | `(x: number, y: number, scaleFactor: number, animated?: boolean)` | 在指定点缩放 |
| `getState` | `()` | 获取当前状态 |
| `copyOriginalImageToClipboard` | `()` | 复制原图到剪贴板 |

## 🎨 样式定制

查看器使用CSS类名进行样式控制，可以通过以下方式自定义：

```css
.webgl-viewer {
  /* 查看器容器样式 */
}

.webgl-viewer-canvas {
  /* WebGL画布样式 */
}

.webgl-viewer-loading {
  /* 加载状态样式 */
}

.webgl-viewer-error {
  /* 错误状态样式 */
}
```

## 🔍 调试和故障排除

### 启用调试模式

```tsx
<WebGLImageViewer
  src="/path/to/image.jpg"
  debug={true}
/>
```

调试模式会显示：
- 当前缩放比例
- 图片位置
- 渲染性能信息
- 内存使用情况

### 常见问题

**问题**: WebGL不支持
**解决**: 检查浏览器WebGL支持，提供Canvas降级方案

**问题**: 图片加载失败
**解决**: 检查图片URL和CORS设置

**问题**: 性能问题
**解决**: 开启调试模式查看性能指标，考虑降低图片分辨率

## 🏗️ 架构设计

```
webgl-viewer/
├── interfaces.ts           # TypeScript接口定义
├── constants.ts            # 常量配置
├── utils.ts               # 工具函数
├── ImageViewerEngineBase.ts # 引擎基类
├── WebGLImageViewerEngine.ts # WebGL引擎实现
├── TextureWorker.ts       # 纹理处理工作线程
├── WebGLImageViewer.tsx   # React组件
├── ProgressiveImageLoader.tsx # 渐进式加载组件
└── test-integration.tsx   # 集成测试组件
```

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

---

**开发状态**: ✅ 核心功能完成，可投入生产使用 
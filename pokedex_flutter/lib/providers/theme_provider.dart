import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import '../services/storage_service.dart';

/// 主题模式枚举
enum AppThemeMode {
  light,
  dark,
  system,
}

/// 主题状态管理提供者
/// 对应React项目中的ThemeContext
/// 管理应用主题、语言和UI相关状态
class ThemeProvider with ChangeNotifier {
  /// 存储服务实例
  final StorageService _storageService = StorageService();

  // ===== 状态变量 =====
  
  /// 当前主题模式
  AppThemeMode _themeMode = AppThemeMode.system;
  
  /// 当前语言代码
  String _languageCode = 'zh';
  
  /// 是否正在加载
  bool _isLoading = false;
  
  /// 错误消息
  String? _error;
  
  /// 是否启用动画
  bool _animationsEnabled = true;
  
  /// 字体缩放比例
  double _fontScale = 1.0;
  
  /// 是否启用高对比度
  bool _highContrast = false;
  
  /// 是否启用暗色模式下的纯黑背景
  bool _amoledTheme = false;

  // ===== Getters =====
  
  /// 获取当前主题模式
  AppThemeMode get themeMode => _themeMode;
  
  /// 获取当前语言代码
  String get languageCode => _languageCode;
  
  /// 获取加载状态
  bool get isLoading => _isLoading;
  
  /// 获取错误消息
  String? get error => _error;
  
  /// 获取动画启用状态
  bool get animationsEnabled => _animationsEnabled;
  
  /// 获取字体缩放比例
  double get fontScale => _fontScale;
  
  /// 获取高对比度状态
  bool get highContrast => _highContrast;
  
  /// 获取AMOLED主题状态
  bool get amoledTheme => _amoledTheme;
  
  /// 检查是否有错误
  bool get hasError => _error != null;
  
  /// 获取当前是否为暗色主题
  bool get isDarkMode {
    switch (_themeMode) {
      case AppThemeMode.light:
        return false;
      case AppThemeMode.dark:
        return true;
      case AppThemeMode.system:
        return WidgetsBinding.instance.platformDispatcher.platformBrightness == Brightness.dark;
    }
  }
  
  /// 获取Material主题数据
  ThemeData get lightTheme => _buildLightTheme();
  ThemeData get darkTheme => _buildDarkTheme();

  // ===== 构造函数 =====
  
  /// 构造函数
  /// 自动加载保存的设置
  ThemeProvider() {
    _loadSettings();
  }

  // ===== 私有方法 =====
  
  /// 加载保存的设置
  Future<void> _loadSettings() async {
    try {
      _isLoading = true;
      notifyListeners();
      
      // 加载主题模式
      final savedThemeMode = await _storageService.getThemeMode();
      if (savedThemeMode != null) {
        _themeMode = AppThemeMode.values.firstWhere(
          (mode) => mode.toString() == savedThemeMode,
          orElse: () => AppThemeMode.system,
        );
      }
      
      // 加载语言设置
      final savedLanguage = await _storageService.getLanguageCode();
      if (savedLanguage != null) {
        _languageCode = savedLanguage;
      }
      
      // 加载其他用户偏好
      _animationsEnabled = await _storageService.getPreference<bool>('animations_enabled') ?? true;
      _fontScale = await _storageService.getPreference<double>('font_scale') ?? 1.0;
      _highContrast = await _storageService.getPreference<bool>('high_contrast') ?? false;
      _amoledTheme = await _storageService.getPreference<bool>('amoled_theme') ?? false;
      
    } catch (e) {
      _error = '加载主题设置失败: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// 设置加载状态
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
  
  /// 设置错误消息
  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }
  
  /// 清除错误消息
  void _clearError() {
    _error = null;
    notifyListeners();
  }
  
  /// 构建亮色主题
  ThemeData _buildLightTheme() {
    const primaryColor = Color(0xFF2196F3);
    const secondaryColor = Color(0xFF03DAC6);
    
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.light,
      ),
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: true,
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      cardTheme: const CardThemeData(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      textTheme: _buildTextTheme(Brightness.light),
      // 禁用动画（如果用户设置）
      pageTransitionsTheme: _animationsEnabled 
          ? const PageTransitionsTheme() 
          : const PageTransitionsTheme(
              builders: {
                TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
                TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
              },
            ),
    );
  }
  
  /// 构建暗色主题
  ThemeData _buildDarkTheme() {
    const primaryColor = Color(0xFF2196F3);
    const secondaryColor = Color(0xFF03DAC6);
    
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.dark,
      ).copyWith(
        // AMOLED主题使用纯黑背景
        surface: _amoledTheme ? Colors.black : null,
      ),
      appBarTheme: AppBarTheme(
        elevation: 0,
        centerTitle: true,
        backgroundColor: _amoledTheme ? Colors.black : primaryColor,
        foregroundColor: Colors.white,
      ),
      cardTheme: CardThemeData(
        elevation: 4,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
        color: _amoledTheme ? const Color(0xFF121212) : null,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      textTheme: _buildTextTheme(Brightness.dark),
      // 禁用动画（如果用户设置）
      pageTransitionsTheme: _animationsEnabled 
          ? const PageTransitionsTheme() 
          : const PageTransitionsTheme(
              builders: {
                TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
                TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
              },
            ),
    );
  }
  
  /// 构建文本主题
  TextTheme _buildTextTheme(Brightness brightness) {
    final baseTheme = brightness == Brightness.light 
        ? ThemeData.light().textTheme 
        : ThemeData.dark().textTheme;
    
    // 应用字体缩放和中文字体
    return baseTheme.copyWith(
      displayLarge: baseTheme.displayLarge?.copyWith(
        fontSize: (baseTheme.displayLarge?.fontSize ?? 57) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      displayMedium: baseTheme.displayMedium?.copyWith(
        fontSize: (baseTheme.displayMedium?.fontSize ?? 45) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      displaySmall: baseTheme.displaySmall?.copyWith(
        fontSize: (baseTheme.displaySmall?.fontSize ?? 36) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      headlineLarge: baseTheme.headlineLarge?.copyWith(
        fontSize: (baseTheme.headlineLarge?.fontSize ?? 32) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      headlineMedium: baseTheme.headlineMedium?.copyWith(
        fontSize: (baseTheme.headlineMedium?.fontSize ?? 28) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      headlineSmall: baseTheme.headlineSmall?.copyWith(
        fontSize: (baseTheme.headlineSmall?.fontSize ?? 24) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      titleLarge: baseTheme.titleLarge?.copyWith(
        fontSize: (baseTheme.titleLarge?.fontSize ?? 22) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      titleMedium: baseTheme.titleMedium?.copyWith(
        fontSize: (baseTheme.titleMedium?.fontSize ?? 16) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      titleSmall: baseTheme.titleSmall?.copyWith(
        fontSize: (baseTheme.titleSmall?.fontSize ?? 14) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      bodyLarge: baseTheme.bodyLarge?.copyWith(
        fontSize: (baseTheme.bodyLarge?.fontSize ?? 16) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      bodyMedium: baseTheme.bodyMedium?.copyWith(
        fontSize: (baseTheme.bodyMedium?.fontSize ?? 14) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      bodySmall: baseTheme.bodySmall?.copyWith(
        fontSize: (baseTheme.bodySmall?.fontSize ?? 12) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      labelLarge: baseTheme.labelLarge?.copyWith(
        fontSize: (baseTheme.labelLarge?.fontSize ?? 14) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      labelMedium: baseTheme.labelMedium?.copyWith(
        fontSize: (baseTheme.labelMedium?.fontSize ?? 12) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
      labelSmall: baseTheme.labelSmall?.copyWith(
        fontSize: (baseTheme.labelSmall?.fontSize ?? 11) * _fontScale,
        fontFamily: 'SourceHanSansCN',
      ),
    );
  }

  // ===== 公共方法 =====
  
  /// 设置主题模式
  /// [mode] 主题模式
  Future<void> setThemeMode(AppThemeMode mode) async {
    if (_themeMode == mode) return;
    
    try {
      _themeMode = mode;
      notifyListeners();
      
      await _storageService.saveThemeMode(mode.toString());
    } catch (e) {
      _setError('保存主题设置失败: $e');
    }
  }
  
  /// 切换主题模式
  Future<void> toggleTheme() async {
    switch (_themeMode) {
      case AppThemeMode.light:
        await setThemeMode(AppThemeMode.dark);
        break;
      case AppThemeMode.dark:
        await setThemeMode(AppThemeMode.system);
        break;
      case AppThemeMode.system:
        await setThemeMode(AppThemeMode.light);
        break;
    }
  }
  
  /// 设置语言
  /// [languageCode] 语言代码
  Future<void> setLanguage(String languageCode) async {
    if (_languageCode == languageCode) return;
    
    try {
      _languageCode = languageCode;
      notifyListeners();
      
      await _storageService.saveLanguageCode(languageCode);
    } catch (e) {
      _setError('保存语言设置失败: $e');
    }
  }
  
  /// 设置动画启用状态
  /// [enabled] 是否启用动画
  Future<void> setAnimationsEnabled(bool enabled) async {
    if (_animationsEnabled == enabled) return;
    
    try {
      _animationsEnabled = enabled;
      notifyListeners();
      
      await _storageService.savePreference('animations_enabled', enabled);
    } catch (e) {
      _setError('保存动画设置失败: $e');
    }
  }
  
  /// 设置字体缩放比例
  /// [scale] 缩放比例 (0.8 - 1.5)
  Future<void> setFontScale(double scale) async {
    final clampedScale = scale.clamp(0.8, 1.5);
    if (_fontScale == clampedScale) return;
    
    try {
      _fontScale = clampedScale;
      notifyListeners();
      
      await _storageService.savePreference('font_scale', clampedScale);
    } catch (e) {
      _setError('保存字体设置失败: $e');
    }
  }
  
  /// 设置高对比度模式
  /// [enabled] 是否启用高对比度
  Future<void> setHighContrast(bool enabled) async {
    if (_highContrast == enabled) return;
    
    try {
      _highContrast = enabled;
      notifyListeners();
      
      await _storageService.savePreference('high_contrast', enabled);
    } catch (e) {
      _setError('保存对比度设置失败: $e');
    }
  }
  
  /// 设置AMOLED主题
  /// [enabled] 是否启用AMOLED主题（纯黑背景）
  Future<void> setAmoledTheme(bool enabled) async {
    if (_amoledTheme == enabled) return;
    
    try {
      _amoledTheme = enabled;
      notifyListeners();
      
      await _storageService.savePreference('amoled_theme', enabled);
    } catch (e) {
      _setError('保存AMOLED设置失败: $e');
    }
  }
  
  /// 重置所有设置为默认值
  Future<void> resetToDefaults() async {
    try {
      _setLoading(true);
      _clearError();
      
      _themeMode = AppThemeMode.system;
      _languageCode = 'zh';
      _animationsEnabled = true;
      _fontScale = 1.0;
      _highContrast = false;
      _amoledTheme = false;
      
      // 保存默认设置
      await _storageService.saveThemeMode(_themeMode.toString());
      await _storageService.saveLanguageCode(_languageCode);
      await _storageService.savePreference('animations_enabled', _animationsEnabled);
      await _storageService.savePreference('font_scale', _fontScale);
      await _storageService.savePreference('high_contrast', _highContrast);
      await _storageService.savePreference('amoled_theme', _amoledTheme);
      
      notifyListeners();
    } catch (e) {
      _setError('重置设置失败: $e');
    } finally {
      _setLoading(false);
    }
  }
  
  /// 手动清除错误消息
  void clearError() {
    _clearError();
  }
  
  /// 获取主题模式显示名称
  String getThemeModeDisplayName(AppThemeMode mode) {
    switch (mode) {
      case AppThemeMode.light:
        return '亮色主题';
      case AppThemeMode.dark:
        return '暗色主题';
      case AppThemeMode.system:
        return '跟随系统';
    }
  }
  
  /// 获取语言显示名称
  String getLanguageDisplayName(String languageCode) {
    switch (languageCode) {
      case 'zh':
        return '简体中文';
      case 'en':
        return 'English';
      default:
        return languageCode;
    }
  }
  
  /// 获取所有可用的主题模式
  List<AppThemeMode> get availableThemeModes => AppThemeMode.values;
  
  /// 获取所有可用的语言
  List<String> get availableLanguages => ['zh', 'en'];
  
  /// 获取主题设置摘要（用于调试）
  Map<String, dynamic> getThemeSummary() {
    return {
      'themeMode': _themeMode.toString(),
      'languageCode': _languageCode,
      'isDarkMode': isDarkMode,
      'animationsEnabled': _animationsEnabled,
      'fontScale': _fontScale,
      'highContrast': _highContrast,
      'amoledTheme': _amoledTheme,
      'isLoading': _isLoading,
      'hasError': hasError,
      'error': _error,
    };
  }

  @override
  void dispose() {
    // 清理资源
    super.dispose();
  }
} 
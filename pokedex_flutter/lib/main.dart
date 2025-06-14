import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'providers/auth_provider.dart';
import 'providers/category_provider.dart';
import 'providers/theme_provider.dart';
import 'services/storage_service.dart';

/// 应用入口函数
/// 初始化服务并启动Flutter应用
void main() async {
  // 确保Flutter引擎已初始化
  WidgetsFlutterBinding.ensureInitialized();
  
  // 初始化本地存储服务
  await StorageService().initialize();
  
  // 设置系统UI样式
  await _setupSystemUI();
  
  // 启动应用
  runApp(const PokeDexApp());
}

/// 设置系统UI样式
Future<void> _setupSystemUI() async {
  // 设置状态栏和导航栏样式
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  // 设置首选设备方向
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
}

/// PokeDx Flutter应用根组件
/// 配置Provider和主题
class PokeDexApp extends StatelessWidget {
  const PokeDexApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // 主题提供者 - 首先创建，因为其他Provider可能需要主题信息
        ChangeNotifierProvider(
          create: (_) => ThemeProvider(),
        ),
        
        // 认证提供者 - 管理用户登录状态
        ChangeNotifierProvider(
          create: (_) => AuthProvider(),
        ),
        
        // 分类提供者 - 管理分类和图片数据
        ChangeNotifierProvider(
          create: (_) => CategoryProvider(),
        ),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp.router(
            // 应用基本信息
            title: 'PokeDex Flutter',
            debugShowCheckedModeBanner: false,
            
            // 主题配置
            theme: themeProvider.lightTheme,
            darkTheme: themeProvider.darkTheme,
            themeMode: _getThemeMode(themeProvider.themeMode),
            
            // 路由配置
            routerConfig: AppRouter.router,
            
            // 国际化配置
            locale: Locale(themeProvider.languageCode),
            supportedLocales: const [
              Locale('zh', 'CN'), // 简体中文
              Locale('en', 'US'), // 英语
            ],
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            
            // 应用构建器，处理全局错误和初始化状态
            builder: (context, child) {
              return MediaQuery(
                // 应用字体缩放
                data: MediaQuery.of(context).copyWith(
                  textScaler: TextScaler.linear(themeProvider.fontScale),
                ),
                child: child ?? const SizedBox.shrink(),
              );
            },
          );
        },
      ),
    );
  }
  
  /// 转换主题模式
  ThemeMode _getThemeMode(AppThemeMode mode) {
    switch (mode) {
      case AppThemeMode.light:
        return ThemeMode.light;
      case AppThemeMode.dark:
        return ThemeMode.dark;
      case AppThemeMode.system:
        return ThemeMode.system;
    }
  }
} 
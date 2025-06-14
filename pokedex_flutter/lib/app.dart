import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/category/category_list_screen.dart';
import 'screens/category/category_detail_screen.dart';
import 'screens/login/login_screen.dart';
import 'screens/search/search_screen.dart';
import 'screens/analytics/analytics_screen.dart';
import 'screens/tags/tag_screen.dart';

/// 应用路由配置类
/// 对应React项目中的路由设置
class AppRouter {
  /// GoRouter配置
  static final GoRouter router = GoRouter(
    // 初始路由
    initialLocation: '/',
    
    // 路由重定向逻辑
    redirect: (context, state) {
      final authProvider = context.read<AuthProvider>();
      final isLoggedIn = authProvider.isAuthenticated;
      final isInitializing = authProvider.isInitializing;
      
      // 如果正在初始化，显示加载状态
      if (isInitializing) {
        return null; // 保持当前路由，让页面处理加载状态
      }
      
      // 需要认证的路由列表
      const protectedRoutes = [
        '/',
        '/categories',
        '/search',
        '/analytics',
      ];
      
      final isProtectedRoute = protectedRoutes.any((route) => 
        state.matchedLocation.startsWith(route));
      
      // 如果访问受保护的路由但未登录，重定向到登录页
      if (isProtectedRoute && !isLoggedIn) {
        return '/login';
      }
      
      // 如果已登录但访问登录页，重定向到首页
      if (isLoggedIn && state.matchedLocation == '/login') {
        return '/';
      }
      
      return null; // 不需要重定向
    },
    
    // 路由配置
    routes: [
      // 首页 - 分类列表
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const CategoryListScreen(),
      ),
      
      // 分类列表（重定向到首页）
      GoRoute(
        path: '/categories',
        name: 'categories',
        redirect: (context, state) => '/',
      ),
      
      // 分类详情
      GoRoute(
        path: '/categories/:categoryId',
        name: 'category-detail',
        builder: (context, state) {
          final categoryId = state.pathParameters['categoryId']!;
          return CategoryDetailScreen(categoryId: categoryId);
        },
      ),
      
      // 标签页面
      GoRoute(
        path: '/tags/:tagName',
        name: 'tag-detail',
        builder: (context, state) {
          final tagName = state.pathParameters['tagName']!;
          return TagScreen(tagName: tagName);
        },
      ),
      
      // 搜索页面
      GoRoute(
        path: '/search',
        name: 'search',
        builder: (context, state) => const SearchScreen(),
      ),
      
      // 数据分析页面
      GoRoute(
        path: '/analytics',
        name: 'analytics',
        builder: (context, state) => const AnalyticsScreen(),
      ),
      
      // 登录页面
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
    ],
    
    // 错误页面处理
    errorBuilder: (context, state) => ErrorScreen(error: state.error),
  );
}

/// 错误页面组件
class ErrorScreen extends StatelessWidget {
  final GoException? error;
  
  const ErrorScreen({
    super.key,
    this.error,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('页面错误'),
        backgroundColor: Theme.of(context).colorScheme.error,
        foregroundColor: Theme.of(context).colorScheme.onError,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Theme.of(context).colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                '页面加载失败',
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                error?.toString() ?? '未知错误',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  context.go('/');
                },
                child: const Text('返回首页'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// 加载页面组件
/// 在应用初始化时显示
class LoadingScreen extends StatelessWidget {
  const LoadingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 应用图标或Logo
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                Icons.photo_library,
                size: 48,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            ),
            const SizedBox(height: 24),
            
            // 应用名称
            Text(
              'PokeDex Flutter',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            
            // 加载提示
            Text(
              '正在初始化应用...',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
              ),
            ),
            const SizedBox(height: 32),
            
            // 加载指示器
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}

/// 路由辅助工具类
/// 提供便捷的导航方法
class AppNavigation {
  /// 导航到首页
  static void goHome(BuildContext context) {
    context.go('/');
  }
  
  /// 导航到分类详情
  static void goCategoryDetail(BuildContext context, String categoryId) {
    context.go('/categories/$categoryId');
  }
  
  /// 导航到标签页面
  static void goTagDetail(BuildContext context, String tagName) {
    context.go('/tags/$tagName');
  }
  
  /// 导航到搜索页面
  static void goSearch(BuildContext context) {
    context.go('/search');
  }
  
  /// 导航到分析页面
  static void goAnalytics(BuildContext context) {
    context.go('/analytics');
  }
  
  /// 导航到登录页面
  static void goLogin(BuildContext context) {
    context.go('/login');
  }
  
  /// 返回上一页
  static void goBack(BuildContext context) {
    if (context.canPop()) {
      context.pop();
    } else {
      goHome(context);
    }
  }
  
  /// 检查当前是否在指定路由
  static bool isCurrentRoute(BuildContext context, String routeName) {
    final location = GoRouterState.of(context).matchedLocation;
    return location == routeName;
  }
  
  /// 获取当前路由名称
  static String getCurrentRoute(BuildContext context) {
    return GoRouterState.of(context).matchedLocation;
  }
} 
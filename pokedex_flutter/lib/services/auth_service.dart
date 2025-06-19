import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

/// 认证服务类
/// 基于OpenAPI文档实现邮箱验证码认证
/// 处理用户认证、令牌管理和本地存储
class AuthService {
  /// SharedPreferences键名
  static const String _tokenKey = 'auth_token';
  static const String _emailKey = 'user_email';
  static const String _usernameKey = 'username';
  static const String _tokenTypeKey = 'token_type';

  /// 单例实例
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  /// API服务实例
  final ApiService _apiService = ApiService();

  /// 当前用户邮箱
  String? _currentEmail;
  
  /// 当前用户名（用于传统登录）
  String? _currentUsername;

  /// 获取当前用户邮箱
  String? get currentEmail => _currentEmail;
  
  /// 获取当前用户名
  String? get currentUsername => _currentUsername;

  /// 发送验证码到邮箱
  /// 对应OpenAPI端点: POST /api/send-verification
  Future<void> sendVerificationCode(String email) async {
    try {
      await _apiService.sendVerificationCode(email);
    } catch (e) {
      rethrow;
    }
  }

  /// 验证码登录
  /// 对应OpenAPI端点: POST /api/verify
  /// 返回登录是否成功
  Future<bool> verifyCodeAndLogin(String email, String code) async {
    try {
      final authResponse = await _apiService.verifyCodeAndLogin(email, code);
      
      // 保存令牌和邮箱到本地存储
      await _saveToken(authResponse.accessToken);
      await _saveTokenType(authResponse.tokenType);
      await _saveEmail(email);
      
      // 设置API服务的认证令牌
      _apiService.setAuthToken(authResponse.accessToken);
      _currentEmail = email;
      
      return true;
    } catch (e) {
      // 登录失败，清除可能存在的旧数据
      await logout();
      rethrow;
    }
  }

  /// 传统用户名密码登录
  /// 对应OpenAPI端点: POST /auth/login （兼容传统登录）
  /// 返回登录是否成功
  Future<bool> loginWithPassword(String username, String password) async {
    try {
      // 使用演示账号逻辑
      if (username == 'demo' && password == 'demo123') {
        // 模拟成功的登录响应
        final mockToken = 'demo_token_${DateTime.now().millisecondsSinceEpoch}';
        
        // 保存令牌和用户名到本地存储
        await _saveToken(mockToken);
        await _saveTokenType('Bearer');
        await _saveUsername(username);
        
        // 设置API服务的认证令牌
        _apiService.setAuthToken(mockToken);
        _currentUsername = username;
        
        return true;
      } else {
        // 如果有真实的API端点，可以在这里调用
        // final authResponse = await _apiService.loginWithPassword(username, password);
        // ... 处理真实的登录响应
        
        // 目前返回失败，因为只支持演示账号
        throw Exception('用户名或密码错误');
      }
    } catch (e) {
      // 登录失败，清除可能存在的旧数据
      await logout();
      rethrow;
    }
  }

  /// 用户登出
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    
    // 清除本地存储的认证信息
    await prefs.remove(_tokenKey);
    await prefs.remove(_emailKey);
    await prefs.remove(_usernameKey);
    await prefs.remove(_tokenTypeKey);
    
    // 清除API服务的认证令牌
    _apiService.setAuthToken(null);
    _currentEmail = null;
    _currentUsername = null;
  }

  /// 检查用户是否已登录
  Future<bool> isLoggedIn() async {
    final token = await getStoredToken();
    if (token == null) return false;
    
    // 验证令牌是否有效
    _apiService.setAuthToken(token);
    
    try {
      // 使用受保护路由测试令牌有效性
      await _apiService.testProtectedRoute();
      
      // 令牌有效，恢复用户状态
      _currentEmail = await getStoredEmail();
      _currentUsername = await getStoredUsername();
      return true;
    } catch (e) {
      // 验证失败，清除本地数据
      await logout();
      return false;
    }
  }

  /// 初始化认证状态
  /// 应用启动时调用，恢复已登录用户的状态
  Future<void> initializeAuth() async {
    final token = await getStoredToken();
    if (token != null) {
      _apiService.setAuthToken(token);
      _currentEmail = await getStoredEmail();
      _currentUsername = await getStoredUsername();
      
      // 验证令牌是否仍然有效
      final isValid = await isLoggedIn();
      if (!isValid) {
        // 令牌已失效，清除数据
        await logout();
      }
    }
  }

  /// 获取存储的令牌
  Future<String?> getStoredToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  /// 获取存储的令牌类型
  Future<String?> getStoredTokenType() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenTypeKey);
  }

  /// 获取存储的用户邮箱
  Future<String?> getStoredEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_emailKey);
  }

  /// 获取存储的用户名
  Future<String?> getStoredUsername() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_usernameKey);
  }

  /// 保存令牌到本地存储
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  /// 保存令牌类型到本地存储
  Future<void> _saveTokenType(String tokenType) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenTypeKey, tokenType);
  }

  /// 保存邮箱到本地存储
  Future<void> _saveEmail(String email) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_emailKey, email);
  }

  /// 保存用户名到本地存储
  Future<void> _saveUsername(String username) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_usernameKey, username);
  }

  /// 测试受保护路由（验证令牌有效性）
  /// 对应OpenAPI端点: GET /api/protected-test
  Future<Map<String, dynamic>?> testProtectedRoute() async {
    try {
      return await _apiService.testProtectedRoute();
    } catch (e) {
      return null;
    }
  }

  /// 获取当前认证令牌
  /// 主要用于调试或特殊需求
  Future<String?> getCurrentToken() async {
    return await getStoredToken();
  }

  /// 获取完整的认证信息
  Future<Map<String, String?>> getAuthInfo() async {
    return {
      'token': await getStoredToken(),
      'tokenType': await getStoredTokenType(),
      'email': await getStoredEmail(),
    };
  }

  /// 清除所有认证相关的本地数据
  /// 用于重置应用状态或故障排除
  Future<void> clearAuthData() async {
    await logout();
  }

  /// 检查用户权限
  /// 可以根据需要扩展权限检查逻辑
  Future<bool> hasPermission(String permission) async {
    // 目前简单检查是否已登录
    // 可以根据后端返回的用户信息扩展权限检查
    return await isLoggedIn();
  }

  /// 验证邮箱格式
  bool isValidEmail(String email) {
    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
    return emailRegex.hasMatch(email);
  }

  /// 验证验证码格式（假设验证码为6位数字）
  bool isValidVerificationCode(String code) {
    final codeRegex = RegExp(r'^\d{6}$');
    return codeRegex.hasMatch(code);
  }

} 
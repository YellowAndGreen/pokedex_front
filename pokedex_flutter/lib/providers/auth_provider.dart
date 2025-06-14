import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

/// 简单的用户模型类（用于UI展示）
class User {
  final String username;
  final String email;
  
  User({required this.username, required this.email});
}

/// 认证状态管理提供者
/// 对应React项目中的AuthContext
/// 管理用户认证状态、登录/登出流程和相关UI状态
class AuthProvider with ChangeNotifier {
  /// 认证服务实例
  final AuthService _authService = AuthService();
  
  /// API服务实例
  final ApiService _apiService = ApiService();
  
  /// 存储服务实例
  final StorageService _storageService = StorageService();

  // ===== 状态变量 =====
  
  /// 当前用户名
  String? _currentUser;
  
  /// 是否已认证
  bool _isAuthenticated = false;
  
  /// 是否正在加载（登录、验证等操作）
  bool _isLoading = false;
  
  /// 错误消息
  String? _error;
  
  /// 是否正在初始化认证状态
  bool _isInitializing = true;

  // ===== Getters =====
  
  /// 获取当前用户名
  String? get currentUser => _currentUser;
  
  /// 获取用户信息（为兼容UI代码）
  User? get user => _currentUser != null 
      ? User(username: _currentUser!, email: '${_currentUser}@example.com') 
      : null;
  
  /// 获取认证状态
  bool get isAuthenticated => _isAuthenticated;
  
  /// 获取加载状态
  bool get isLoading => _isLoading;
  
  /// 获取错误消息
  String? get error => _error;
  
  /// 获取初始化状态
  bool get isInitializing => _isInitializing;
  
  /// 检查是否有错误
  bool get hasError => _error != null;

  // ===== 构造函数 =====
  
  /// 构造函数
  /// 自动初始化认证状态
  AuthProvider() {
    _initializeAuth();
  }

  // ===== 私有方法 =====
  
  /// 初始化认证状态
  /// 应用启动时检查是否有保存的认证信息
  Future<void> _initializeAuth() async {
    try {
      _isInitializing = true;
      notifyListeners();
      
      await _authService.initializeAuth();
      
      final isLoggedIn = await _authService.isLoggedIn();
      if (isLoggedIn) {
        _currentUser = _authService.currentUsername;
        _isAuthenticated = true;
      } else {
        _currentUser = null;
        _isAuthenticated = false;
      }
    } catch (e) {
      _error = '初始化认证状态失败: $e';
      _isAuthenticated = false;
    } finally {
      _isInitializing = false;
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

  // ===== 公共方法 =====
  
  /// 发送验证码到邮箱
  Future<bool> sendVerificationCode(String email) async {
    if (_isLoading) return false;
    
    try {
      _setLoading(true);
      _clearError();
      
      if (!_authService.isValidEmail(email)) {
        _setError('请输入有效的邮箱地址');
        return false;
      }
      
      await _authService.sendVerificationCode(email);
      return true;
    } catch (e) {
      _setError('发送验证码失败: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// 验证码登录
  Future<bool> verifyCodeAndLogin(String email, String code, {bool rememberMe = false}) async {
    if (_isLoading) return false;
    
    try {
      _setLoading(true);
      _clearError();
      
      if (!_authService.isValidEmail(email)) {
        _setError('请输入有效的邮箱地址');
        return false;
      }
      
      if (!_authService.isValidVerificationCode(code)) {
        _setError('请输入6位数字验证码');
        return false;
      }
      
      final success = await _authService.verifyCodeAndLogin(email, code);
      
      if (success) {
        _currentUser = email;
        _isAuthenticated = true;
        
        // 如果选择记住邮箱，保存到本地存储
        if (rememberMe) {
          await _saveUsername(email);
        } else {
          await _clearSavedUsername();
        }
        
        notifyListeners();
        return true;
      } else {
        _setError('登录失败：邮箱或验证码错误');
        return false;
      }
    } catch (e) {
      _setError('登录失败: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// 保留兼容性的login方法（现在使用邮箱验证码）
  @Deprecated('使用 verifyCodeAndLogin 替代')
  Future<bool> login(String email, String code, {bool rememberMe = false}) async {
    return await verifyCodeAndLogin(email, code, rememberMe: rememberMe);
  }
  
  /// 用户登出
  Future<void> logout() async {
    if (_isLoading) return;
    
    try {
      _setLoading(true);
      _clearError();
      
      await _authService.logout();
      
      _currentUser = null;
      _isAuthenticated = false;
      notifyListeners();
    } catch (e) {
      _setError('登出失败: $e');
    } finally {
      _setLoading(false);
    }
  }
  
  /// 检查认证状态
  /// 验证当前令牌是否仍然有效
  Future<bool> checkAuthStatus() async {
    try {
      final isLoggedIn = await _authService.isLoggedIn();
      
      if (isLoggedIn != _isAuthenticated) {
        if (isLoggedIn) {
          _currentUser = _authService.currentUsername;
          _isAuthenticated = true;
        } else {
          _currentUser = null;
          _isAuthenticated = false;
        }
        notifyListeners();
      }
      
      return isLoggedIn;
    } catch (e) {
      _setError('检查认证状态失败: $e');
      return false;
    }
  }
  
  /// 刷新认证令牌（目前不支持，返回false触发重新登录）
  /// 如果后端支持令牌刷新功能
  Future<bool> refreshAuth() async {
    try {
      _setLoading(true);
      _clearError();
      
      // 当前API不支持令牌刷新，返回false触发重新登录
      final success = false;
      
      if (!success) {
        // 刷新失败，需要重新登录
        await logout();
      }
      
      return success;
    } catch (e) {
      _setError('刷新认证失败: $e');
      await logout();
      return false;
    } finally {
      _setLoading(false);
    }
  }
  
  /// 保留兼容性的refreshToken方法
  @Deprecated('当前API不支持令牌刷新')
  Future<bool> refreshToken() async {
    return await refreshAuth();
  }
  
  /// 检查用户权限
  /// [permission] 权限名称
  Future<bool> hasPermission(String permission) async {
    if (!_isAuthenticated) return false;
    
    try {
      return await _authService.hasPermission(permission);
    } catch (e) {
      _setError('检查权限失败: $e');
      return false;
    }
  }
  
  /// 清除认证数据
  /// 用于重置应用状态或故障排除
  Future<void> clearAuthData() async {
    try {
      _setLoading(true);
      _clearError();
      
      await _authService.clearAuthData();
      
      _currentUser = null;
      _isAuthenticated = false;
      notifyListeners();
    } catch (e) {
      _setError('清除认证数据失败: $e');
    } finally {
      _setLoading(false);
    }
  }
  
  /// 手动清除错误消息
  void clearError() {
    _clearError();
  }
  
  /// 获取认证令牌（用于调试）
  Future<String?> getCurrentToken() async {
    try {
      return await _authService.getCurrentToken();
    } catch (e) {
      _setError('获取令牌失败: $e');
      return null;
    }
  }
  
  /// 验证表单输入
  /// [username] 用户名
  /// [password] 密码
  /// 返回验证错误消息，null表示验证通过
  String? validateLoginForm(String username, String password) {
    if (username.trim().isEmpty) {
      return '请输入用户名';
    }
    
    if (password.trim().isEmpty) {
      return '请输入密码';
    }
    
    if (username.trim().length < 3) {
      return '用户名至少需要3个字符';
    }
    
    if (password.trim().length < 6) {
      return '密码至少需要6个字符';
    }
    
    return null;
  }
  
  /// 是否需要显示登录界面
  bool get shouldShowLogin => !_isAuthenticated && !_isInitializing;
  
  /// 认证状态摘要（用于调试）
  Map<String, dynamic> getAuthSummary() {
    return {
      'isAuthenticated': _isAuthenticated,
      'currentUser': _currentUser,
      'isLoading': _isLoading,
      'hasError': hasError,
      'error': _error,
      'isInitializing': _isInitializing,
    };
  }

  // ===== 私有辅助方法 =====
  
  /// 保存用户名到本地存储
  Future<void> _saveUsername(String username) async {
    try {
      await _storageService.saveString('saved_username', username);
    } catch (e) {
      // 保存失败不影响登录流程
    }
  }
  
  /// 清除保存的用户名
  Future<void> _clearSavedUsername() async {
    try {
      await _storageService.removeKey('saved_username');
    } catch (e) {
      // 清除失败不影响登录流程
    }
  }
  
  /// 获取保存的用户名
  Future<String?> getSavedUsername() async {
    try {
      return await _storageService.getString('saved_username');
    } catch (e) {
      return null;
    }
  }

  @override
  void dispose() {
    // 清理资源
    super.dispose();
  }
} 
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';

/// 登录屏幕
/// 提供用户名密码登录功能，支持表单验证和错误处理
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  
  // 表单控制器
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  
  // 动画控制器
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  // 状态变量
  bool _isPasswordVisible = false;
  bool _rememberMe = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    
    // 初始化动画
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));
    
    // 启动动画
    _animationController.forward();
    
    // 加载保存的用户名
    _loadSavedCredentials();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  /// 加载保存的凭据
  Future<void> _loadSavedCredentials() async {
    final authProvider = context.read<AuthProvider>();
    final savedUsername = await authProvider.getSavedUsername();
    if (savedUsername != null) {
      _usernameController.text = savedUsername;
      setState(() {
        _rememberMe = true;
      });
    }
  }

  /// 处理登录
  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _errorMessage = null;
    });

    final authProvider = context.read<AuthProvider>();
    
    try {
      // 使用传统用户名密码登录方式
      final success = await authProvider.loginWithPassword(
        _usernameController.text.trim(),
        _passwordController.text,
        rememberMe: _rememberMe,
      );

      if (success && mounted) {
        // 登录成功，导航将由路由重定向处理
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('登录成功！'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = _getErrorMessage(e);
      });
    }
  }

  /// 根据错误类型返回用户友好的错误消息
  String _getErrorMessage(dynamic error) {
    final errorStr = error.toString().toLowerCase();
    
    if (errorStr.contains('network') || errorStr.contains('connection')) {
      return '网络连接失败，请检查网络设置';
    } else if (errorStr.contains('timeout')) {
      return '连接超时，请稍后重试';
    } else if (errorStr.contains('unauthorized') || errorStr.contains('login')) {
      return '用户名或密码错误';
    } else if (errorStr.contains('server')) {
      return '服务器错误，请稍后重试';
    }
    
    return '登录失败，请稍后重试';
  }

  /// 处理忘记密码
  void _handleForgotPassword() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('忘记密码'),
        content: const Text('请联系管理员重置密码，或使用演示账号：\n用户名：demo\n密码：demo123'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  /// 处理演示登录
  Future<void> _handleDemoLogin() async {
    _usernameController.text = 'demo';
    _passwordController.text = 'demo123';
    setState(() {
      _rememberMe = true;
    });
    await _handleLogin();
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final authProvider = context.watch<AuthProvider>();
    
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Theme.of(context).primaryColor.withValues(alpha: 0.1),
              Theme.of(context).primaryColor.withValues(alpha: 0.05),
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: SlideTransition(
                  position: _slideAnimation,
                  child: _buildLoginForm(authProvider, themeProvider),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// 构建登录表单
  Widget _buildLoginForm(AuthProvider authProvider, ThemeProvider themeProvider) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 400),
      child: Card(
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // 应用Logo和标题
                _buildHeader(),
                
                const SizedBox(height: 32),
                
                // 用户名输入框
                _buildUsernameField(),
                
                const SizedBox(height: 16),
                
                // 密码输入框
                _buildPasswordField(),
                
                const SizedBox(height: 16),
                
                // 记住我选项
                _buildRememberMeRow(),
                
                const SizedBox(height: 24),
                
                // 错误消息
                if (_errorMessage != null) _buildErrorMessage(),
                
                // 登录按钮
                _buildLoginButton(authProvider),
                
                const SizedBox(height: 16),
                
                // 忘记密码和演示登录
                _buildActionButtons(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// 构建头部
  Widget _buildHeader() {
    return Column(
      children: [
        // 应用图标
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: Theme.of(context).primaryColor,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Theme.of(context).primaryColor.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Icon(
            Icons.photo_library,
            size: 40,
            color: Theme.of(context).colorScheme.onPrimary,
          ),
        ),
        
        const SizedBox(height: 16),
        
        // 应用标题
        Text(
          'PokeDex Flutter',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: Theme.of(context).primaryColor,
          ),
        ),
        
        const SizedBox(height: 8),
        
        // 副标题
        Text(
          '欢迎回来',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: Theme.of(context).textTheme.bodyLarge?.color?.withValues(alpha: 0.7),
          ),
        ),
      ],
    );
  }

  /// 构建用户名输入框
  Widget _buildUsernameField() {
    return Semantics(
      label: '用户名输入框',
      hint: '请输入您的用户名，至少3个字符',
      child: TextFormField(
        controller: _usernameController,
        decoration: InputDecoration(
          labelText: '用户名',
          hintText: '请输入用户名',
          prefixIcon: const Icon(Icons.person_outline),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          filled: true,
          fillColor: Theme.of(context).colorScheme.surface,
        ),
        textInputAction: TextInputAction.next,
        autocorrect: false,
        enableSuggestions: false,
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return '请输入用户名';
          }
          if (value.trim().length < 3) {
            return '用户名至少3个字符';
          }
          return null;
        },
      ),
    );
  }

  /// 构建密码输入框
  Widget _buildPasswordField() {
    return Semantics(
      label: '密码输入框',
      hint: '请输入您的密码，至少6个字符',
      child: TextFormField(
        controller: _passwordController,
        obscureText: !_isPasswordVisible,
        decoration: InputDecoration(
          labelText: '密码',
          hintText: '请输入密码',
          prefixIcon: const Icon(Icons.lock_outline),
          suffixIcon: Semantics(
            label: _isPasswordVisible ? '隐藏密码' : '显示密码',
            child: IconButton(
              icon: Icon(
                _isPasswordVisible ? Icons.visibility_off : Icons.visibility,
              ),
              onPressed: () {
                setState(() {
                  _isPasswordVisible = !_isPasswordVisible;
                });
              },
            ),
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          filled: true,
          fillColor: Theme.of(context).colorScheme.surface,
        ),
        textInputAction: TextInputAction.done,
        onFieldSubmitted: (_) => _handleLogin(),
        autocorrect: false,
        enableSuggestions: false,
        validator: (value) {
          if (value == null || value.isEmpty) {
            return '请输入密码';
          }
          if (value.length < 6) {
            return '密码至少6个字符';
          }
          return null;
        },
      ),
    );
  }

  /// 构建记住我选项
  Widget _buildRememberMeRow() {
    return Row(
      children: [
        Checkbox(
          value: _rememberMe,
          onChanged: (value) {
            setState(() {
              _rememberMe = value ?? false;
            });
          },
        ),
        const Text('记住我'),
        const Spacer(),
        TextButton(
          onPressed: _handleForgotPassword,
          child: const Text('忘记密码？'),
        ),
      ],
    );
  }

  /// 构建错误消息
  Widget _buildErrorMessage() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Theme.of(context).colorScheme.error.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.error_outline,
            color: Theme.of(context).colorScheme.error,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _errorMessage!,
              style: TextStyle(
                color: Theme.of(context).colorScheme.error,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// 构建登录按钮
  Widget _buildLoginButton(AuthProvider authProvider) {
    return SizedBox(
      width: double.infinity,
      height: 48,
      child: Semantics(
        label: '登录按钮',
        hint: authProvider.isLoading ? '正在登录中...' : '点击进行登录',
        button: true,
        child: ElevatedButton(
          onPressed: authProvider.isLoading ? null : _handleLogin,
          style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 2,
          ),
          child: authProvider.isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text(
                  '登录',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
        ),
      ),
    );
  }

  /// 构建操作按钮
  Widget _buildActionButtons() {
    return Column(
      children: [
        // 分割线
        Row(
          children: [
            const Expanded(child: Divider()),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                '或者',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).textTheme.bodySmall?.color?.withValues(alpha: 0.6),
                ),
              ),
            ),
            const Expanded(child: Divider()),
          ],
        ),
        
        const SizedBox(height: 16),
        
        // 演示登录按钮
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton.icon(
            onPressed: _handleDemoLogin,
            icon: const Icon(Icons.play_arrow),
            label: const Text('使用演示账号登录'),
            style: OutlinedButton.styleFrom(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
      ],
    );
  }
} 
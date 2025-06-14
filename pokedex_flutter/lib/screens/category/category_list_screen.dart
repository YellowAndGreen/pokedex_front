import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/category_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../models/category.dart' as models;
import '../../widgets/category_card.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_message.dart';
import '../../widgets/empty_state.dart';
import '../../app.dart';

/// 分类列表屏幕
/// 对应React项目中的CategoryList组件
/// 显示所有图片分类的网格视图
class CategoryListScreen extends StatefulWidget {
  const CategoryListScreen({super.key});

  @override
  State<CategoryListScreen> createState() => _CategoryListScreenState();
}

class _CategoryListScreenState extends State<CategoryListScreen> 
    with TickerProviderStateMixin {
  
  // 控制器
  late final ScrollController _scrollController;
  late final TextEditingController _searchController;
  late final AnimationController _fabAnimationController;
  late final Animation<double> _fabAnimation;
  
  // 状态变量
  bool _isSearchExpanded = false;
  String _searchQuery = '';
  String _selectedSortOption = 'name';
  bool _isAscending = true;
  
  @override
  void initState() {
    super.initState();
    
    // 初始化控制器
    _scrollController = ScrollController();
    _searchController = TextEditingController();
    _fabAnimationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _fabAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fabAnimationController,
      curve: Curves.easeInOut,
    ));
    
    // 监听滚动
    _scrollController.addListener(_onScroll);
    
    // 监听搜索输入
    _searchController.addListener(_onSearchChanged);
    
    // 初始化动画
    _fabAnimationController.forward();
    
    // 加载数据
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadCategories();
    });
  }
  
  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    _fabAnimationController.dispose();
    super.dispose();
  }
  
  /// 滚动监听
  void _onScroll() {
    // 在这里可以实现无限滚动或其他滚动相关功能
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent - 200) {
      // 接近底部时加载更多数据
      _loadMoreCategories();
    }
  }
  
  /// 搜索输入监听
  void _onSearchChanged() {
    setState(() {
      _searchQuery = _searchController.text;
    });
    
    // 延迟搜索，避免频繁请求
    Future.delayed(const Duration(milliseconds: 300), () {
      if (_searchController.text == _searchQuery) {
        _performSearch();
      }
    });
  }
  
  /// 加载分类数据
  Future<void> _loadCategories() async {
    final categoryProvider = context.read<CategoryProvider>();
    await categoryProvider.loadCategories();
  }
  
  /// 加载更多分类数据
  Future<void> _loadMoreCategories() async {
    final categoryProvider = context.read<CategoryProvider>();
    if (categoryProvider.hasMore && !categoryProvider.isLoading) {
      await categoryProvider.loadMoreCategories();
    }
  }
  
  /// 执行搜索
  Future<void> _performSearch() async {
    final categoryProvider = context.read<CategoryProvider>();
    await categoryProvider.searchCategories(_searchQuery);
  }
  
  /// 刷新数据
  Future<void> _refreshCategories() async {
    final categoryProvider = context.read<CategoryProvider>();
    await categoryProvider.refreshCategories();
  }
  
  /// 切换搜索栏展开状态
  void _toggleSearch() {
    setState(() {
      _isSearchExpanded = !_isSearchExpanded;
      if (!_isSearchExpanded) {
        _searchController.clear();
        _searchQuery = '';
        _performSearch(); // 清空搜索结果
      }
    });
  }
  
  /// 显示排序选项
  void _showSortOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => _buildSortBottomSheet(),
    );
  }
  
  /// 应用排序
  void _applySorting(String sortOption, bool ascending) {
    setState(() {
      _selectedSortOption = sortOption;
      _isAscending = ascending;
    });
    
    final categoryProvider = context.read<CategoryProvider>();
    categoryProvider.sortCategories(sortOption, ascending);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: _buildBody(),
      floatingActionButton: _buildFloatingActionButton(),
      drawer: _buildDrawer(),
    );
  }
  
  /// 构建应用栏
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: _isSearchExpanded ? _buildSearchField() : const Text('图片分类'),
      elevation: 0,
      actions: [
        // 搜索按钮
        IconButton(
          icon: Icon(_isSearchExpanded ? Icons.close : Icons.search),
          onPressed: _toggleSearch,
        ),
        
        // 排序按钮
        IconButton(
          icon: const Icon(Icons.sort),
          onPressed: _showSortOptions,
        ),
        
        // 更多选项
        PopupMenuButton<String>(
          onSelected: _handleMenuAction,
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'refresh',
              child: ListTile(
                leading: Icon(Icons.refresh),
                title: Text('刷新'),
                contentPadding: EdgeInsets.zero,
              ),
            ),
            const PopupMenuItem(
              value: 'analytics',
              child: ListTile(
                leading: Icon(Icons.analytics),
                title: Text('数据分析'),
                contentPadding: EdgeInsets.zero,
              ),
            ),
            const PopupMenuItem(
              value: 'settings',
              child: ListTile(
                leading: Icon(Icons.settings),
                title: Text('设置'),
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ],
        ),
      ],
    );
  }
  
  /// 构建搜索输入框
  Widget _buildSearchField() {
    return TextField(
      controller: _searchController,
      autofocus: true,
      decoration: const InputDecoration(
        hintText: '搜索分类...',
        border: InputBorder.none,
        hintStyle: TextStyle(color: Colors.white70),
      ),
      style: const TextStyle(color: Colors.white),
    );
  }
  
  /// 构建主体内容
  Widget _buildBody() {
    return Consumer<CategoryProvider>(
      builder: (context, categoryProvider, child) {
        // 加载状态
        if (categoryProvider.isLoading && categoryProvider.categories.isEmpty) {
          return const LoadingIndicator(message: '正在加载分类...');
        }
        
        // 错误状态
        if (categoryProvider.hasError && categoryProvider.categories.isEmpty) {
          return ErrorMessage(
            message: categoryProvider.error!,
            onRetry: _loadCategories,
          );
        }
        
        // 空状态
        if (categoryProvider.categories.isEmpty) {
          return EmptyState(
            icon: Icons.photo_library_outlined,
            title: '暂无分类',
            subtitle: _searchQuery.isNotEmpty 
                ? '没有找到匹配的分类' 
                : '还没有创建任何分类',
            actionText: '创建分类',
            onAction: _createNewCategory,
          );
        }
        
        // 分类列表
        return RefreshIndicator(
          onRefresh: _refreshCategories,
          child: _buildCategoryGrid(categoryProvider),
        );
      },
    );
  }
  
  /// 构建分类网格
  Widget _buildCategoryGrid(CategoryProvider categoryProvider) {
    return CustomScrollView(
      controller: _scrollController,
      slivers: [
        // 网格内容
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.8,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final category = categoryProvider.categories[index];
                return CategoryCard(
                  category: category,
                  onTap: () => _navigateToCategoryDetail(category),
                  onLongPress: () => _showCategoryOptions(category),
                );
              },
              childCount: categoryProvider.categories.length,
            ),
          ),
        ),
        
        // 加载更多指示器
        if (categoryProvider.isLoadingMore)
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator()),
            ),
          ),
      ],
    );
  }
  
  /// 构建浮动操作按钮
  Widget _buildFloatingActionButton() {
    return ScaleTransition(
      scale: _fabAnimation,
      child: FloatingActionButton(
        onPressed: _createNewCategory,
        child: const Icon(Icons.add),
      ),
    );
  }
  
  /// 构建侧边栏
  Widget _buildDrawer() {
    return Drawer(
      child: Consumer2<AuthProvider, ThemeProvider>(
        builder: (context, authProvider, themeProvider, child) {
          return ListView(
            padding: EdgeInsets.zero,
            children: [
              // 用户信息头部
              DrawerHeader(
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.white,
                      child: Text(
                        authProvider.user?.username?.substring(0, 1).toUpperCase() ?? 'U',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      authProvider.user?.username ?? '用户',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      authProvider.user?.email ?? '',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              
              // 菜单项
              ListTile(
                leading: const Icon(Icons.home),
                title: const Text('首页'),
                onTap: () => _handleDrawerAction('home'),
              ),
              ListTile(
                leading: const Icon(Icons.search),
                title: const Text('搜索'),
                onTap: () => _handleDrawerAction('search'),
              ),
              ListTile(
                leading: const Icon(Icons.analytics),
                title: const Text('数据分析'),
                onTap: () => _handleDrawerAction('analytics'),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.brightness_6),
                title: const Text('主题切换'),
                trailing: Switch(
                  value: themeProvider.isDarkMode,
                  onChanged: (_) => themeProvider.toggleTheme(),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('设置'),
                onTap: () => _handleDrawerAction('settings'),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text('退出登录'),
                onTap: () => _handleDrawerAction('logout'),
              ),
            ],
          );
        },
      ),
    );
  }
  
  /// 构建排序底部面板
  Widget _buildSortBottomSheet() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '排序选项',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          
          // 排序字段选择
          _buildSortOption('name', '按名称排序'),
          _buildSortOption('created_at', '按创建时间排序'),
          _buildSortOption('updated_at', '按更新时间排序'),
          _buildSortOption('image_count', '按图片数量排序'),
          
          const SizedBox(height: 16),
          
          // 排序方向选择
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    _applySorting(_selectedSortOption, true);
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.arrow_upward),
                  label: const Text('升序'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isAscending 
                        ? Theme.of(context).primaryColor 
                        : null,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    _applySorting(_selectedSortOption, false);
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.arrow_downward),
                  label: const Text('降序'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: !_isAscending 
                        ? Theme.of(context).primaryColor 
                        : null,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  /// 构建排序选项
  Widget _buildSortOption(String value, String label) {
    return RadioListTile<String>(
      title: Text(label),
      value: value,
      groupValue: _selectedSortOption,
      onChanged: (value) {
        setState(() {
          _selectedSortOption = value!;
        });
      },
    );
  }
  
  /// 处理菜单操作
  void _handleMenuAction(String action) {
    switch (action) {
      case 'refresh':
        _refreshCategories();
        break;
      case 'analytics':
        AppNavigation.goAnalytics(context);
        break;
      case 'settings':
        // TODO: 导航到设置页面
        break;
    }
  }
  
  /// 处理侧边栏操作
  void _handleDrawerAction(String action) {
    Navigator.pop(context); // 关闭侧边栏
    
    switch (action) {
      case 'home':
        // 已经在首页
        break;
      case 'search':
        AppNavigation.goSearch(context);
        break;
      case 'analytics':
        AppNavigation.goAnalytics(context);
        break;
      case 'settings':
        // TODO: 导航到设置页面
        break;
      case 'logout':
        _showLogoutConfirmation();
        break;
    }
  }
  
  /// 导航到分类详情
  void _navigateToCategoryDetail(models.Category category) {
    AppNavigation.goCategoryDetail(context, category.id);
  }
  
  /// 显示分类选项
  void _showCategoryOptions(models.Category category) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.edit),
              title: const Text('编辑分类'),
              onTap: () {
                Navigator.pop(context);
                _editCategory(category);
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete),
              title: const Text('删除分类'),
              onTap: () {
                Navigator.pop(context);
                _deleteCategory(category);
              },
            ),
          ],
        ),
      ),
    );
  }
  
  /// 创建新分类
  void _createNewCategory() {
    // TODO: 显示创建分类对话框
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('创建分类'),
        content: const Text('创建分类功能即将推出'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }
  
  /// 编辑分类
  void _editCategory(models.Category category) {
    // TODO: 显示编辑分类对话框
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('编辑分类'),
        content: Text('编辑分类 "${category.name}" 功能即将推出'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }
  
  /// 删除分类
  void _deleteCategory(models.Category category) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('删除分类'),
        content: Text('确定要删除分类 "${category.name}" 吗？此操作不可撤销。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final categoryProvider = context.read<CategoryProvider>();
              await categoryProvider.deleteCategory(category.id);
            },
            child: const Text('删除'),
          ),
        ],
      ),
    );
  }
  
  /// 显示退出登录确认
  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('退出登录'),
        content: const Text('确定要退出登录吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final authProvider = context.read<AuthProvider>();
              await authProvider.logout();
            },
            child: const Text('退出'),
          ),
        ],
      ),
    );
  }
} 
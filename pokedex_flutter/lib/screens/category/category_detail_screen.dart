import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/category_provider.dart';
import '../../providers/theme_provider.dart';
import '../../models/image.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_message.dart';
import '../../widgets/empty_state.dart';

/// 分类详情屏幕
/// 显示分类下的所有图片，支持网格显示、搜索、上传、批量管理等功能
class CategoryDetailScreen extends StatefulWidget {
  final String categoryId;
  
  const CategoryDetailScreen({
    super.key,
    required this.categoryId,
  });

  @override
  State<CategoryDetailScreen> createState() => _CategoryDetailScreenState();
}

class _CategoryDetailScreenState extends State<CategoryDetailScreen>
    with TickerProviderStateMixin {
  
  // 动画控制器
  late AnimationController _fabAnimationController;
  late AnimationController _selectionAnimationController;
  
  // 搜索控制器
  final TextEditingController _searchController = TextEditingController();
  
  // 状态变量
  bool _isSelectionMode = false;
  bool _isSearching = false;
  String _searchQuery = '';
  String _sortBy = 'created_at';
  bool _sortAscending = false;

  @override
  void initState() {
    super.initState();
    
    // 初始化动画控制器
    _fabAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _selectionAnimationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    
    // 加载分类详情
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadCategoryDetail();
    });
  }

  @override
  void dispose() {
    _fabAnimationController.dispose();
    _selectionAnimationController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  /// 加载分类详情
  Future<void> _loadCategoryDetail() async {
    final categoryProvider = context.read<CategoryProvider>();
    await categoryProvider.loadCategoryDetail(widget.categoryId);
  }

  /// 切换选择模式
  void _toggleSelectionMode() {
    setState(() {
      _isSelectionMode = !_isSelectionMode;
    });
    
    if (_isSelectionMode) {
      _selectionAnimationController.forward();
    } else {
      _selectionAnimationController.reverse();
      // 清除所有选择
      context.read<CategoryProvider>().clearSelection();
    }
  }

  /// 切换搜索模式
  void _toggleSearch() {
    setState(() {
      _isSearching = !_isSearching;
    });
    
    if (!_isSearching) {
      _searchController.clear();
      _searchQuery = '';
      _applyFilters();
    }
  }

  /// 应用搜索和排序过滤
  void _applyFilters() {
    final categoryProvider = context.read<CategoryProvider>();
    // 这里可以实现本地过滤逻辑
    // 暂时使用简单的搜索
  }

  /// 处理图片上传
  Future<void> _handleImageUpload() async {
    // 显示上传选项对话框
    showModalBottomSheet(
      context: context,
      builder: (context) => _buildUploadOptionsSheet(),
    );
  }

  /// 处理批量删除
  Future<void> _handleBatchDelete() async {
    final categoryProvider = context.read<CategoryProvider>();
    final selectedCount = categoryProvider.selectedImageCount;
    
    if (selectedCount == 0) return;
    
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('确认删除'),
        content: Text('确定要删除选中的 $selectedCount 张图片吗？此操作不可撤销。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('删除'),
          ),
        ],
      ),
    );
    
    if (confirmed == true) {
      final success = await categoryProvider.deleteSelectedImages();
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('成功删除 $selectedCount 张图片'),
            backgroundColor: Colors.green,
          ),
        );
        _toggleSelectionMode();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CategoryProvider>(
      builder: (context, categoryProvider, child) {
        final category = categoryProvider.selectedCategory;
        final images = categoryProvider.currentImages;
        final isLoading = categoryProvider.isLoadingCategoryDetail;
        final hasError = categoryProvider.hasError;
        
        return Scaffold(
          appBar: _buildAppBar(category?.name ?? '分类详情', categoryProvider),
          body: _buildBody(images, isLoading, hasError, categoryProvider),
          floatingActionButton: _buildFloatingActionButton(categoryProvider),
          bottomNavigationBar: _isSelectionMode 
              ? _buildSelectionBottomBar(categoryProvider)
              : null,
        );
      },
    );
  }

  /// 构建应用栏
  PreferredSizeWidget _buildAppBar(String title, CategoryProvider categoryProvider) {
    if (_isSelectionMode) {
      return AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: _toggleSelectionMode,
        ),
        title: Text('已选择 ${categoryProvider.selectedImageCount} 项'),
        actions: [
          IconButton(
            icon: const Icon(Icons.select_all),
            onPressed: categoryProvider.selectAllImages,
          ),
        ],
      );
    }
    
    return AppBar(
      title: _isSearching ? _buildSearchField() : Text(title),
      actions: [
        if (!_isSearching) ...[
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: _toggleSearch,
          ),
          IconButton(
            icon: const Icon(Icons.sort),
            onPressed: _showSortOptions,
          ),
          PopupMenuButton<String>(
            onSelected: _handleMenuAction,
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'select',
                child: ListTile(
                  leading: Icon(Icons.checklist),
                  title: Text('批量选择'),
                ),
              ),
              const PopupMenuItem(
                value: 'refresh',
                child: ListTile(
                  leading: Icon(Icons.refresh),
                  title: Text('刷新'),
                ),
              ),
            ],
          ),
        ] else ...[
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: _toggleSearch,
          ),
        ],
      ],
    );
  }

  /// 构建搜索输入框
  Widget _buildSearchField() {
    return TextField(
      controller: _searchController,
      autofocus: true,
      decoration: const InputDecoration(
        hintText: '搜索图片...',
        border: InputBorder.none,
      ),
      onChanged: (value) {
        setState(() {
          _searchQuery = value;
        });
        _applyFilters();
      },
    );
  }

  /// 构建主体内容
  Widget _buildBody(List<ImageModel> images, bool isLoading, bool hasError, CategoryProvider categoryProvider) {
    if (isLoading) {
      return const LoadingIndicator(message: '加载图片中...');
    }
    
    if (hasError) {
      return ErrorMessage(
        message: categoryProvider.error ?? '加载失败',
        onRetry: _loadCategoryDetail,
      );
    }
    
    if (images.isEmpty) {
      return EmptyState(
        icon: Icons.photo_library_outlined,
        title: '暂无图片',
        subtitle: '这个分类还没有图片，点击右下角按钮上传第一张图片吧！',
        actionText: '上传图片',
        onAction: _handleImageUpload,
      );
    }
    
    return RefreshIndicator(
      onRefresh: _loadCategoryDetail,
      child: _buildImageGrid(images, categoryProvider),
    );
  }

  /// 构建图片网格
  Widget _buildImageGrid(List<ImageModel> images, CategoryProvider categoryProvider) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: MasonryGridView.count(
        crossAxisCount: _getCrossAxisCount(),
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        itemCount: images.length,
        itemBuilder: (context, index) {
          final image = images[index];
          return _buildImageCard(image, categoryProvider);
        },
      ),
    );
  }

  /// 获取网格列数
  int _getCrossAxisCount() {
    final width = MediaQuery.of(context).size.width;
    if (width > 1200) return 4;
    if (width > 800) return 3;
    return 2;
  }

  /// 构建图片卡片
  Widget _buildImageCard(ImageModel image, CategoryProvider categoryProvider) {
    final isSelected = categoryProvider.isImageSelected(image.id);
    
    return GestureDetector(
      onTap: () => _handleImageTap(image, categoryProvider),
      onLongPress: () => _handleImageLongPress(image, categoryProvider),
      child: Stack(
        children: [
          // 图片容器
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: isSelected
                  ? Border.all(
                      color: Theme.of(context).primaryColor,
                      width: 3,
                    )
                  : null,
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CachedNetworkImage(
                imageUrl: image.thumbnailUrl ?? image.imageUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  height: 200,
                  color: Colors.grey[300],
                  child: const Center(
                    child: CircularProgressIndicator(),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  height: 200,
                  color: Colors.grey[300],
                  child: const Icon(Icons.error),
                ),
              ),
            ),
          ),
          
          // 选择指示器
          if (_isSelectionMode)
            Positioned(
              top: 8,
              right: 8,
              child: AnimatedScale(
                scale: isSelected ? 1.0 : 0.8,
                duration: const Duration(milliseconds: 200),
                child: Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Theme.of(context).primaryColor
                        : Colors.white.withValues(alpha: 0.8),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Theme.of(context).primaryColor,
                      width: 2,
                    ),
                  ),
                  child: isSelected
                      ? const Icon(
                          Icons.check,
                          size: 16,
                          color: Colors.white,
                        )
                      : null,
                ),
              ),
            ),
          
          // 图片信息覆盖层
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(12),
                  bottomRight: Radius.circular(12),
                ),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.7),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (image.originalFilename != null)
                    Text(
                      image.originalFilename!,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  Text(
                    _formatFileSize(image.sizeBytes),
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// 处理图片点击
  void _handleImageTap(ImageModel image, CategoryProvider categoryProvider) {
    if (_isSelectionMode) {
      categoryProvider.toggleImageSelection(image.id);
    } else {
      // 显示图片详情或全屏查看
      _showImageDetail(image);
    }
  }

  /// 处理图片长按
  void _handleImageLongPress(ImageModel image, CategoryProvider categoryProvider) {
    if (!_isSelectionMode) {
      _toggleSelectionMode();
    }
    categoryProvider.toggleImageSelection(image.id);
  }

  /// 显示图片详情
  void _showImageDetail(ImageModel image) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 图片
            CachedNetworkImage(
              imageUrl: image.imageUrl,
              fit: BoxFit.contain,
              placeholder: (context, url) => const CircularProgressIndicator(),
              errorWidget: (context, url, error) => const Icon(Icons.error),
            ),
            
            // 图片信息
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (image.originalFilename != null)
                    Text(
                      image.originalFilename!,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  const SizedBox(height: 8),
                  Text('文件大小: ${_formatFileSize(image.sizeBytes)}'),
                  Text('上传时间: ${_formatDate(image.createdAt)}'),
                ],
              ),
            ),
            
            // 操作按钮
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('关闭'),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _deleteImage(image);
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: Theme.of(context).colorScheme.error,
                  ),
                  child: const Text('删除'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// 删除单张图片
  Future<void> _deleteImage(ImageModel image) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('确认删除'),
        content: const Text('确定要删除这张图片吗？此操作不可撤销。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('删除'),
          ),
        ],
      ),
    );
    
    if (confirmed == true) {
      final categoryProvider = context.read<CategoryProvider>();
      final success = await categoryProvider.deleteImage(image.id);
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('图片删除成功'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  /// 构建浮动操作按钮
  Widget? _buildFloatingActionButton(CategoryProvider categoryProvider) {
    if (_isSelectionMode) return null;
    
    return FloatingActionButton(
      onPressed: _handleImageUpload,
      child: const Icon(Icons.add_a_photo),
    );
  }

  /// 构建选择模式底部栏
  Widget _buildSelectionBottomBar(CategoryProvider categoryProvider) {
    final selectedCount = categoryProvider.selectedImageCount;
    
    return BottomAppBar(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          TextButton.icon(
            onPressed: selectedCount > 0 ? _handleBatchDelete : null,
            icon: const Icon(Icons.delete),
            label: const Text('删除'),
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).colorScheme.error,
            ),
          ),
          TextButton.icon(
            onPressed: selectedCount > 0 ? _handleBatchDownload : null,
            icon: const Icon(Icons.download),
            label: const Text('下载'),
          ),
          TextButton.icon(
            onPressed: selectedCount > 0 ? _handleBatchMove : null,
            icon: const Icon(Icons.drive_file_move),
            label: const Text('移动'),
          ),
        ],
      ),
    );
  }

  /// 构建上传选项表单
  Widget _buildUploadOptionsSheet() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            '选择上传方式',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          ListTile(
            leading: const Icon(Icons.photo_camera),
            title: const Text('拍照'),
            onTap: () {
              Navigator.pop(context);
              _uploadFromCamera();
            },
          ),
          ListTile(
            leading: const Icon(Icons.photo_library),
            title: const Text('从相册选择'),
            onTap: () {
              Navigator.pop(context);
              _uploadFromGallery();
            },
          ),
          ListTile(
            leading: const Icon(Icons.folder),
            title: const Text('从文件选择'),
            onTap: () {
              Navigator.pop(context);
              _uploadFromFiles();
            },
          ),
        ],
      ),
    );
  }

  /// 从相机上传
  Future<void> _uploadFromCamera() async {
    // TODO: 实现相机上传
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('相机上传功能开发中...')),
    );
  }

  /// 从相册上传
  Future<void> _uploadFromGallery() async {
    // TODO: 实现相册上传
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('相册上传功能开发中...')),
    );
  }

  /// 从文件上传
  Future<void> _uploadFromFiles() async {
    // TODO: 实现文件上传
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('文件上传功能开发中...')),
    );
  }

  /// 批量下载
  Future<void> _handleBatchDownload() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('批量下载功能开发中...')),
    );
  }

  /// 批量移动
  Future<void> _handleBatchMove() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('批量移动功能开发中...')),
    );
  }

  /// 显示排序选项
  void _showSortOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              '排序方式',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.access_time),
            title: const Text('按时间排序'),
            trailing: _sortBy == 'created_at' ? const Icon(Icons.check) : null,
            onTap: () {
              setState(() {
                _sortBy = 'created_at';
              });
              Navigator.pop(context);
              _applyFilters();
            },
          ),
          ListTile(
            leading: const Icon(Icons.text_fields),
            title: const Text('按名称排序'),
            trailing: _sortBy == 'filename' ? const Icon(Icons.check) : null,
            onTap: () {
              setState(() {
                _sortBy = 'filename';
              });
              Navigator.pop(context);
              _applyFilters();
            },
          ),
          ListTile(
            leading: const Icon(Icons.storage),
            title: const Text('按大小排序'),
            trailing: _sortBy == 'file_size' ? const Icon(Icons.check) : null,
            onTap: () {
              setState(() {
                _sortBy = 'file_size';
              });
              Navigator.pop(context);
              _applyFilters();
            },
          ),
          const Divider(),
          SwitchListTile(
            title: const Text('升序排列'),
            value: _sortAscending,
            onChanged: (value) {
              setState(() {
                _sortAscending = value;
              });
              _applyFilters();
            },
          ),
        ],
      ),
    );
  }

  /// 处理菜单操作
  void _handleMenuAction(String action) {
    switch (action) {
      case 'select':
        _toggleSelectionMode();
        break;
      case 'refresh':
        _loadCategoryDetail();
        break;
    }
  }

  /// 格式化文件大小
  String _formatFileSize(int? bytes) {
    if (bytes == null) return '未知';
    
    if (bytes < 1024) return '${bytes}B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)}KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)}MB';
  }

  /// 格式化日期
  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 0) {
      return '${difference.inDays}天前';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}小时前';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}分钟前';
    } else {
      return '刚刚';
    }
  }
} 
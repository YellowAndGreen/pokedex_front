import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/category.dart' as models;

/// 分类卡片组件
/// 对应React项目中的CategoryCard组件
/// 显示分类信息，支持点击、长按等交互
class CategoryCard extends StatefulWidget {
  /// 分类数据
  final models.Category category;
  
  /// 点击回调
  final VoidCallback? onTap;
  
  /// 长按回调
  final VoidCallback? onLongPress;
  
  /// 是否被选中
  final bool isSelected;
  
  /// 是否显示选择模式
  final bool showSelection;

  const CategoryCard({
    super.key,
    required this.category,
    this.onTap,
    this.onLongPress,
    this.isSelected = false,
    this.showSelection = false,
  });

  @override
  State<CategoryCard> createState() => _CategoryCardState();
}

class _CategoryCardState extends State<CategoryCard> 
    with SingleTickerProviderStateMixin {
  
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _elevationAnimation;
  
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    
    // 初始化动画控制器
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    
    // 缩放动画
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    
    // 阴影动画
    _elevationAnimation = Tween<double>(
      begin: 4.0,
      end: 8.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  /// 处理按下事件
  void _handleTapDown(TapDownDetails details) {
    setState(() {
      _isPressed = true;
    });
    _animationController.forward();
  }

  /// 处理抬起事件
  void _handleTapUp(TapUpDetails details) {
    setState(() {
      _isPressed = false;
    });
    _animationController.reverse();
  }

  /// 处理取消事件
  void _handleTapCancel() {
    setState(() {
      _isPressed = false;
    });
    _animationController.reverse();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: _buildCard(),
        );
      },
    );
  }

  /// 构建卡片
  Widget _buildCard() {
    return GestureDetector(
      onTap: widget.onTap,
      onLongPress: widget.onLongPress,
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Theme.of(context).cardColor,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: widget.isSelected 
              ? Border.all(
                  color: Theme.of(context).primaryColor,
                  width: 2,
                )
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 图片区域
            Expanded(
              flex: 3,
              child: _buildImageArea(),
            ),
            
            // 信息区域
            Expanded(
              flex: 2,
              child: _buildInfoArea(),
            ),
          ],
        ),
      ),
    );
  }
  
  /// 构建图片区域
  Widget _buildImageArea() {
    return Container(
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
        child: Stack(
          children: [
            // 背景图片
            _buildBackgroundImage(),
            
            // 渐变遮罩
            _buildGradientOverlay(),
            
            // 角标信息
            _buildBadges(),
          ],
        ),
      ),
    );
  }
  
  /// 构建背景图片
  Widget _buildBackgroundImage() {
    // 获取分类的缩略图
    final thumbnailUrl = widget.category.thumbnailUrl;
    
    if (thumbnailUrl != null && thumbnailUrl.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: thumbnailUrl,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        placeholder: (context, url) => _buildImagePlaceholder(),
        errorWidget: (context, url, error) => _buildImageError(),
      );
    } else {
      return _buildImagePlaceholder();
    }
  }
  
  /// 构建图片占位符
  Widget _buildImagePlaceholder() {
    return Container(
      color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.photo_library_outlined,
              size: 32,
              color: Theme.of(context).primaryColor.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 4),
            Text(
              '暂无图片',
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).textTheme.bodySmall?.color?.withValues(alpha: 0.5),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  /// 构建图片错误占位符
  Widget _buildImageError() {
    return Container(
      color: Theme.of(context).colorScheme.error.withValues(alpha: 0.1),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.broken_image_outlined,
              size: 32,
              color: Theme.of(context).colorScheme.error.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 4),
            Text(
              '加载失败',
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.error.withValues(alpha: 0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  /// 构建渐变遮罩
  Widget _buildGradientOverlay() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.transparent,
            Colors.black.withValues(alpha: 0.3),
          ],
        ),
      ),
    );
  }
  
  /// 构建角标
  Widget _buildBadges() {
    return Positioned(
      top: 8,
      right: 8,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 图片数量角标
          if ((widget.category.imageCount ?? 0) > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '${widget.category.imageCount ?? 0}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
    );
  }
  
  /// 构建信息区域
  Widget _buildInfoArea() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 分类名称
          Text(
            widget.category.name,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          
          const SizedBox(height: 4),
          
          // 分类描述
          if (widget.category.description != null && widget.category.description!.isNotEmpty)
            Text(
              widget.category.description!,
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).textTheme.bodySmall?.color?.withValues(alpha: 0.7),
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          
          const Spacer(),
          
          // 底部信息行
          Row(
            children: [
              // 图片数量
              Icon(
                Icons.photo_library_outlined,
                size: 14,
                color: Theme.of(context).textTheme.bodySmall?.color?.withValues(alpha: 0.5),
              ),
              const SizedBox(width: 4),
              Text(
                '${widget.category.imageCount ?? 0} 张',
                style: TextStyle(
                  fontSize: 11,
                  color: Theme.of(context).textTheme.bodySmall?.color?.withValues(alpha: 0.5),
                ),
              ),
              
              const Spacer(),
              
              // 更新时间
              Text(
                _formatDate(widget.category.updatedAt),
                style: TextStyle(
                  fontSize: 10,
                  color: Theme.of(context).textTheme.bodySmall?.color?.withValues(alpha: 0.5),
                ),
              ),
            ],
          ),
        ],
      ),
    );
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

/// Shimmer加载效果组件
class CategoryCardShimmer extends StatefulWidget {
  const CategoryCardShimmer({super.key});

  @override
  State<CategoryCardShimmer> createState() => _CategoryCardShimmerState();
}

class _CategoryCardShimmerState extends State<CategoryCardShimmer>
    with SingleTickerProviderStateMixin {
  
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();
    
    _animation = Tween<double>(
      begin: -1.0,
      end: 2.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: Theme.of(context).cardColor,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 图片区域
              Expanded(
                flex: 3,
                child: Container(
                  decoration: const BoxDecoration(
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                    child: _buildShimmerEffect(),
                  ),
                ),
              ),
              
              // 信息区域
              Expanded(
                flex: 2,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildShimmerLine(width: 120),
                      const SizedBox(height: 8),
                      _buildShimmerLine(width: 80),
                      const Spacer(),
                      Row(
                        children: [
                          _buildShimmerLine(width: 60),
                          const Spacer(),
                          _buildShimmerLine(width: 40),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  Widget _buildShimmerEffect() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          stops: [
            _animation.value - 0.3,
            _animation.value,
            _animation.value + 0.3,
          ],
          colors: [
            Colors.grey[300]!,
            Colors.grey[100]!,
            Colors.grey[300]!,
          ],
        ),
      ),
    );
  }
  
  Widget _buildShimmerLine({required double width}) {
    return Container(
      width: width,
      height: 12,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(6),
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          stops: [
            _animation.value - 0.3,
            _animation.value,
            _animation.value + 0.3,
          ],
          colors: [
            Colors.grey[300]!,
            Colors.grey[100]!,
            Colors.grey[300]!,
          ],
        ),
      ),
    );
  }
} 
import 'package:flutter/material.dart';

/// 加载指示器组件
/// 显示加载状态和可选的消息
class LoadingIndicator extends StatelessWidget {
  /// 加载消息
  final String? message;
  
  /// 大小
  final double size;
  
  /// 颜色
  final Color? color;
  
  /// 是否显示为全屏
  final bool fullScreen;

  const LoadingIndicator({
    super.key,
    this.message,
    this.size = 24.0,
    this.color,
    this.fullScreen = true,
  });

  @override
  Widget build(BuildContext context) {
    final content = Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CircularProgressIndicator(
          strokeWidth: 3,
          color: color ?? Theme.of(context).primaryColor,
        ),
        if (message != null) ...[
          const SizedBox(height: 16),
          Text(
            message!,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
    
    if (fullScreen) {
      return Center(child: content);
    } else {
      return content;
    }
  }
} 
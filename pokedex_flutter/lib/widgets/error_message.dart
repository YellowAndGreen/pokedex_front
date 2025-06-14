import 'package:flutter/material.dart';

/// 错误消息组件
/// 显示错误信息和重试按钮
class ErrorMessage extends StatelessWidget {
  /// 错误消息
  final String message;
  
  /// 重试回调
  final VoidCallback? onRetry;
  
  /// 是否显示为全屏
  final bool fullScreen;
  
  /// 图标
  final IconData? icon;

  const ErrorMessage({
    super.key,
    required this.message,
    this.onRetry,
    this.fullScreen = true,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon ?? Icons.error_outline,
            size: 64,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 16),
          Text(
            '出现错误',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
            ),
            textAlign: TextAlign.center,
          ),
          if (onRetry != null) ...[
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('重试'),
            ),
          ],
        ],
      ),
    );
    
    if (fullScreen) {
      return Center(child: content);
    } else {
      return content;
    }
  }
} 
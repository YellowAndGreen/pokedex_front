import 'package:flutter/material.dart';

/// 空状态组件
/// 显示无数据时的界面
class EmptyState extends StatelessWidget {
  /// 图标
  final IconData icon;
  
  /// 标题
  final String title;
  
  /// 副标题
  final String? subtitle;
  
  /// 操作按钮文本
  final String? actionText;
  
  /// 操作回调
  final VoidCallback? onAction;
  
  /// 是否显示为全屏
  final bool fullScreen;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionText,
    this.onAction,
    this.fullScreen = true,
  });

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 80,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 24),
          Text(
            title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.onSurface,
            ),
            textAlign: TextAlign.center,
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 12),
            Text(
              subtitle!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.outline,
              ),
              textAlign: TextAlign.center,
            ),
          ],
          if (actionText != null && onAction != null) ...[
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: onAction,
              child: Text(actionText!),
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
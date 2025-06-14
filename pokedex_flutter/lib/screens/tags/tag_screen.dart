import 'package:flutter/material.dart';

/// 标签屏幕（占位符）
class TagScreen extends StatelessWidget {
  final String tagName;
  
  const TagScreen({
    super.key,
    required this.tagName,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('标签: $tagName')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.construction, size: 64),
            const SizedBox(height: 16),
            const Text('标签页面开发中...'),
            const SizedBox(height: 8),
            Text('标签: $tagName'),
          ],
        ),
      ),
    );
  }
} 
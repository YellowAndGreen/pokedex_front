import 'package:flutter/material.dart';

/// 搜索屏幕（占位符）
class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('搜索')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.construction, size: 64),
            SizedBox(height: 16),
            Text('搜索页面开发中...'),
          ],
        ),
      ),
    );
  }
} 
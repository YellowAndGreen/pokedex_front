import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:pokedex_flutter/main.dart';
import 'package:pokedex_flutter/providers/auth_provider.dart';
import 'package:pokedex_flutter/providers/category_provider.dart';
import 'package:pokedex_flutter/providers/theme_provider.dart';

void main() {
  testWidgets('Basic widget test', (WidgetTester tester) async {
    // 测试一个简单的Widget
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Text('Hello Flutter'),
        ),
      ),
    );

    // 验证文本显示
    expect(find.text('Hello Flutter'), findsOneWidget);
  });
} 
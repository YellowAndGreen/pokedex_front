import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/category.dart';
import '../models/image.dart';
import '../models/tag.dart';
import '../models/species.dart';
import '../models/auth.dart';

/// API服务类
/// 基于OpenAPI 3.1.0文档实现的图鉴式图片管理工具API客户端
/// 处理所有与后端API的交互
class ApiService {
  /// API基础URL - 根据用户提供的地址配置
  static const String _baseUrl = 'http://39.107.88.124:8000';
  
  /// 单例实例
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  /// 认证令牌
  String? _authToken;

  /// 设置认证令牌
  void setAuthToken(String? token) {
    _authToken = token;
  }

  /// 获取请求头
  Map<String, String> _getHeaders({bool includeAuth = true}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && _authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    
    return headers;
  }

  /// 处理HTTP响应
  T _handleResponse<T>(http.Response response, T Function(Map<String, dynamic>) fromJson) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        final data = json.decode(response.body);
        return fromJson(data);
      } catch (e) {
        throw ApiException('JSON解析错误: $e', response.statusCode);
      }
    } else {
      _throwApiException(response);
    }
  }

  /// 处理HTTP响应（列表）
  List<T> _handleListResponse<T>(http.Response response, T Function(Map<String, dynamic>) fromJson) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => fromJson(item as Map<String, dynamic>)).toList();
      } catch (e) {
        throw ApiException('JSON解析错误: $e', response.statusCode);
      }
    } else {
      _throwApiException(response);
    }
  }

  /// 处理字符串列表响应（用于物种建议）
  List<String> _handleStringListResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        final List<dynamic> data = json.decode(response.body);
        return data.cast<String>();
      } catch (e) {
        throw ApiException('JSON解析错误: $e', response.statusCode);
      }
    } else {
      _throwApiException(response);
    }
  }

  /// 抛出API异常
  Never _throwApiException(http.Response response) {
    try {
      final errorData = json.decode(response.body);
      if (errorData is Map<String, dynamic>) {
        final error = ApiError.fromJson(errorData);
        throw ApiException(error.message, response.statusCode, error);
      }
    } catch (_) {
      // 如果解析错误数据失败，使用默认错误消息
    }
    
    throw ApiException(
      'HTTP错误 ${response.statusCode}: ${response.reasonPhrase}',
      response.statusCode,
    );
  }

  // ===== 认证相关API =====

  /// 发送验证码到邮箱
  /// 对应端点: POST /api/send-verification
  Future<void> sendVerificationCode(String email) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/api/send-verification?email=$email'),
      headers: _getHeaders(includeAuth: false),
    );
    
    if (response.statusCode < 200 || response.statusCode >= 300) {
      _throwApiException(response);
    }
  }

  /// 验证码登录并获取JWT token
  /// 对应端点: POST /api/verify
  Future<AuthResponse> verifyCodeAndLogin(String email, String code) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/api/verify?email=$email&code=$code'),
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleResponse(response, AuthResponse.fromJson);
  }

  /// 测试受保护路由
  /// 对应端点: GET /api/protected-test
  Future<Map<String, dynamic>> testProtectedRoute() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/protected-test'),
      headers: _getHeaders(),
    );
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      _throwApiException(response);
    }
  }

  // ===== 类别相关API =====

  /// 获取所有类别
  /// 对应端点: GET /api/categories/
  Future<List<Category>> getCategories({int skip = 0, int limit = 100}) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/categories/?skip=$skip&limit=$limit'),
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleListResponse(response, Category.fromJson);
  }

  /// 获取特定类别及其图片
  /// 对应端点: GET /api/categories/{category_id}/
  Future<Category> getCategoryWithImages(String categoryId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/categories/$categoryId/'),
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleResponse(response, Category.fromJson);
  }

  /// 获取指定类别下的所有图片
  /// 对应端点: GET /api/categories/{category_id}/images/
  Future<List<ImageModel>> getImagesInCategory(
    String categoryId, {
    int skip = 0,
    int limit = 100,
  }) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/categories/$categoryId/images/?skip=$skip&limit=$limit'),
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleListResponse(response, ImageModel.fromJson);
  }

  /// 创建新类别
  /// 对应端点: POST /api/categories/
  Future<Category> createCategory(CategoryCreate categoryData) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/api/categories/'),
      headers: _getHeaders(),
      body: json.encode(categoryData.toJson()),
    );
    
    return _handleResponse(response, Category.fromJson);
  }

  /// 更新特定类别信息
  /// 对应端点: PATCH /api/categories/{category_id}/
  Future<Category> updateCategory(String categoryId, CategoryUpdate categoryData) async {
    final response = await http.patch(
      Uri.parse('$_baseUrl/api/categories/$categoryId/'),
      headers: _getHeaders(),
      body: json.encode(categoryData.toJson()),
    );
    
    return _handleResponse(response, Category.fromJson);
  }

  /// 删除特定类别
  /// 对应端点: DELETE /api/categories/{category_id}/
  Future<void> deleteCategory(String categoryId) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/api/categories/$categoryId/'),
      headers: _getHeaders(),
    );
    
    if (response.statusCode < 200 || response.statusCode >= 300) {
      _throwApiException(response);
    }
  }

  // ===== 图片相关API =====

  /// 上传新图片
  /// 对应端点: POST /api/images/upload/
  Future<ImageModel> uploadImage({
    required String categoryId,
    required File imageFile,
    String? title,
    String? description,
    List<String>? tags,
    bool setAsCategoryThumbnail = false,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/images/upload/');
    final request = http.MultipartRequest('POST', uri);
    
    // 添加认证头
    if (_authToken != null) {
      request.headers['Authorization'] = 'Bearer $_authToken';
    }
    
    // 添加表单字段
    request.fields['category_id'] = categoryId;
    if (title != null) request.fields['title'] = title;
    if (description != null) request.fields['description'] = description;
    if (tags != null && tags.isNotEmpty) {
      request.fields['tags'] = tags.join(',');
    }
    request.fields['set_as_category_thumbnail'] = setAsCategoryThumbnail.toString();
    
    // 添加文件
    request.files.add(await http.MultipartFile.fromPath('file', imageFile.path));
    
    final response = await request.send();
    final responseBody = await response.stream.bytesToString();
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        final data = json.decode(responseBody);
        return ImageModel.fromJson(data);
      } catch (e) {
        throw ApiException('JSON解析错误: $e', response.statusCode);
      }
    } else {
      throw ApiException(
        '上传失败 ${response.statusCode}: $responseBody',
        response.statusCode,
      );
    }
  }

  /// 获取所有图片
  /// 对应端点: GET /api/images/
  Future<List<ImageModel>> getAllImages({int skip = 0, int limit = 100}) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/images/?skip=$skip&limit=$limit'),
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleListResponse(response, ImageModel.fromJson);
  }

  /// 根据ID获取指定图片的元数据
  /// 对应端点: GET /api/images/{image_id}/
  Future<ImageModel> getImageById(String imageId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/images/$imageId/'),
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleResponse(response, ImageModel.fromJson);
  }

  /// 根据ID获取单个图片对象的详细信息
  /// 对应端点: GET /api/images/{image_id}
  Future<ImageModel> getImageDetails(String imageId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/images/$imageId'),
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleResponse(response, ImageModel.fromJson);
  }

  /// 根据标签名称搜索图片
  /// 对应端点: GET /api/images/by-tags/
  Future<List<ImageModel>> searchImagesByTags({
    required List<String> tags,
    bool matchAll = false,
    int skip = 0,
    int limit = 100,
  }) async {
    final queryParams = <String, String>{
      'match_all': matchAll.toString(),
      'skip': skip.toString(),
      'limit': limit.toString(),
    };
    
    // 添加多个tag参数
    final uri = Uri.parse('$_baseUrl/api/images/by-tags/');
    final uriWithTags = uri.replace(
      queryParameters: {
        ...queryParams,
        for (int i = 0; i < tags.length; i++) 'tag': tags,
      },
    );
    
    final response = await http.get(
      uriWithTags,
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleListResponse(response, ImageModel.fromJson);
  }

  /// 更新图片元数据
  /// 对应端点: PUT /api/images/{image_id}/
  Future<ImageModel> updateImageMetadata(String imageId, ImageUpdate imageData) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/api/images/$imageId/'),
      headers: _getHeaders(),
      body: json.encode(imageData.toJson()),
    );
    
    return _handleResponse(response, ImageModel.fromJson);
  }

  /// 删除图片
  /// 对应端点: DELETE /api/images/{image_id}/
  Future<void> deleteImage(String imageId) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/api/images/$imageId/'),
      headers: _getHeaders(),
    );
    
    if (response.statusCode < 200 || response.statusCode >= 300) {
      _throwApiException(response);
    }
  }

  // ===== 物种信息相关API =====

  /// 获取物种中文名搜索建议列表
  /// 对应端点: GET /api/suggestions
  Future<List<String>> getSpeciesSuggestions({
    required String query,
    int limit = 10,
  }) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/suggestions?q=$query&limit=$limit'),
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleStringListResponse(response);
  }

  /// 根据物种的精确中文名获取其完整的详细信息
  /// 对应端点: GET /api/details/{chinese_name}
  Future<Species> getSpeciesDetails(String chineseName) async {
    // URL编码中文名
    final encodedName = Uri.encodeComponent(chineseName);
    final response = await http.get(
      Uri.parse('$_baseUrl/api/details/$encodedName'),
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleResponse(response, Species.fromJson);
  }

  // ===== 标签相关API =====

  /// 获取所有标签的列表
  /// 对应端点: GET /api/tags/
  Future<List<Tag>> getAllTags({int skip = 0, int limit = 100}) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/tags/?skip=$skip&limit=$limit'),
      headers: _getHeaders(includeAuth: false),
    );
    
    return _handleListResponse(response, Tag.fromJson);
  }
}

/// API异常类
class ApiException implements Exception {
  final String message;
  final int statusCode;
  final ApiError? error;

  ApiException(this.message, this.statusCode, [this.error]);

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

/// API错误响应模型
class ApiError {
  final String message;
  final String? type;
  final List<ValidationError>? detail;

  ApiError({
    required this.message,
    this.type,
    this.detail,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      message: json['message'] ?? 'Unknown error',
      type: json['type'],
      detail: json['detail'] != null 
        ? (json['detail'] as List).map((e) => ValidationError.fromJson(e)).toList()
        : null,
    );
  }
}

/// 验证错误模型
class ValidationError {
  final List<dynamic> loc;
  final String msg;
  final String type;

  ValidationError({
    required this.loc,
    required this.msg,
    required this.type,
  });

  factory ValidationError.fromJson(Map<String, dynamic> json) {
    return ValidationError(
      loc: json['loc'] ?? [],
      msg: json['msg'] ?? '',
      type: json['type'] ?? '',
    );
  }
} 
import 'package:flutter/foundation.dart';
import 'dart:io';
import '../models/category.dart' as models;
import '../models/image.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

/// 分类状态管理提供者
/// 对应React项目中的CategoryContext
/// 管理分类数据、图片数据和相关UI状态
class CategoryProvider with ChangeNotifier {
  /// API服务实例
  final ApiService _apiService = ApiService();
  
  /// 存储服务实例
  final StorageService _storageService = StorageService();

  // ===== 状态变量 =====
  
  /// 分类列表
  List<models.Category> _categories = [];
  
  /// 当前选中的分类
  models.Category? _selectedCategory;
  
  /// 当前分类的图片列表
  List<ImageModel> _currentImages = [];
  
  /// 是否正在加载分类列表
  bool _isLoadingCategories = false;
  
  /// 是否正在加载分类详情
  bool _isLoadingCategoryDetail = false;
  
  /// 是否正在上传图片
  bool _isUploadingImage = false;
  
  /// 错误消息
  String? _error;
  
  /// 搜索查询
  String _searchQuery = '';
  
  /// 过滤的分类列表（基于搜索）
  List<models.Category> _filteredCategories = [];
  
  /// 选中的图片（用于批量操作）
  Set<String> _selectedImages = {};

  // ===== Getters =====
  
  /// 获取分类列表
  List<models.Category> get categories => _categories;
  
  /// 获取过滤后的分类列表
  List<models.Category> get filteredCategories => 
      _searchQuery.isEmpty ? _categories : _filteredCategories;
  
  /// 获取当前选中的分类
  models.Category? get selectedCategory => _selectedCategory;
  
  /// 获取当前分类的图片列表
  List<ImageModel> get currentImages => _currentImages;
  
  /// 获取分类加载状态
  bool get isLoadingCategories => _isLoadingCategories;
  
  /// 获取分类详情加载状态
  bool get isLoadingCategoryDetail => _isLoadingCategoryDetail;
  
  /// 获取图片上传状态
  bool get isUploadingImage => _isUploadingImage;
  
  /// 获取错误消息
  String? get error => _error;
  
  /// 获取搜索查询
  String get searchQuery => _searchQuery;
  
  /// 获取选中的图片ID集合
  Set<String> get selectedImages => _selectedImages;
  
  /// 检查是否有错误
  bool get hasError => _error != null;
  
  /// 检查是否有选中的图片
  bool get hasSelectedImages => _selectedImages.isNotEmpty;
  
  /// 获取选中图片的数量
  int get selectedImageCount => _selectedImages.length;
  
  /// 是否有更多数据可加载
  bool get hasMore => false; // 简单实现，实际可根据分页逻辑调整
  
  /// 是否正在加载更多数据
  bool get isLoadingMore => false; // 简单实现
  
  /// 是否正在加载（通用）
  bool get isLoading => _isLoadingCategories;

  // ===== 构造函数 =====
  
  /// 构造函数
  /// 自动加载分类数据
  CategoryProvider() {
    _loadInitialData();
  }

  // ===== 私有方法 =====
  
  /// 加载初始数据
  Future<void> _loadInitialData() async {
    // 先尝试从缓存加载
    await _loadCachedCategories();
    
    // 然后从网络刷新
    await loadCategories(useCache: false);
  }
  
  /// 从缓存加载分类
  Future<void> _loadCachedCategories() async {
    try {
      final cachedCategories = await _storageService.getCachedCategories();
      if (cachedCategories != null && cachedCategories.isNotEmpty) {
        _categories = cachedCategories;
        _applySearchFilter();
        notifyListeners();
      }
    } catch (e) {
      // 缓存加载失败，忽略错误
    }
  }
  
  /// 设置加载状态
  void _setLoadingCategories(bool loading) {
    _isLoadingCategories = loading;
    notifyListeners();
  }
  
  /// 设置分类详情加载状态
  void _setLoadingCategoryDetail(bool loading) {
    _isLoadingCategoryDetail = loading;
    notifyListeners();
  }
  
  /// 设置图片上传状态
  void _setUploadingImage(bool uploading) {
    _isUploadingImage = uploading;
    notifyListeners();
  }
  
  /// 设置错误消息
  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }
  
  /// 清除错误消息
  void _clearError() {
    _error = null;
    notifyListeners();
  }
  
  /// 应用搜索过滤
  void _applySearchFilter() {
    if (_searchQuery.isEmpty) {
      _filteredCategories = [];
    } else {
      final query = _searchQuery.toLowerCase();
      _filteredCategories = _categories.where((category) {
        return category.name.toLowerCase().contains(query) ||
               (category.description?.toLowerCase().contains(query) ?? false);
      }).toList();
    }
  }

  // ===== 分类管理方法 =====
  
  /// 加载分类列表
  /// [useCache] 是否优先使用缓存
  /// [forceRefresh] 是否强制刷新
  Future<void> loadCategories({bool useCache = true, bool forceRefresh = false}) async {
    if (_isLoadingCategories && !forceRefresh) return;
    
    try {
      _setLoadingCategories(true);
      _clearError();
      
      // 检查是否需要同步
      if (useCache && !forceRefresh) {
        final needsSync = await _storageService.needsSync();
        if (!needsSync && _categories.isNotEmpty) {
          _setLoadingCategories(false);
          return;
        }
      }
      
      final categories = await _apiService.getCategories();
      _categories = categories;
      
      // 缓存数据
      await _storageService.cacheCategories(categories);
      
      _applySearchFilter();
    } catch (e) {
      _setError('加载分类失败: $e');
    } finally {
      _setLoadingCategories(false);
    }
  }
  
  /// 加载分类详情
  /// [categoryId] 分类ID
  Future<void> loadCategoryDetail(String categoryId) async {
    if (_isLoadingCategoryDetail) return;
    
    try {
      _setLoadingCategoryDetail(true);
      _clearError();
      
      final category = await _apiService.getCategoryWithImages(categoryId);
      _selectedCategory = category;
      _currentImages = category.images ?? [];
      
      // 清除选中的图片
      _selectedImages.clear();
      
    } catch (e) {
      _setError('加载分类详情失败: $e');
    } finally {
      _setLoadingCategoryDetail(false);
    }
  }
  
  /// 创建新分类
  /// [name] 分类名称
  /// [description] 分类描述
  Future<bool> createCategory(String name, {String? description}) async {
    try {
      _clearError();
      
      final categoryData = models.CategoryCreate(
        name: name,
        description: description,
      );
      
      final newCategory = await _apiService.createCategory(categoryData);
      
      // 添加到本地列表
      _categories.insert(0, newCategory);
      _applySearchFilter();
      notifyListeners();
      
      // 更新缓存
      await _storageService.cacheCategories(_categories);
      
      return true;
    } catch (e) {
      _setError('创建分类失败: $e');
      return false;
    }
  }
  
  /// 更新分类
  /// [categoryId] 分类ID
  /// [name] 新名称
  /// [description] 新描述
  Future<bool> updateCategory(String categoryId, {String? name, String? description}) async {
    try {
      _clearError();
      
      final updateData = models.CategoryUpdate(
        name: name,
        description: description,
      );
      
      final updatedCategory = await _apiService.updateCategory(categoryId, updateData);
      
      // 更新本地列表
      final index = _categories.indexWhere((c) => c.id == categoryId);
      if (index != -1) {
        _categories[index] = updatedCategory;
        _applySearchFilter();
        notifyListeners();
      }
      
      // 如果是当前选中的分类，也要更新
      if (_selectedCategory?.id == categoryId) {
        _selectedCategory = updatedCategory;
        notifyListeners();
      }
      
      // 更新缓存
      await _storageService.cacheCategories(_categories);
      
      return true;
    } catch (e) {
      _setError('更新分类失败: $e');
      return false;
    }
  }
  
  /// 删除分类
  /// [categoryId] 分类ID
  Future<bool> deleteCategory(String categoryId) async {
    try {
      _clearError();
      
      await _apiService.deleteCategory(categoryId);
      
      // 从本地列表移除
      _categories.removeWhere((c) => c.id == categoryId);
      _applySearchFilter();
      
      // 如果删除的是当前选中的分类，清除选中状态
      if (_selectedCategory?.id == categoryId) {
        _selectedCategory = null;
        _currentImages.clear();
        _selectedImages.clear();
      }
      
      notifyListeners();
      
      // 更新缓存
      await _storageService.cacheCategories(_categories);
      
      return true;
    } catch (e) {
      _setError('删除分类失败: $e');
      return false;
    }
  }

  // ===== 图片管理方法 =====
  
  /// 上传图片
  /// [categoryId] 目标分类ID
  /// [imageFile] 图片文件
  /// [title] 图片标题
  /// [description] 图片描述
  /// [tags] 标签列表
  /// [setAsThumbnail] 是否设置为分类缩略图
  Future<bool> uploadImage({
    required String categoryId,
    required File imageFile,
    String? title,
    String? description,
    List<String>? tags,
    bool setAsThumbnail = false,
  }) async {
    if (_isUploadingImage) return false;
    
    try {
      _setUploadingImage(true);
      _clearError();
      
      final uploadedImage = await _apiService.uploadImage(
        categoryId: categoryId,
        imageFile: imageFile,
        title: title,
        description: description,
        tags: tags,
        setAsCategoryThumbnail: setAsThumbnail,
      );
      
      // 如果是当前分类，添加到图片列表
      if (_selectedCategory?.id == categoryId) {
        _currentImages.insert(0, uploadedImage);
        notifyListeners();
      }
      
      // 刷新分类列表以更新缩略图
      await loadCategories(forceRefresh: true);
      
      return true;
    } catch (e) {
      _setError('上传图片失败: $e');
      return false;
    } finally {
      _setUploadingImage(false);
    }
  }
  
  /// 删除图片
  /// [imageId] 图片ID
  Future<bool> deleteImage(String imageId) async {
    try {
      _clearError();
      
      await _apiService.deleteImage(imageId);
      
      // 从当前图片列表中移除
      _currentImages.removeWhere((img) => img.id == imageId);
      
      // 从选中列表中移除
      _selectedImages.remove(imageId);
      
      notifyListeners();
      
      return true;
    } catch (e) {
      _setError('删除图片失败: $e');
      return false;
    }
  }
  
  /// 批量删除选中的图片
  Future<bool> deleteSelectedImages() async {
    if (_selectedImages.isEmpty) return true;
    
    try {
      _clearError();
      
      // 逐个删除选中的图片
      for (final imageId in _selectedImages.toList()) {
        await _apiService.deleteImage(imageId);
        _currentImages.removeWhere((img) => img.id == imageId);
      }
      
      _selectedImages.clear();
      notifyListeners();
      
      return true;
    } catch (e) {
      _setError('批量删除图片失败: $e');
      return false;
    }
  }

  // ===== 搜索和过滤方法 =====
  
  /// 设置搜索查询
  /// [query] 搜索关键词
  void setSearchQuery(String query) {
    _searchQuery = query;
    _applySearchFilter();
    notifyListeners();
  }
  
  /// 清除搜索
  void clearSearch() {
    setSearchQuery('');
  }
  
  /// 加载更多分类
  Future<void> loadMoreCategories() async {
    // 简单实现，实际应该实现分页逻辑
    return;
  }
  
  /// 搜索分类
  Future<void> searchCategories(String query) async {
    setSearchQuery(query);
  }
  
  /// 刷新分类
  Future<void> refreshCategories() async {
    await loadCategories(forceRefresh: true);
  }
  
  /// 排序分类
  void sortCategories(String sortField, bool ascending) {
    switch (sortField) {
      case 'name':
        _categories.sort((a, b) => ascending 
            ? a.name.compareTo(b.name) 
            : b.name.compareTo(a.name));
        break;
      case 'created_at':
        _categories.sort((a, b) => ascending 
            ? a.createdAt.compareTo(b.createdAt) 
            : b.createdAt.compareTo(a.createdAt));
        break;
      case 'updated_at':
        _categories.sort((a, b) => ascending 
            ? a.updatedAt.compareTo(b.updatedAt) 
            : b.updatedAt.compareTo(a.updatedAt));
        break;
      case 'image_count':
        _categories.sort((a, b) => ascending 
            ? (a.imageCount ?? 0).compareTo(b.imageCount ?? 0) 
            : (b.imageCount ?? 0).compareTo(a.imageCount ?? 0));
        break;
    }
    _applySearchFilter();
    notifyListeners();
  }

  // ===== 选择管理方法 =====
  
  /// 切换图片选中状态
  /// [imageId] 图片ID
  void toggleImageSelection(String imageId) {
    if (_selectedImages.contains(imageId)) {
      _selectedImages.remove(imageId);
    } else {
      _selectedImages.add(imageId);
    }
    notifyListeners();
  }
  
  /// 选中所有图片
  void selectAllImages() {
    _selectedImages.addAll(_currentImages.map((img) => img.id));
    notifyListeners();
  }
  
  /// 清除所有选择
  void clearSelection() {
    _selectedImages.clear();
    notifyListeners();
  }
  
  /// 检查图片是否被选中
  /// [imageId] 图片ID
  bool isImageSelected(String imageId) {
    return _selectedImages.contains(imageId);
  }

  // ===== 工具方法 =====
  
  /// 手动清除错误消息
  void clearError() {
    _clearError();
  }
  
  /// 刷新当前分类详情
  Future<void> refreshCurrentCategory() async {
    if (_selectedCategory != null) {
      await loadCategoryDetail(_selectedCategory!.id);
    }
  }
  
  /// 根据ID查找分类
  /// [categoryId] 分类ID
  models.Category? getCategoryById(String categoryId) {
    try {
      return _categories.firstWhere((c) => c.id == categoryId);
    } catch (e) {
      return null;
    }
  }
  
  /// 获取分类统计信息
  Map<String, int> getCategoryStats() {
    return {
      'totalCategories': _categories.length,
      'totalImages': _currentImages.length,
      'selectedImages': _selectedImages.length,
    };
  }
  
  /// 状态摘要（用于调试）
  Map<String, dynamic> getStateSummary() {
    return {
      'categoriesCount': _categories.length,
      'selectedCategory': _selectedCategory?.name,
      'currentImagesCount': _currentImages.length,
      'isLoadingCategories': _isLoadingCategories,
      'isLoadingCategoryDetail': _isLoadingCategoryDetail,
      'isUploadingImage': _isUploadingImage,
      'hasError': hasError,
      'error': _error,
      'searchQuery': _searchQuery,
      'selectedImagesCount': _selectedImages.length,
    };
  }

  @override
  void dispose() {
    // 清理资源
    super.dispose();
  }
} 
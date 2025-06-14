import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/category.dart';
import '../models/image.dart';
import '../models/tag.dart';

/// 本地存储服务类
/// 处理应用数据的本地缓存、用户偏好设置和配置
class StorageService {
  /// SharedPreferences键名常量
  static const String _categoriesKey = 'cached_categories';
  static const String _tagsKey = 'cached_tags';
  static const String _themeKey = 'theme_mode';
  static const String _languageKey = 'language_code';
  static const String _lastSyncKey = 'last_sync_time';
  static const String _userPreferencesKey = 'user_preferences';
  static const String _searchHistoryKey = 'search_history';
  static const String _favoriteImagesKey = 'favorite_images';

  /// 单例实例
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  /// SharedPreferences实例
  SharedPreferences? _prefs;

  /// 初始化存储服务
  Future<void> initialize() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  /// 确保已初始化
  Future<SharedPreferences> get _preferences async {
    if (_prefs == null) {
      await initialize();
    }
    return _prefs!;
  }

  // ===== 分类数据缓存 =====

  /// 缓存分类列表
  Future<void> cacheCategories(List<Category> categories) async {
    final prefs = await _preferences;
    final categoriesJson = categories.map((c) => c.toJson()).toList();
    await prefs.setString(_categoriesKey, json.encode(categoriesJson));
    await _updateLastSyncTime();
  }

  /// 获取缓存的分类列表
  Future<List<Category>?> getCachedCategories() async {
    final prefs = await _preferences;
    final categoriesString = prefs.getString(_categoriesKey);
    
    if (categoriesString == null) return null;
    
    try {
      final List<dynamic> categoriesJson = json.decode(categoriesString);
      return categoriesJson
          .map((json) => Category.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      // 缓存数据损坏，清除缓存
      await clearCachedCategories();
      return null;
    }
  }

  /// 清除分类缓存
  Future<void> clearCachedCategories() async {
    final prefs = await _preferences;
    await prefs.remove(_categoriesKey);
  }

  // ===== 标签数据缓存 =====

  /// 缓存标签列表
  Future<void> cacheTags(List<Tag> tags) async {
    final prefs = await _preferences;
    final tagsJson = tags.map((t) => t.toJson()).toList();
    await prefs.setString(_tagsKey, json.encode(tagsJson));
  }

  /// 获取缓存的标签列表
  Future<List<Tag>?> getCachedTags() async {
    final prefs = await _preferences;
    final tagsString = prefs.getString(_tagsKey);
    
    if (tagsString == null) return null;
    
    try {
      final List<dynamic> tagsJson = json.decode(tagsString);
      return tagsJson
          .map((json) => Tag.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      await clearCachedTags();
      return null;
    }
  }

  /// 清除标签缓存
  Future<void> clearCachedTags() async {
    final prefs = await _preferences;
    await prefs.remove(_tagsKey);
  }

  // ===== 主题设置 =====

  /// 保存主题模式
  Future<void> saveThemeMode(String themeMode) async {
    final prefs = await _preferences;
    await prefs.setString(_themeKey, themeMode);
  }

  /// 获取主题模式
  Future<String?> getThemeMode() async {
    final prefs = await _preferences;
    return prefs.getString(_themeKey);
  }

  // ===== 语言设置 =====

  /// 保存语言代码
  Future<void> saveLanguageCode(String languageCode) async {
    final prefs = await _preferences;
    await prefs.setString(_languageKey, languageCode);
  }

  /// 获取语言代码
  Future<String?> getLanguageCode() async {
    final prefs = await _preferences;
    return prefs.getString(_languageKey);
  }

  // ===== 用户偏好设置 =====

  /// 保存用户偏好设置
  Future<void> saveUserPreferences(Map<String, dynamic> preferences) async {
    final prefs = await _preferences;
    await prefs.setString(_userPreferencesKey, json.encode(preferences));
  }

  /// 获取用户偏好设置
  Future<Map<String, dynamic>?> getUserPreferences() async {
    final prefs = await _preferences;
    final preferencesString = prefs.getString(_userPreferencesKey);
    
    if (preferencesString == null) return null;
    
    try {
      return json.decode(preferencesString) as Map<String, dynamic>;
    } catch (e) {
      return null;
    }
  }

  /// 保存单个偏好设置
  Future<void> savePreference(String key, dynamic value) async {
    final preferences = await getUserPreferences() ?? <String, dynamic>{};
    preferences[key] = value;
    await saveUserPreferences(preferences);
  }

  /// 获取单个偏好设置
  Future<T?> getPreference<T>(String key) async {
    final preferences = await getUserPreferences();
    return preferences?[key] as T?;
  }

  // ===== 搜索历史 =====

  /// 添加搜索历史
  Future<void> addSearchHistory(String query) async {
    final history = await getSearchHistory();
    
    // 移除重复项
    history.remove(query);
    
    // 添加到开头
    history.insert(0, query);
    
    // 限制历史记录数量
    const maxHistoryCount = 20;
    if (history.length > maxHistoryCount) {
      history.removeRange(maxHistoryCount, history.length);
    }
    
    final prefs = await _preferences;
    await prefs.setStringList(_searchHistoryKey, history);
  }

  /// 获取搜索历史
  Future<List<String>> getSearchHistory() async {
    final prefs = await _preferences;
    return prefs.getStringList(_searchHistoryKey) ?? [];
  }

  /// 清除搜索历史
  Future<void> clearSearchHistory() async {
    final prefs = await _preferences;
    await prefs.remove(_searchHistoryKey);
  }

  /// 移除特定搜索历史项
  Future<void> removeSearchHistoryItem(String query) async {
    final history = await getSearchHistory();
    history.remove(query);
    
    final prefs = await _preferences;
    await prefs.setStringList(_searchHistoryKey, history);
  }

  // ===== 收藏图片 =====

  /// 添加收藏图片
  Future<void> addFavoriteImage(String imageId) async {
    final favorites = await getFavoriteImages();
    if (!favorites.contains(imageId)) {
      favorites.add(imageId);
      
      final prefs = await _preferences;
      await prefs.setStringList(_favoriteImagesKey, favorites);
    }
  }

  /// 移除收藏图片
  Future<void> removeFavoriteImage(String imageId) async {
    final favorites = await getFavoriteImages();
    favorites.remove(imageId);
    
    final prefs = await _preferences;
    await prefs.setStringList(_favoriteImagesKey, favorites);
  }

  /// 获取收藏图片列表
  Future<List<String>> getFavoriteImages() async {
    final prefs = await _preferences;
    return prefs.getStringList(_favoriteImagesKey) ?? [];
  }

  /// 检查图片是否已收藏
  Future<bool> isFavoriteImage(String imageId) async {
    final favorites = await getFavoriteImages();
    return favorites.contains(imageId);
  }

  /// 清除所有收藏
  Future<void> clearFavoriteImages() async {
    final prefs = await _preferences;
    await prefs.remove(_favoriteImagesKey);
  }

  // ===== 同步管理 =====

  /// 更新最后同步时间
  Future<void> _updateLastSyncTime() async {
    final prefs = await _preferences;
    await prefs.setInt(_lastSyncKey, DateTime.now().millisecondsSinceEpoch);
  }

  /// 获取最后同步时间
  Future<DateTime?> getLastSyncTime() async {
    final prefs = await _preferences;
    final timestamp = prefs.getInt(_lastSyncKey);
    
    if (timestamp == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(timestamp);
  }

  /// 检查是否需要同步（基于时间间隔）
  Future<bool> needsSync({Duration maxAge = const Duration(hours: 1)}) async {
    final lastSync = await getLastSyncTime();
    if (lastSync == null) return true;
    
    return DateTime.now().difference(lastSync) > maxAge;
  }

  // ===== 缓存管理 =====

  /// 清除所有缓存数据
  Future<void> clearAllCache() async {
    await clearCachedCategories();
    await clearCachedTags();
  }

  /// 清除所有数据（重置应用）
  Future<void> clearAllData() async {
    final prefs = await _preferences;
    await prefs.clear();
  }

  /// 获取缓存大小信息
  Future<Map<String, int>> getCacheInfo() async {
    final prefs = await _preferences;
    final info = <String, int>{};
    
    final categoriesString = prefs.getString(_categoriesKey);
    if (categoriesString != null) {
      info['categories'] = categoriesString.length;
    }
    
    final tagsString = prefs.getString(_tagsKey);
    if (tagsString != null) {
      info['tags'] = tagsString.length;
    }
    
    final searchHistory = prefs.getStringList(_searchHistoryKey);
    if (searchHistory != null) {
      info['search_history'] = searchHistory.length;
    }
    
    final favoriteImages = prefs.getStringList(_favoriteImagesKey);
    if (favoriteImages != null) {
      info['favorite_images'] = favoriteImages.length;
    }
    
    return info;
  }

  // ===== 批量操作 =====

  /// 批量保存数据
  Future<void> batchSave(Map<String, dynamic> data) async {
    final prefs = await _preferences;
    
    for (final entry in data.entries) {
      final key = entry.key;
      final value = entry.value;
      
      if (value is String) {
        await prefs.setString(key, value);
      } else if (value is int) {
        await prefs.setInt(key, value);
      } else if (value is double) {
        await prefs.setDouble(key, value);
      } else if (value is bool) {
        await prefs.setBool(key, value);
      } else if (value is List<String>) {
        await prefs.setStringList(key, value);
      } else {
        // 对于复杂对象，转换为JSON字符串
        await prefs.setString(key, json.encode(value));
      }
    }
  }

  // ===== 通用存储方法 =====

  /// 保存字符串值
  Future<void> saveString(String key, String value) async {
    final prefs = await _preferences;
    await prefs.setString(key, value);
  }

  /// 获取字符串值
  Future<String?> getString(String key) async {
    final prefs = await _preferences;
    return prefs.getString(key);
  }

  /// 移除指定键的值
  Future<void> removeKey(String key) async {
    final prefs = await _preferences;
    await prefs.remove(key);
  }

  /// 检查键是否存在
  Future<bool> containsKey(String key) async {
    final prefs = await _preferences;
    return prefs.containsKey(key);
  }
} 
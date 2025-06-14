import 'package:json_annotation/json_annotation.dart';
import 'image.dart';

part 'category.g.dart';

/// 分类数据模型
/// 对应React项目中的CategoryRead类型
@JsonSerializable()
class Category {
  /// 分类ID
  final String id;
  
  /// 分类名称
  final String name;
  
  /// 分类描述
  final String? description;
  
  /// 创建时间
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  
  /// 更新时间
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  
  /// 缩略图路径
  @JsonKey(name: 'thumbnail_path')
  final String? thumbnailPath;
  
  /// 缩略图URL
  @JsonKey(name: 'thumbnail_url')
  final String? thumbnailUrl;
  
  /// 分类下的图片列表
  final List<ImageModel>? images;
  
  /// 图片数量
  @JsonKey(name: 'image_count')
  final int? imageCount;

  /// 构造函数
  const Category({
    required this.id,
    required this.name,
    this.description,
    required this.createdAt,
    required this.updatedAt,
    this.thumbnailPath,
    this.thumbnailUrl,
    this.images,
    this.imageCount,
  });

  /// 从JSON创建Category对象
  factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);

  /// 转换为JSON
  Map<String, dynamic> toJson() => _$CategoryToJson(this);

  /// 复制对象并修改指定字段
  Category copyWith({
    String? id,
    String? name,
    String? description,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? thumbnailPath,
    String? thumbnailUrl,
    List<ImageModel>? images,
    int? imageCount,
  }) {
    return Category(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      thumbnailPath: thumbnailPath ?? this.thumbnailPath,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      images: images ?? this.images,
      imageCount: imageCount ?? this.imageCount,
    );
  }

  @override
  String toString() {
    return 'Category(id: $id, name: $name, description: $description, '
           'createdAt: $createdAt, updatedAt: $updatedAt, '
           'thumbnailPath: $thumbnailPath, thumbnailUrl: $thumbnailUrl, '
           'imagesCount: ${images?.length ?? 0})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Category && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

/// 分类创建请求模型
/// 对应React项目中的CategoryCreate类型
@JsonSerializable()
class CategoryCreate {
  /// 分类名称
  final String name;
  
  /// 分类描述
  final String? description;

  const CategoryCreate({
    required this.name,
    this.description,
  });

  factory CategoryCreate.fromJson(Map<String, dynamic> json) => _$CategoryCreateFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryCreateToJson(this);
}

/// 分类更新请求模型
/// 对应React项目中的CategoryUpdate类型
@JsonSerializable()
class CategoryUpdate {
  /// 分类名称
  final String? name;
  
  /// 分类描述
  final String? description;

  const CategoryUpdate({
    this.name,
    this.description,
  });

  factory CategoryUpdate.fromJson(Map<String, dynamic> json) => _$CategoryUpdateFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryUpdateToJson(this);
} 
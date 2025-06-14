import 'package:json_annotation/json_annotation.dart';

part 'tag.g.dart';

/// 标签数据模型
/// 对应React项目中的TagRead类型
@JsonSerializable()
class Tag {
  /// 标签ID
  final String id;
  
  /// 标签名称
  final String name;
  
  /// 创建时间
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  
  /// 更新时间
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  const Tag({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Tag.fromJson(Map<String, dynamic> json) => _$TagFromJson(json);
  Map<String, dynamic> toJson() => _$TagToJson(this);

  @override
  String toString() {
    return 'Tag(id: $id, name: $name, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Tag && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
} 
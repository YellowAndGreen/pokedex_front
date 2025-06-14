// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Category _$CategoryFromJson(Map<String, dynamic> json) => Category(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      thumbnailPath: json['thumbnail_path'] as String?,
      thumbnailUrl: json['thumbnail_url'] as String?,
      images: (json['images'] as List<dynamic>?)
          ?.map((e) => ImageModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      imageCount: (json['image_count'] as num?)?.toInt(),
    );

Map<String, dynamic> _$CategoryToJson(Category instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'thumbnail_path': instance.thumbnailPath,
      'thumbnail_url': instance.thumbnailUrl,
      'images': instance.images,
      'image_count': instance.imageCount,
    };

CategoryCreate _$CategoryCreateFromJson(Map<String, dynamic> json) =>
    CategoryCreate(
      name: json['name'] as String,
      description: json['description'] as String?,
    );

Map<String, dynamic> _$CategoryCreateToJson(CategoryCreate instance) =>
    <String, dynamic>{
      'name': instance.name,
      'description': instance.description,
    };

CategoryUpdate _$CategoryUpdateFromJson(Map<String, dynamic> json) =>
    CategoryUpdate(
      name: json['name'] as String?,
      description: json['description'] as String?,
    );

Map<String, dynamic> _$CategoryUpdateToJson(CategoryUpdate instance) =>
    <String, dynamic>{
      'name': instance.name,
      'description': instance.description,
    };

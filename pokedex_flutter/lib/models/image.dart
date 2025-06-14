import 'package:json_annotation/json_annotation.dart';
import 'tag.dart';

part 'image.g.dart';

/// EXIF数据模型
/// 对应React项目中的ExifData类型
@JsonSerializable()
class ExifData {
  /// 相机制造商
  final String? make;
  
  /// 相机型号
  final String? model;
  
  /// 镜头制造商
  @JsonKey(name: 'lens_make')
  final String? lensMake;
  
  /// 每个样本的位数
  @JsonKey(name: 'bits_per_sample')
  final String? bitsPerSample;
  
  /// 拍摄时间
  @JsonKey(name: 'date_time_original')
  final String? dateTimeOriginal;
  
  /// 曝光时间
  @JsonKey(name: 'exposure_time')
  final String? exposureTime;
  
  /// 光圈值
  @JsonKey(name: 'f_number')
  final String? fNumber;
  
  /// 曝光程序
  @JsonKey(name: 'exposure_program')
  final String? exposureProgram;
  
  /// ISO感光度
  @JsonKey(name: 'iso_speed_rating')
  final String? isoSpeedRating;
  
  /// 焦距
  @JsonKey(name: 'focal_length')
  final String? focalLength;
  
  /// 镜头规格
  @JsonKey(name: 'lens_specification')
  final String? lensSpecification;
  
  /// 镜头型号
  @JsonKey(name: 'lens_model')
  final String? lensModel;
  
  /// 曝光模式
  @JsonKey(name: 'exposure_mode')
  final String? exposureMode;
  
  /// CFA模式
  @JsonKey(name: 'cfa_pattern')
  final String? cfaPattern;
  
  /// 色彩空间
  @JsonKey(name: 'color_space')
  final String? colorSpace;
  
  /// 白平衡
  @JsonKey(name: 'white_balance')
  final String? whiteBalance;

  const ExifData({
    this.make,
    this.model,
    this.lensMake,
    this.bitsPerSample,
    this.dateTimeOriginal,
    this.exposureTime,
    this.fNumber,
    this.exposureProgram,
    this.isoSpeedRating,
    this.focalLength,
    this.lensSpecification,
    this.lensModel,
    this.exposureMode,
    this.cfaPattern,
    this.colorSpace,
    this.whiteBalance,
  });

  factory ExifData.fromJson(Map<String, dynamic> json) => _$ExifDataFromJson(json);
  Map<String, dynamic> toJson() => _$ExifDataToJson(this);
}

/// 图片数据模型
/// 对应React项目中的ImageRead类型
@JsonSerializable()
class ImageModel {
  /// 图片ID
  final String id;
  
  /// 所属分类ID
  @JsonKey(name: 'category_id')
  final String categoryId;
  
  /// 图片标题
  final String? title;
  
  /// 原始文件名
  @JsonKey(name: 'original_filename')
  final String? originalFilename;
  
  /// 存储文件名
  @JsonKey(name: 'stored_filename')
  final String? storedFilename;
  
  /// 相对文件路径
  @JsonKey(name: 'relative_file_path')
  final String? relativeFilePath;
  
  /// 相对缩略图路径
  @JsonKey(name: 'relative_thumbnail_path')
  final String? relativeThumbnailPath;
  
  /// MIME类型
  @JsonKey(name: 'mime_type')
  final String? mimeType;
  
  /// 文件大小（字节）
  @JsonKey(name: 'size_bytes')
  final int? sizeBytes;
  
  /// 图片描述
  final String? description;
  
  /// 标签列表
  final List<Tag>? tags;
  
  /// 创建时间
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  
  /// 更新时间
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  
  /// 文件元数据
  @JsonKey(name: 'file_metadata')
  final Map<String, dynamic>? fileMetadata;
  
  /// EXIF信息
  @JsonKey(name: 'exif_info')
  final ExifData? exifInfo;
  
  /// 图片URL
  @JsonKey(name: 'image_url')
  final String imageUrl;
  
  /// 缩略图URL
  @JsonKey(name: 'thumbnail_url')
  final String? thumbnailUrl;

  const ImageModel({
    required this.id,
    required this.categoryId,
    this.title,
    this.originalFilename,
    this.storedFilename,
    this.relativeFilePath,
    this.relativeThumbnailPath,
    this.mimeType,
    this.sizeBytes,
    this.description,
    this.tags,
    required this.createdAt,
    this.updatedAt,
    this.fileMetadata,
    this.exifInfo,
    required this.imageUrl,
    this.thumbnailUrl,
  });

  factory ImageModel.fromJson(Map<String, dynamic> json) => _$ImageModelFromJson(json);
  Map<String, dynamic> toJson() => _$ImageModelToJson(this);

  /// 复制对象并修改指定字段
  ImageModel copyWith({
    String? id,
    String? categoryId,
    String? title,
    String? originalFilename,
    String? storedFilename,
    String? relativeFilePath,
    String? relativeThumbnailPath,
    String? mimeType,
    int? sizeBytes,
    String? description,
    List<Tag>? tags,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? fileMetadata,
    ExifData? exifInfo,
    String? imageUrl,
    String? thumbnailUrl,
  }) {
    return ImageModel(
      id: id ?? this.id,
      categoryId: categoryId ?? this.categoryId,
      title: title ?? this.title,
      originalFilename: originalFilename ?? this.originalFilename,
      storedFilename: storedFilename ?? this.storedFilename,
      relativeFilePath: relativeFilePath ?? this.relativeFilePath,
      relativeThumbnailPath: relativeThumbnailPath ?? this.relativeThumbnailPath,
      mimeType: mimeType ?? this.mimeType,
      sizeBytes: sizeBytes ?? this.sizeBytes,
      description: description ?? this.description,
      tags: tags ?? this.tags,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      fileMetadata: fileMetadata ?? this.fileMetadata,
      exifInfo: exifInfo ?? this.exifInfo,
      imageUrl: imageUrl ?? this.imageUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
    );
  }

  @override
  String toString() {
    return 'ImageModel(id: $id, categoryId: $categoryId, title: $title, '
           'imageUrl: $imageUrl, tagsCount: ${tags?.length ?? 0})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ImageModel && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

/// 图片更新请求模型
/// 对应React项目中的ImageUpdate类型
@JsonSerializable()
class ImageUpdate {
  /// 图片标题
  final String? title;
  
  /// 图片描述
  final String? description;
  
  /// 标签（逗号分隔的字符串）
  final String? tags;
  
  /// 分类ID
  @JsonKey(name: 'category_id')
  final String? categoryId;
  
  /// 是否设置为分类缩略图
  @JsonKey(name: 'set_as_category_thumbnail')
  final bool? setAsCategoryThumbnail;

  const ImageUpdate({
    this.title,
    this.description,
    this.tags,
    this.categoryId,
    this.setAsCategoryThumbnail,
  });

  factory ImageUpdate.fromJson(Map<String, dynamic> json) => _$ImageUpdateFromJson(json);
  Map<String, dynamic> toJson() => _$ImageUpdateToJson(this);
} 
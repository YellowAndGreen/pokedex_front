// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'image.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ExifData _$ExifDataFromJson(Map<String, dynamic> json) => ExifData(
      make: json['make'] as String?,
      model: json['model'] as String?,
      lensMake: json['lens_make'] as String?,
      bitsPerSample: json['bits_per_sample'] as String?,
      dateTimeOriginal: json['date_time_original'] as String?,
      exposureTime: json['exposure_time'] as String?,
      fNumber: json['f_number'] as String?,
      exposureProgram: json['exposure_program'] as String?,
      isoSpeedRating: json['iso_speed_rating'] as String?,
      focalLength: json['focal_length'] as String?,
      lensSpecification: json['lens_specification'] as String?,
      lensModel: json['lens_model'] as String?,
      exposureMode: json['exposure_mode'] as String?,
      cfaPattern: json['cfa_pattern'] as String?,
      colorSpace: json['color_space'] as String?,
      whiteBalance: json['white_balance'] as String?,
    );

Map<String, dynamic> _$ExifDataToJson(ExifData instance) => <String, dynamic>{
      'make': instance.make,
      'model': instance.model,
      'lens_make': instance.lensMake,
      'bits_per_sample': instance.bitsPerSample,
      'date_time_original': instance.dateTimeOriginal,
      'exposure_time': instance.exposureTime,
      'f_number': instance.fNumber,
      'exposure_program': instance.exposureProgram,
      'iso_speed_rating': instance.isoSpeedRating,
      'focal_length': instance.focalLength,
      'lens_specification': instance.lensSpecification,
      'lens_model': instance.lensModel,
      'exposure_mode': instance.exposureMode,
      'cfa_pattern': instance.cfaPattern,
      'color_space': instance.colorSpace,
      'white_balance': instance.whiteBalance,
    };

ImageModel _$ImageModelFromJson(Map<String, dynamic> json) => ImageModel(
      id: json['id'] as String,
      categoryId: json['category_id'] as String,
      title: json['title'] as String?,
      originalFilename: json['original_filename'] as String?,
      storedFilename: json['stored_filename'] as String?,
      relativeFilePath: json['relative_file_path'] as String?,
      relativeThumbnailPath: json['relative_thumbnail_path'] as String?,
      mimeType: json['mime_type'] as String?,
      sizeBytes: (json['size_bytes'] as num?)?.toInt(),
      description: json['description'] as String?,
      tags: (json['tags'] as List<dynamic>?)
          ?.map((e) => Tag.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      fileMetadata: json['file_metadata'] as Map<String, dynamic>?,
      exifInfo: json['exif_info'] == null
          ? null
          : ExifData.fromJson(json['exif_info'] as Map<String, dynamic>),
      imageUrl: json['image_url'] as String,
      thumbnailUrl: json['thumbnail_url'] as String?,
    );

Map<String, dynamic> _$ImageModelToJson(ImageModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'category_id': instance.categoryId,
      'title': instance.title,
      'original_filename': instance.originalFilename,
      'stored_filename': instance.storedFilename,
      'relative_file_path': instance.relativeFilePath,
      'relative_thumbnail_path': instance.relativeThumbnailPath,
      'mime_type': instance.mimeType,
      'size_bytes': instance.sizeBytes,
      'description': instance.description,
      'tags': instance.tags,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'file_metadata': instance.fileMetadata,
      'exif_info': instance.exifInfo,
      'image_url': instance.imageUrl,
      'thumbnail_url': instance.thumbnailUrl,
    };

ImageUpdate _$ImageUpdateFromJson(Map<String, dynamic> json) => ImageUpdate(
      title: json['title'] as String?,
      description: json['description'] as String?,
      tags: json['tags'] as String?,
      categoryId: json['category_id'] as String?,
      setAsCategoryThumbnail: json['set_as_category_thumbnail'] as bool?,
    );

Map<String, dynamic> _$ImageUpdateToJson(ImageUpdate instance) =>
    <String, dynamic>{
      'title': instance.title,
      'description': instance.description,
      'tags': instance.tags,
      'category_id': instance.categoryId,
      'set_as_category_thumbnail': instance.setAsCategoryThumbnail,
    };

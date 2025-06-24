import { z } from 'zod';
import { 
  UuidSchema, 
  DateTimeSchema, 
  OptionalStringSchema, 
  OptionalDateTimeSchema,
  FileSizeSchema,
  RecordSchema,
  BooleanStringSchema
} from './common';
import { TagReadSchema } from './tag';

/**
 * 图片相关的 Schema 定义
 */

// EXIF 数据 Schema
export const ExifDataSchema = z.object({
  make: OptionalStringSchema,                    // 制造商
  model: OptionalStringSchema,                   // 型号
  lens_make: OptionalStringSchema,               // 镜头制造商
  bits_per_sample: OptionalStringSchema,         // 每样本位数
  date_time_original: OptionalStringSchema,      // 原始拍摄时间
  exposure_time: OptionalStringSchema,           // 曝光时间
  f_number: OptionalStringSchema,                // 光圈值
  exposure_program: OptionalStringSchema,        // 曝光程序
  iso_speed_rating: OptionalStringSchema,        // ISO感光度
  focal_length: OptionalStringSchema,            // 焦距
  lens_specification: OptionalStringSchema,       // 镜头规格
  lens_model: OptionalStringSchema,              // 镜头型号
  exposure_mode: OptionalStringSchema,           // 曝光模式
  cfa_pattern: OptionalStringSchema,             // CFA模式
  color_space: OptionalStringSchema,             // 色彩空间
  white_balance: OptionalStringSchema,           // 白平衡
});

// 图片读取 Schema
export const ImageReadSchema = z.object({
  id: UuidSchema,
  category_id: UuidSchema,
  title: OptionalStringSchema,
  original_filename: OptionalStringSchema,
  stored_filename: OptionalStringSchema,
  relative_file_path: OptionalStringSchema,
  relative_thumbnail_path: OptionalStringSchema,
  mime_type: OptionalStringSchema,
  size_bytes: FileSizeSchema.nullable(),
  description: OptionalStringSchema,
  tags: z.array(TagReadSchema).optional(),
  created_at: DateTimeSchema,
  updated_at: OptionalDateTimeSchema,
  file_metadata: RecordSchema,
  exif_info: ExifDataSchema.nullable(),
  image_url: z.string(), // 可能是相对路径，不强制要求URL格式
  thumbnail_url: OptionalStringSchema,
});

// 图片更新 Schema
export const ImageUpdateSchema = z.object({
  title: OptionalStringSchema,
  description: OptionalStringSchema,
  tags: OptionalStringSchema, // 逗号分隔的字符串
  category_id: UuidSchema.nullable(),
  set_as_category_thumbnail: z.boolean().nullable(),
});

// 图片上传 Schema (用于表单验证)
export const BodyUploadImageSchema = z.object({
  file: z.instanceof(File).refine(file => file instanceof File, '请选择一个文件'),
  category_id: UuidSchema,
  title: OptionalStringSchema,
  description: OptionalStringSchema,
  tags: OptionalStringSchema, // 逗号分隔的字符串
  set_as_category_thumbnail: z.boolean().nullable(),
});

// 图片上传 FormData Schema (用于API验证)
export const ImageUploadFormDataSchema = z.object({
  file: z.instanceof(File).refine(file => file instanceof File, '请选择一个文件'),
  category_id: z.string().uuid('无效的分类ID'),
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  set_as_category_thumbnail: BooleanStringSchema.optional(),
});

// 图片列表响应 Schema
export const ImageListResponseSchema = z.array(ImageReadSchema);

/**
 * 图片相关类型定义
 */
export type ExifData = z.infer<typeof ExifDataSchema>;
export type ImageRead = z.infer<typeof ImageReadSchema>;
export type ImageUpdate = z.infer<typeof ImageUpdateSchema>;
export type BodyUploadImage = z.infer<typeof BodyUploadImageSchema>;
export type ImageUploadFormData = z.infer<typeof ImageUploadFormDataSchema>;
export type ImageListResponse = z.infer<typeof ImageListResponseSchema>;

/**
 * 图片相关验证函数
 */

// 验证图片读取数据
export function validateImageRead(data: unknown): ImageRead {
  return ImageReadSchema.parse(data);
}

// 验证图片更新数据
export function validateImageUpdate(data: unknown): ImageUpdate {
  return ImageUpdateSchema.parse(data);
}

// 验证图片上传数据
export function validateImageUpload(data: unknown): BodyUploadImage {
  return BodyUploadImageSchema.parse(data);
}

// 验证图片列表数据
export function validateImageList(data: unknown): ImageListResponse {
  return ImageListResponseSchema.parse(data);
}

// 验证EXIF数据
export function validateExifData(data: unknown): ExifData {
  return ExifDataSchema.parse(data);
}

// 验证图片文件
export function validateImageFile(file: File): File {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    throw new Error('文件必须是图片格式');
  }
  
  // 验证文件大小 (最大 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('文件大小不能超过 10MB');
  }
  
  return file;
} 
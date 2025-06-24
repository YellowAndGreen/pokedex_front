import { z } from 'zod';
import { UuidSchema, DateTimeSchema, OptionalStringSchema, NonEmptyStringSchema } from './common';

/**
 * 分类相关的 Schema 定义
 * 基于现有的 Category 接口
 */

// 基础分类 Schema
const BaseCategorySchema = z.object({
  name: NonEmptyStringSchema,
  description: OptionalStringSchema,
});

// 分类创建 Schema
export const CategoryCreateSchema = BaseCategorySchema.extend({
  // 创建时只需要 name 和 description
});

// 分类读取 Schema
export const CategoryReadSchema = BaseCategorySchema.extend({
  id: UuidSchema,
  created_at: DateTimeSchema,
  updated_at: DateTimeSchema,
  thumbnail_path: OptionalStringSchema,
  thumbnail_url: OptionalStringSchema,
});

// 分类更新 Schema
export const CategoryUpdateSchema = z.object({
  name: OptionalStringSchema,
  description: OptionalStringSchema,
});

// 带图片的分类读取 Schema (使用 z.lazy 避免循环引用)
export const CategoryReadWithImagesSchema = CategoryReadSchema.extend({
  images: z.lazy(() => {
    // 动态导入 ImageReadSchema 避免循环引用
    const { ImageReadSchema } = require('./image');
    return z.array(ImageReadSchema);
  }).optional(),
});

// 分类列表响应 Schema
export const CategoryListResponseSchema = z.array(CategoryReadSchema);

/**
 * 分类相关类型定义
 */
export type CategoryCreate = z.infer<typeof CategoryCreateSchema>;
export type CategoryRead = z.infer<typeof CategoryReadSchema>;
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>;
export type CategoryReadWithImages = z.infer<typeof CategoryReadWithImagesSchema>;
export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;

/**
 * 分类相关验证函数
 */

// 验证分类创建数据
export function validateCategoryCreate(data: unknown): CategoryCreate {
  return CategoryCreateSchema.parse(data);
}

// 验证分类读取数据
export function validateCategoryRead(data: unknown): CategoryRead {
  return CategoryReadSchema.parse(data);
}

// 验证分类更新数据
export function validateCategoryUpdate(data: unknown): CategoryUpdate {
  return CategoryUpdateSchema.parse(data);
}

// 验证分类列表数据
export function validateCategoryList(data: unknown): CategoryListResponse {
  return CategoryListResponseSchema.parse(data);
}

// 验证分类名称
export function validateCategoryName(name: string): string {
  return NonEmptyStringSchema.parse(name);
} 
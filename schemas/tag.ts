import { z } from 'zod';
import { UuidSchema, DateTimeSchema, NonEmptyStringSchema } from './common';

/**
 * 标签相关的 Schema 定义
 */

// 标签读取 Schema
export const TagReadSchema = z.object({
  id: UuidSchema,
  name: NonEmptyStringSchema,
  created_at: DateTimeSchema,
  updated_at: DateTimeSchema,
});

// 标签列表响应 Schema
export const TagListResponseSchema = z.array(TagReadSchema);

/**
 * 标签相关类型定义
 */
export type TagRead = z.infer<typeof TagReadSchema>;
export type TagListResponse = z.infer<typeof TagListResponseSchema>;

/**
 * 标签相关验证函数
 */

// 验证标签读取数据
export function validateTagRead(data: unknown): TagRead {
  return TagReadSchema.parse(data);
}

// 验证标签列表数据
export function validateTagList(data: unknown): TagListResponse {
  return TagListResponseSchema.parse(data);
}

// 验证标签名称
export function validateTagName(name: string): string {
  return NonEmptyStringSchema.parse(name);
} 
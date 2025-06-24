import { z } from 'zod';
import { OptionalStringSchema, NonEmptyStringSchema, PositiveIntSchema } from './common';

/**
 * 物种相关的 Schema 定义
 */

// 物种读取 Schema
export const SpeciesReadSchema = z.object({
  id: PositiveIntSchema,
  order_details: NonEmptyStringSchema,     // 目详细信息
  family_details: NonEmptyStringSchema,    // 科详细信息
  genus_details: NonEmptyStringSchema,     // 属详细信息
  name_chinese: NonEmptyStringSchema,      // 中文名
  name_english: OptionalStringSchema,      // 英文名
  name_latin: OptionalStringSchema,        // 拉丁名
  href: OptionalStringSchema,              // 链接
  pinyin_full: OptionalStringSchema,       // 完整拼音
  pinyin_initials: OptionalStringSchema,   // 拼音首字母
});

// 物种建议响应 Schema (搜索建议)
export const SpeciesSuggestionsResponseSchema = z.array(z.string());

// 物种列表响应 Schema
export const SpeciesListResponseSchema = z.array(SpeciesReadSchema);

/**
 * 物种相关类型定义
 */
export type SpeciesRead = z.infer<typeof SpeciesReadSchema>;
export type SpeciesSuggestionsResponse = z.infer<typeof SpeciesSuggestionsResponseSchema>;
export type SpeciesListResponse = z.infer<typeof SpeciesListResponseSchema>;

/**
 * 物种相关验证函数
 */

// 验证物种读取数据
export function validateSpeciesRead(data: unknown): SpeciesRead {
  return SpeciesReadSchema.parse(data);
}

// 验证物种建议响应
export function validateSpeciesSuggestions(data: unknown): SpeciesSuggestionsResponse {
  return SpeciesSuggestionsResponseSchema.parse(data);
}

// 验证物种列表数据
export function validateSpeciesList(data: unknown): SpeciesListResponse {
  return SpeciesListResponseSchema.parse(data);
}

// 验证中文名称
export function validateChineseName(name: string): string {
  const chineseNameSchema = z.string()
    .min(1, '中文名不能为空')
    .regex(/[\u4e00-\u9fa5]/, '必须包含中文字符');
  return chineseNameSchema.parse(name);
} 
import { z } from 'zod';

/**
 * 基础公共 Schema 定义
 * 提供项目中常用的数据验证器
 */

// UUID 验证器
export const UuidSchema = z.string().uuid('无效的UUID格式');

// 日期时间验证器 (兼容FastAPI常见的 ISO 8601 格式)
export const DateTimeSchema = z.string()
  .refine((dateStr) => {
    // 调试：记录实际收到的日期时间格式
    if (typeof dateStr !== 'string') {
      console.log('DateTimeSchema: 收到非字符串类型:', typeof dateStr, dateStr);
      return false;
    }
    
    // FastAPI常见的日期时间格式模式
    const patterns = [
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, // 2023-12-07T10:30:00
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, // 2023-12-07T10:30:00Z
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+$/, // 2023-12-07T10:30:00.123456
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/, // 2023-12-07T10:30:00.123456Z
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/, // 2023-12-07T10:30:00+08:00
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+[+-]\d{2}:\d{2}$/, // 2023-12-07T10:30:00.123456+08:00
    ];
    
    const matchesPattern = patterns.some(pattern => pattern.test(dateStr));
    if (!matchesPattern) {
      console.log('DateTimeSchema: 不符合预期ISO格式的日期字符串:', dateStr);
    }
    
    // 尝试解析日期字符串
    const date = new Date(dateStr);
    const isValid = !isNaN(date.getTime());
    
    if (!isValid) {
      console.log('DateTimeSchema: 无法解析的日期字符串:', dateStr);
    }
    
    return matchesPattern && isValid;
  }, '无效的日期时间格式');

// 可选的日期时间验证器
export const OptionalDateTimeSchema = DateTimeSchema.nullable();

// 邮箱验证器
export const EmailSchema = z.string().email('无效的邮箱格式');

// 非空字符串验证器
export const NonEmptyStringSchema = z.string().min(1, '不能为空');

// 可选字符串验证器
export const OptionalStringSchema = z.string().nullable();

// 正整数验证器
export const PositiveIntSchema = z.number().int().positive('必须是正整数');

// 文件大小验证器 (字节)
export const FileSizeSchema = z.number().int().nonnegative('文件大小不能为负数');

// MIME 类型验证器
export const MimeTypeSchema = z.string().regex(/^[a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+$/, '无效的MIME类型');

// 标签数组验证器
export const TagsArraySchema = z.array(z.string()).optional();

// 通用记录验证器 (用于 metadata 等)
export const RecordSchema = z.record(z.string(), z.any()).nullable();

/**
 * 数据转换工具
 */

// 字符串转日期对象
export const StringToDateSchema = DateTimeSchema.transform(dateStr => new Date(dateStr));

// 逗号分隔字符串转数组
export const CommaStringToArraySchema = z.string()
  .transform(str => str.split(',').map(s => s.trim()).filter(Boolean))
  .optional();

// 布尔字符串转布尔值
export const BooleanStringSchema = z.string()
  .transform(str => str.toLowerCase() === 'true')
  .or(z.boolean());

/**
 * 验证错误处理
 */
export function createCustomError(message: string, path?: string[]) {
  return z.ZodError.create([
    {
      code: z.ZodIssueCode.custom,
      message,
      path: path || [],
    },
  ]);
} 
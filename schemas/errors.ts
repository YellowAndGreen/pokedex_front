import { z } from 'zod';

/**
 * 错误处理相关的 Schema 定义
 * 基于项目现有的错误结构设计
 */

// 验证错误 Schema (基于 Pydantic ValidationError)
export const ValidationErrorSchema = z.object({
  loc: z.array(z.union([z.string(), z.number()])),
  msg: z.string(),
  type: z.string(),
});

// HTTP 验证错误 Schema
export const HTTPValidationErrorSchema = z.object({
  detail: z.array(ValidationErrorSchema).optional(),
});

// API 错误 Schema (前端使用)
export const ApiErrorSchema = z.object({
  message: z.string(),
  details: z.array(ValidationErrorSchema).optional(),
  status: z.number().optional(),
});

// 服务器响应错误 Schema (用于解析后端错误响应)
export const ServerErrorResponseSchema = z.object({
  message: z.string().optional(),
  error: z.string().optional(),
  detail: z.union([
    z.string(),
    z.array(ValidationErrorSchema),
    z.any()
  ]).optional(),
});

/**
 * 错误类型定义 (从 Schema 推导)
 */
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type HTTPValidationError = z.infer<typeof HTTPValidationErrorSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ServerErrorResponse = z.infer<typeof ServerErrorResponseSchema>;

/**
 * 错误处理工具函数
 */

// 将 Zod 错误转换为 ApiError
export function zodErrorToApiError(error: z.ZodError, message = '数据验证失败'): ApiError {
  return {
    message,
    details: error.issues.map(issue => ({
      loc: issue.path.map(String),
      msg: issue.message,
      type: issue.code,
    })),
  };
}

// 验证是否为验证错误
export function isValidationError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}

// 创建简单的 API 错误
export function createApiError(message: string, status?: number): ApiError {
  return { message, status };
} 
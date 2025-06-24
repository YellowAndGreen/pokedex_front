import { z } from 'zod';
import { EmailSchema, NonEmptyStringSchema } from './common';

/**
 * 认证相关的 Schema 定义
 */

// Token 响应 Schema
export const TokenResponseSchema = z.object({
  access_token: NonEmptyStringSchema,
  token_type: z.string().optional(),
  expires_in: z.number().int().positive().optional(),
});

// 验证码发送请求 Schema
export const SendVerificationRequestSchema = z.object({
  email: EmailSchema,
});

// 验证码验证请求 Schema
export const VerifyCodeRequestSchema = z.object({
  email: EmailSchema,
  code: z.string().min(1, '验证码不能为空').max(10, '验证码长度不能超过10位'),
});

/**
 * 认证相关类型定义
 */
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type SendVerificationRequest = z.infer<typeof SendVerificationRequestSchema>;
export type VerifyCodeRequest = z.infer<typeof VerifyCodeRequestSchema>;

/**
 * 认证相关验证函数
 */

// 验证 Token 响应
export function validateTokenResponse(data: unknown): TokenResponse {
  return TokenResponseSchema.parse(data);
}

// 验证邮箱格式
export function validateEmail(email: string): string {
  return EmailSchema.parse(email);
}

// 验证验证码格式
export function validateVerificationCode(code: string): string {
  return z.string().min(1, '验证码不能为空').max(10, '验证码长度不能超过10位').parse(code);
} 
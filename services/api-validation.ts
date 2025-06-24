import { z } from 'zod';
import { AxiosError } from 'axios';
import { 
  ApiError, 
  zodErrorToApiError, 
  isValidationError,
  createApiError,
  ServerErrorResponseSchema
} from '../schemas';

/**
 * API 响应验证工具函数
 * 提供统一的数据验证和错误处理
 */

/**
 * 安全解析 API 响应数据
 * @param data 响应数据
 * @param schema Zod Schema
 * @param errorMessage 自定义错误信息
 * @returns 验证后的数据
 */
export function safeParseApiResponse<T>(
  data: unknown, 
  schema: z.ZodSchema<T>, 
  errorMessage = 'API响应数据格式错误'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (isValidationError(error)) {
      console.error('API响应验证失败:', errorMessage);
      console.error('原始数据:', JSON.stringify(data, null, 2));
      console.error('验证错误详情:', error.issues);
      throw zodErrorToApiError(error, errorMessage);
    }
    console.error('非验证错误:', error);
    throw createApiError(errorMessage);
  }
}

/**
 * 处理 Axios 错误并整合 Zod 验证错误
 * @param error 原始错误
 * @param url API地址
 * @returns 格式化的 ApiError
 */
export function formatApiErrorWithZod(error: unknown, url = 'API'): ApiError {
  // 如果是 Zod 验证错误，直接转换
  if (isValidationError(error)) {
    return zodErrorToApiError(error, '数据验证失败');
  }

  // 如果是 ApiError，直接返回
  if (isApiError(error)) {
    return error;
  }

  // Axios 错误处理 (增强版)
  if (isAxiosError(error)) {
    const serverError = parseServerError(error.response?.data);
    let message = `API 请求 ${error.config?.url || url} 失败。状态码: ${error.response?.status || 'N/A'}`;
    
    if (error.response?.status === 401) {
      message = '未认证或Token已过期，请重新登录。';
    } else if (error.response?.status === 422) {
      message = '请求参数验证失败。';
      if (serverError?.detail && Array.isArray(serverError.detail)) {
        const firstDetail = serverError.detail[0];
        if (firstDetail?.msg) {
          const location = firstDetail.loc 
            ? ` (字段: ${firstDetail.loc.join('->')})`
            : '';
          message = `验证错误: ${firstDetail.msg}${location}`;
        }
      }
    } else if (serverError) {
      if (typeof serverError.detail === 'string') {
        message = serverError.detail;
      } else if (serverError.message) {
        message = serverError.message;
      } else if (serverError.error) {
        message = serverError.error;
      }
    } else if (error.message?.toLowerCase().includes('network error')) {
      message = '无法连接到服务器，请检查网络连接。';
    }

    return {
      message,
      status: error.response?.status,
      details: serverError?.detail && Array.isArray(serverError.detail) 
        ? serverError.detail 
        : undefined,
    };
  }

  // 其他错误
  return createApiError(
    error instanceof Error ? error.message : '发生未知错误',
    undefined
  );
}

/**
 * 解析服务器错误响应
 */
function parseServerError(data: unknown) {
  try {
    return ServerErrorResponseSchema.parse(data);
  } catch {
    return null;
  }
}

/**
 * 类型守卫：检查是否为 ApiError
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * 类型守卫：检查是否为 AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    error instanceof Error &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  );
}

/**
 * 创建带验证的 API 请求包装器
 */
export function createValidatedApiCall<TResponse>(
  apiCall: () => Promise<{ data: unknown }>,
  responseSchema: z.ZodSchema<TResponse>,
  errorContext = 'API'
) {
  return async (): Promise<TResponse> => {
    try {
      const response = await apiCall();
      return safeParseApiResponse(response.data, responseSchema);
    } catch (error) {
      throw formatApiErrorWithZod(error, errorContext);
    }
  };
}

/**
 * 批量验证 API 响应数组
 */
export function validateApiResponseArray<T>(
  data: unknown,
  itemSchema: z.ZodSchema<T>,
  errorMessage = 'API响应数组格式错误'
): T[] {
  const arraySchema = z.array(itemSchema);
  return safeParseApiResponse(data, arraySchema, errorMessage);
} 
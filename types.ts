/**
 * 类型定义文件
 * 
 * 说明: 从 Zod Schema 推导的类型定义
 * 这确保了运行时验证和编译时类型的一致性
 */

// 从 Zod Schema 导入推导的类型
export {
  // 错误处理类型
  type ValidationError,
  type HTTPValidationError,
  type ApiError,
  
  // 认证相关类型
  type TokenResponse,
  
  // 分类相关类型
  type CategoryCreate,
  type CategoryRead,
  type CategoryUpdate,
  type CategoryReadWithImages,
  type CategoryListResponse,
  
  // 图片相关类型
  type ImageRead,
  type ImageUpdate,
  type BodyUploadImage,
  type ExifData,
  type ImageListResponse,
  
  // 标签相关类型
  type TagRead,
  type TagListResponse,
  
  // 物种相关类型
  type SpeciesRead,
  type SpeciesSuggestionsResponse,
} from './schemas';

// 导入需要的单独类型用于兼容性别名
import type { SpeciesRead } from './schemas';

// 保留的兼容性类型别名
export type SpeciesListResponse = SpeciesRead[];

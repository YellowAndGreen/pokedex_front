
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../constants';
import type {
  CategoryCreate,
  CategoryRead,
  CategoryReadWithImages,
  CategoryUpdate,
  CategoryListResponse,
  ImageRead,
  ImageUpdate,
  BodyUploadImage,
  SpeciesRead,
  SpeciesSuggestionsResponse,
  HTTPValidationError,
  ApiError,
  ValidationError,
  TokenResponse,
  TagRead, // Added TagRead here
} from '../types';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  const isAuthEndpoint = config.url?.includes('/api/send-verification') || config.url?.includes('/api/verify');
  
  if (token && config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase()) && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

function formatApiError(error: AxiosError | any, url: string = 'API'): ApiError {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data as Partial<HTTPValidationError & { message?: string; error?: string; detail?: any }>;
    let message = `API 请求 ${error.config?.url || url} 失败。状态码: ${error.response?.status || 'N/A'}`;
    let details: ValidationError[] | undefined = undefined;

    if (error.response?.status === 401) {
      message = '未认证或Token已过期，请重新登录。';
    } else if (error.response?.status === 422) {
      message = '请求参数验证失败。';
      if (serverError?.detail && Array.isArray(serverError.detail) && serverError.detail.length > 0) {
        details = serverError.detail as ValidationError[];
        const firstDetailMsg = serverError.detail[0]?.msg || '请检查输入。';
        const firstDetailLoc = serverError.detail[0]?.loc ? ` (字段: ${Array.isArray(serverError.detail[0].loc) ? serverError.detail[0].loc.join('->') : serverError.detail[0].loc})` : '';
        message = `验证错误: ${firstDetailMsg}${firstDetailLoc}`;
        if (serverError.detail[0]?.msg?.toLowerCase().includes('email') && serverError.detail[0]?.msg?.toLowerCase().includes('not allowed')) {
            message = "邮箱不允许。";
        }
      } else {
         message = "邮箱不允许或请求参数无效。";
      }
    } else if (serverError) {
      if (typeof serverError.detail === 'string') {
        message = serverError.detail;
      } else if (serverError.message) {
        message = serverError.message;
      } else if (serverError.error) {
        message = serverError.error;
      } else if (Array.isArray(serverError.detail) && serverError.detail.length > 0 && serverError.detail[0].msg) {
        details = serverError.detail as ValidationError[];
        message = `API 错误: ${serverError.detail[0].msg}`;
      } else {
         message = error.message || 'API 请求失败，响应体无法解析。';
      }
    } else {
      message = error.message || '发生未知网络错误。';
      if (error.message.toLowerCase().includes('network error') || error.message.toLowerCase().includes('failed to fetch')) {
         message = `无法连接到服务器 (${API_BASE_URL})。请检查网络连接或服务器状态。`;
      }
    }
    return { message, status: error.response?.status, details };
  }
  return { message: error.message || '发生未知错误。', status: undefined };
}

// Auth Endpoints
export async function sendVerificationCode(email: string): Promise<any> {
  const url = `/api/send-verification?email=${encodeURIComponent(email)}`;
  try {
    const response = await apiClient.post(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function verifyCodeAndGetToken(email: string, code: string): Promise<TokenResponse> {
  const url = `/api/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;
  try {
    const response = await apiClient.post<TokenResponse>(url); 
    if (!response.data || !response.data.access_token) {
        console.error("Token verification response missing access_token:", response.data);
        throw formatApiError({ message: '登录成功，但未收到有效的Token。' }, url);
    }
    return response.data;
  } catch (error) {
    const formattedError = formatApiError(error, url);
    if (formattedError.status === 422 && formattedError.message.includes("Invalid verification code")) {
        formattedError.message = "验证码错误或已过期。";
    } else if (formattedError.status === 422) {
        formattedError.message = "验证失败，请检查邮箱和验证码。";
    }
    throw formattedError;
  }
}


// Category Endpoints
export async function createCategory(categoryData: CategoryCreate): Promise<CategoryRead> {
  const url = `/api/categories/`;
  try {
    const response = await apiClient.post<CategoryRead>(url, categoryData);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function getCategories(skip: number = 0, limit: number = 100): Promise<CategoryListResponse> {
  const url = `/api/categories/?skip=${skip}&limit=${limit}`;
  try {
    const response = await apiClient.get<CategoryListResponse>(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function getCategoryWithImages(categoryId: string): Promise<CategoryReadWithImages> {
  const url = `/api/categories/${categoryId}/`;
  try {
    const response = await apiClient.get<CategoryReadWithImages>(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function getCategoryByName(categoryName: string): Promise<CategoryRead> {
  const url = `/api/categories/by-name/${encodeURIComponent(categoryName)}/`;
  try {
    const response = await apiClient.get<CategoryRead>(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function updateCategory(categoryId: string, categoryData: CategoryUpdate): Promise<CategoryRead> {
  const url = `/api/categories/${categoryId}/`;
  try {
    const response = await apiClient.patch<CategoryRead>(url, categoryData);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const url = `/api/categories/${categoryId}/`;
  try {
    await apiClient.delete(url);
  } catch (error) {
    throw formatApiError(error, url);
  }
}

// Image Endpoints
export async function uploadImage(imageData: BodyUploadImage): Promise<ImageRead> {
  const url = `/api/images/upload/`;
  const formData = new FormData();
  formData.append('file', imageData.file);
  formData.append('category_id', imageData.category_id);
  if (imageData.title) formData.append('title', imageData.title);
  if (imageData.description) formData.append('description', imageData.description);
  if (imageData.tags) formData.append('tags', imageData.tags);
  if (imageData.set_as_category_thumbnail !== null && imageData.set_as_category_thumbnail !== undefined) {
    formData.append('set_as_category_thumbnail', String(imageData.set_as_category_thumbnail));
  }
  
  try {
    const response = await apiClient.post<ImageRead>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function getImage(imageId: string): Promise<ImageRead> {
  const url = `/api/images/${imageId}/`;
  try {
    const response = await apiClient.get<ImageRead>(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function updateImageMetadata(imageId: string, imageData: ImageUpdate): Promise<ImageRead> {
  const url = `/api/images/${imageId}/`;
  try {
    const response = await apiClient.put<ImageRead>(url, imageData);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function deleteImage(imageId: string): Promise<void> {
  const url = `/api/images/${imageId}/`;
  try {
    await apiClient.delete(url);
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function searchImagesByTag(tagQuery: string): Promise<ImageRead[]> {
  const tags = tagQuery.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  if (tags.length === 0) return Promise.resolve([]);

  const queryParams = new URLSearchParams();
  tags.forEach(tag => queryParams.append('tag', tag));
  const url = `/api/images/by-tags/?${queryParams.toString()}`;
  
  try {
    const response = await apiClient.get<ImageRead[]>(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

// Tag Endpoints
export async function getAllTags(): Promise<TagRead[]> {
  const url = `/api/tags/`;
  try {
    const response = await apiClient.get<TagRead[]>(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}


// Species Information Endpoints
export async function getSpeciesSuggestions(query: string, limit: number = 10): Promise<SpeciesSuggestionsResponse> {
  const url = `/api/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`;
  try {
    const response = await apiClient.get<SpeciesSuggestionsResponse>(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

export async function getSpeciesDetails(chineseName: string): Promise<SpeciesRead> {
  const url = `/api/details/${encodeURIComponent(chineseName)}`;
  try {
    const response = await apiClient.get<SpeciesRead>(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error, url);
  }
}

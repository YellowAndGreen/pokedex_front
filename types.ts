

// Based on OpenAPI components.schemas

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface CategoryCreate {
  name: string;
  description?: string | null;
}

export interface CategoryRead {
  name: string;
  description?: string | null;
  id: string; // uuid
  created_at: string; // date-time
  updated_at: string; // date-time
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
}

export interface TagRead {
  name: string;
  id: string; // uuid
  created_at: string; // date-time
  updated_at: string; // date-time
}

export interface ImageRead {
  title?: string | null;
  original_filename?: string | null;
  stored_filename?: string | null;
  relative_file_path?: string | null;
  relative_thumbnail_path?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  description?: string | null;
  tags?: TagRead[]; 
  id: string; // uuid
  category_id: string; // uuid
  created_at: string; // date-time
  updated_at?: string | null; // date-time
  file_metadata?: Record<string, any> | null;
  exif_info?: ExifData | null;
  image_url: string;
  thumbnail_url?: string | null;
}

export interface CategoryReadWithImages extends CategoryRead {
  images?: ImageRead[];
}

export interface CategoryUpdate {
  name?: string | null;
  description?: string | null;
}

export interface BodyUploadImage {
  file: File;
  category_id: string; // uuid
  title?: string | null;
  description?: string | null;
  tags?: string | null; // Comma-separated
  set_as_category_thumbnail?: boolean | null;
}

export interface ImageUpdate {
  title?: string | null;
  description?: string | null;
  tags?: string | null; // Comma-separated. This remains a string for updates as per OpenAPI.
  category_id?: string | null; // uuid
  set_as_category_thumbnail?: boolean | null;
}

export interface ExifData {
  make?: string | null;
  model?: string | null;
  lens_make?: string | null;
  bits_per_sample?: string | null;
  date_time_original?: string | null;
  exposure_time?: string | null;
  f_number?: string | null;
  exposure_program?: string | null;
  iso_speed_rating?: string | null;
  focal_length?: string | null;
  lens_specification?: string | null;
  lens_model?: string | null;
  exposure_mode?: string | null;
  cfa_pattern?: string | null;
  color_space?: string | null;
  white_balance?: string | null;
}

export interface SpeciesRead {
  order_details: string;
  family_details: string;
  genus_details: string;
  name_chinese: string;
  name_english?: string | null;
  name_latin?: string | null;
  href?: string | null;
  pinyin_full?: string | null;
  pinyin_initials?: string | null;
  id: number;
}

// For API responses that are arrays
export type CategoryListResponse = CategoryRead[];
export type SpeciesSuggestionsResponse = string[];

// API Error structure
export interface ApiError {
  message: string;
  details?: ValidationError[];
  status?: number;
}

// Auth Types
export interface TokenResponse {
  access_token: string;
  token_type: string;
  // expires_in?: number; // Optional
}

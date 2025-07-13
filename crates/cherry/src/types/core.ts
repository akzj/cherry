// 核心基础类型定义

/**
 * 基础ID类型
 */
export type ID = string | number;

/**
 * 时间戳类型
 */
export type Timestamp = string;

/**
 * 通用响应类型
 */
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  code?: number;
}

/**
 * 分页参数类型
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * 排序参数类型
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * 过滤参数类型
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * 查询参数类型
 */
export interface QueryParams extends PaginationParams {
  sort?: SortParams;
  filter?: FilterParams;
  search?: string;
}

/**
 * 错误类型
 */
export interface ApiError {
  code: string | number;
  message: string;
  details?: any;
}

/**
 * 文件信息类型
 */
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 地理位置类型
 */
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

/**
 * 通用状态类型
 */
export type Status = 'active' | 'inactive' | 'pending' | 'deleted';

/**
 * 通用操作结果类型
 */
export interface OperationResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: ApiError;
}

/**
 * 事件类型
 */
export interface Event<T = any> {
  type: string;
  data: T;
  timestamp: Timestamp;
  source?: string;
}

/**
 * 配置类型
 */
export interface Config {
  [key: string]: any;
}

/**
 * 元数据类型
 */
export interface Metadata {
  [key: string]: any;
} 
/** 与 Nest TransformInterceptor 一致的成功响应 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
  meta?: Record<string, unknown>
  timestamp: number
}

/** Nest AllExceptionFilter 等错误响应 */
export interface ApiErrorBody {
  statusCode?: number
  code?: number
  message?: string | string[]
  path?: string
  timestamp?: string | number
}

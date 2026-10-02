import type { ApiErrorBody, ApiResponse } from '@/types/api'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number
  /** 业务错误码（信封内 code，非 HTTP status） */
  code?: number

  constructor(message: string, status: number, code?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function resolveUrl(path: string): string {
  if (path.startsWith('http')) {
    return path
  }
  const prefix = baseUrl.replace(/\/$/, '')
  return `${prefix}${path}`
}

export function isApiEnvelope(value: unknown): value is ApiResponse<unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.code === 'number' &&
    typeof record.message === 'string' &&
    'data' in record
  )
}

export function parseApiMessage(body: ApiErrorBody | ApiResponse<unknown>): string {
  if (isApiEnvelope(body) && body.code !== 0) {
    return body.message || '请求失败'
  }
  if (Array.isArray(body.message)) {
    return body.message.join('；')
  }
  return body.message ?? '请求失败'
}

function parseJson(text: string, status: number): unknown {
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ApiError('响应格式错误', status)
  }
}

function unwrapSuccess<T>(body: unknown, status: number): T {
  if (!isApiEnvelope(body)) {
    return body as T
  }
  if (body.code !== 0) {
    throw new ApiError(body.message || '请求失败', status, body.code)
  }
  return body.data as T
}

async function handleResponse<T>(
  response: Response,
  text: string,
): Promise<T> {
  const body = parseJson(text, response.status)

  if (!response.ok) {
    const message = parseApiMessage(
      (body ?? {}) as ApiErrorBody | ApiResponse<unknown>,
    )
    const errorBody = body as ApiErrorBody | null
    throw new ApiError(
      message,
      response.status,
      errorBody && 'code' in errorBody ? errorBody.code : undefined,
    )
  }

  return unwrapSuccess<T>(body, response.status)
}

export async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options
  const response = await fetch(resolveUrl(path), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
  const text = await response.text()
  return handleResponse<T>(response, text)
}

export async function requestForm<T>(
  path: string,
  formData: FormData,
  token: string,
  method = 'POST',
): Promise<T> {
  const response = await fetch(resolveUrl(path), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
  const text = await response.text()
  return handleResponse<T>(response, text)
}

/** 需要同时读取 meta 时使用（分页等） */
export async function requestWithMeta<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<{ data: T; meta?: Record<string, unknown>; message: string }> {
  const { token, headers, ...rest } = options
  const response = await fetch(resolveUrl(path), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
  const text = await response.text()
  const body = parseJson(text, response.status)

  if (!response.ok) {
    throw new ApiError(
      parseApiMessage((body ?? {}) as ApiErrorBody | ApiResponse<unknown>),
      response.status,
    )
  }

  if (!isApiEnvelope(body)) {
    return { data: body as T, message: 'success' }
  }
  if (body.code !== 0) {
    throw new ApiError(body.message || '请求失败', response.status, body.code)
  }
  return {
    data: body.data as T,
    meta: body.meta,
    message: body.message,
  }
}

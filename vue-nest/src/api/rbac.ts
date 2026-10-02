import { request } from '@/api/http'
import type {
  AdminRole,
  AdminUser,
  CreatePermissionPayload,
  CreateRolePayload,
  CreateUserPayload,
  PermissionItem,
} from '@/types/rbac'

function auth(token: string) {
  return { token }
}

export function fetchUsers(token: string) {
  return request<AdminUser[]>('/user', auth(token))
}

export function createUser(token: string, payload: CreateUserPayload) {
  return request<AdminUser>('/user', {
    method: 'POST',
    body: JSON.stringify(payload),
    ...auth(token),
  })
}

export function assignUserRoles(token: string, userId: number, roleIds: number[]) {
  return request<AdminUser>(`/user/${userId}/roles`, {
    method: 'PUT',
    body: JSON.stringify({ roleIds }),
    ...auth(token),
  })
}

export function fetchRoles(token: string, page = 1, limit = 100) {
  return request<AdminRole[]>(`/role?page=${page}&limit=${limit}`, auth(token))
}

export function createRole(token: string, payload: CreateRolePayload) {
  return request<AdminRole>('/role', {
    method: 'POST',
    body: JSON.stringify(payload),
    ...auth(token),
  })
}

export function updateRole(
  token: string,
  id: number,
  payload: Partial<CreateRolePayload>,
) {
  return request<AdminRole>(`/role/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...auth(token),
  })
}

export function deleteRole(token: string, id: number) {
  return request<AdminRole>(`/role/${id}`, {
    method: 'DELETE',
    ...auth(token),
  })
}

export function assignRolePermissions(
  token: string,
  roleId: number,
  permissionIds: number[],
) {
  return request<AdminRole>(`/role/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissionIds }),
    ...auth(token),
  })
}

export function fetchPermissions(token: string) {
  return request<PermissionItem[]>('/permission', auth(token))
}

export function createPermission(token: string, payload: CreatePermissionPayload) {
  return request<PermissionItem>('/permission', {
    method: 'POST',
    body: JSON.stringify(payload),
    ...auth(token),
  })
}

export function updatePermission(
  token: string,
  id: number,
  payload: Partial<CreatePermissionPayload>,
) {
  return request<PermissionItem>(`/permission/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...auth(token),
  })
}

export function deletePermission(token: string, id: number) {
  return request<PermissionItem>(`/permission/${id}`, {
    method: 'DELETE',
    ...auth(token),
  })
}

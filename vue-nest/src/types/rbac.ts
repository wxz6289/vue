export interface RoleSummary {
  id: number
  name: string
  description?: string | null
}

export interface PermissionItem {
  id: number
  name: string
  action: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface UserRoleLink {
  userId: number
  roleId: number
  Role: RoleSummary
}

export interface AdminUser {
  id: number
  name: string
  email: string
  roles?: UserRoleLink[]
}

export interface RolePermissionLink {
  roleId: number
  permissionId: number
  permission: PermissionItem
}

export interface AdminRole {
  id: number
  name: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
  rolePermissions?: RolePermissionLink[]
  _count?: { users: number }
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
}

export interface CreateRolePayload {
  name: string
  description?: string
}

export interface CreatePermissionPayload {
  name: string
  action: string
  description?: string
}

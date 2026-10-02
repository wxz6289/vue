export interface MenuItem {
  key: string
  label: string
  icon: string
  to: string
  description?: string
}

export interface MenuGroup {
  key: string
  label: string
  items: MenuItem[]
}

/** 侧栏菜单配置，可按权限在此过滤 */
export function getMenuGroups(): MenuGroup[] {
  return [
    {
      key: 'overview',
      label: '概览',
      items: [
        {
          key: 'home',
          label: '工作台',
          icon: 'pi pi-th-large',
          to: '/home',
          description: '首页概览与快捷入口',
        },
      ],
    },
    {
      key: 'business',
      label: '业务',
      items: [
        {
          key: 'boss-crawl',
          label: 'BOSS 抓取',
          icon: 'pi pi-briefcase',
          to: '/boss-crawl',
          description: '职位抓取与任务管理',
        },
        {
          key: 'images',
          label: '图片管理',
          icon: 'pi pi-images',
          to: '/images',
          description: '上传与外链图片',
        },
      ],
    },
    {
      key: 'system',
      label: '系统',
      items: [
        {
          key: 'admin-users',
          label: '用户管理',
          icon: 'pi pi-users',
          to: '/admin/users',
        },
        {
          key: 'admin-roles',
          label: '角色管理',
          icon: 'pi pi-shield',
          to: '/admin/roles',
        },
        {
          key: 'admin-permissions',
          label: '权限管理',
          icon: 'pi pi-key',
          to: '/admin/permissions',
        },
      ],
    },
  ]
}

export function findActiveMenuItem(path: string): MenuItem | undefined {
  for (const group of getMenuGroups()) {
    for (const item of group.items) {
      if (path === item.to || path.startsWith(`${item.to}/`)) {
        return item
      }
    }
  }
  return undefined
}

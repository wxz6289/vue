<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import {
  assignUserRoles,
  createUser,
  fetchRoles,
  fetchUsers,
} from '@/api/rbac'
import { useAdminToken } from '@/composables/useAdminToken'
import type { AdminRole, AdminUser } from '@/types/rbac'

const toast = useToast()
const { ensureToken } = useAdminToken()

const loading = ref(false)
const users = ref<AdminUser[]>([])
const roles = ref<AdminRole[]>([])

const createVisible = ref(false)
const createForm = reactive({ name: '', email: '', password: '' })

const roleVisible = ref(false)
const editingUser = ref<AdminUser | null>(null)
const selectedRoleIds = ref<number[]>([])

async function loadData() {
  const token = ensureToken()
  if (!token) return

  loading.value = true
  try {
    const [userList, roleList] = await Promise.all([
      fetchUsers(token),
      fetchRoles(token),
    ])
    users.value = userList
    roles.value = roleList
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: '加载失败',
      detail: e instanceof Error ? e.message : '未知错误',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  createForm.name = ''
  createForm.email = ''
  createForm.password = ''
  createVisible.value = true
}

async function submitCreate() {
  const token = ensureToken()
  if (!token) return

  loading.value = true
  try {
    await createUser(token, { ...createForm })
    createVisible.value = false
    toast.add({ severity: 'success', summary: '用户已创建', life: 2500 })
    await loadData()
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: '创建失败',
      detail: e instanceof Error ? e.message : '未知错误',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

function openRoleDialog(user: AdminUser) {
  editingUser.value = user
  selectedRoleIds.value = user.roles?.map((item) => item.roleId) ?? []
  roleVisible.value = true
}

async function submitRoles() {
  const token = ensureToken()
  if (!token || !editingUser.value) return

  loading.value = true
  try {
    await assignUserRoles(token, editingUser.value.id, selectedRoleIds.value)
    roleVisible.value = false
    toast.add({ severity: 'success', summary: '角色已更新', life: 2500 })
    await loadData()
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: '保存失败',
      detail: e instanceof Error ? e.message : '未知错误',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

function roleLabels(user: AdminUser) {
  return user.roles?.map((item) => item.Role.name) ?? []
}

onMounted(loadData)
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">用户管理</h2>
        <p class="mt-1 text-sm text-slate-600">查看用户并为账号分配角色</p>
      </div>
      <div class="flex gap-2">
        <Button icon="pi pi-refresh" label="刷新" outlined :loading="loading" @click="loadData" />
        <Button icon="pi pi-plus" label="新建用户" @click="openCreate" />
      </div>
    </div>

    <DataTable :value="users" :loading="loading" striped-rows paginator :rows="10" data-key="id">
      <Column field="id" header="ID" style="width: 5rem" />
      <Column field="name" header="用户名" />
      <Column field="email" header="邮箱" />
      <Column header="角色">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <Tag
              v-for="name in roleLabels(data as AdminUser)"
              :key="name"
              :value="name"
              severity="info"
            />
            <span v-if="!roleLabels(data as AdminUser).length" class="text-sm text-slate-400">未分配</span>
          </div>
        </template>
      </Column>
      <Column header="操作" style="width: 8rem">
        <template #body="{ data }">
          <Button
            size="small"
            outlined
            label="分配角色"
            @click="openRoleDialog(data as AdminUser)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="createVisible" modal header="新建用户" :style="{ width: '28rem' }">
      <div class="flex flex-col gap-3">
        <InputText v-model="createForm.name" placeholder="用户名" />
        <InputText v-model="createForm.email" placeholder="邮箱" />
        <InputText v-model="createForm.password" type="password" placeholder="密码（至少 6 位）" />
      </div>
      <template #footer>
        <Button label="取消" text @click="createVisible = false" />
        <Button label="创建" :loading="loading" @click="submitCreate" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="roleVisible"
      modal
      :header="`分配角色：${editingUser?.name ?? ''}`"
      :style="{ width: '28rem' }"
    >
      <MultiSelect
        v-model="selectedRoleIds"
        :options="roles"
        option-label="name"
        option-value="id"
        placeholder="选择角色"
        display="chip"
        class="w-full"
      />
      <template #footer>
        <Button label="取消" text @click="roleVisible = false" />
        <Button label="保存" :loading="loading" @click="submitRoles" />
      </template>
    </Dialog>
  </section>
</template>

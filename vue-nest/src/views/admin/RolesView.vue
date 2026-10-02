<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import {
  assignRolePermissions,
  createRole,
  deleteRole,
  fetchPermissions,
  fetchRoles,
  updateRole,
} from '@/api/rbac'
import { useAdminToken } from '@/composables/useAdminToken'
import type { AdminRole, PermissionItem } from '@/types/rbac'

const toast = useToast()
const confirm = useConfirm()
const { ensureToken } = useAdminToken()

const loading = ref(false)
const roles = ref<AdminRole[]>([])
const permissions = ref<PermissionItem[]>([])

const formVisible = ref(false)
const editingRole = ref<AdminRole | null>(null)
const form = reactive({ name: '', description: '' })

const permVisible = ref(false)
const permissionRole = ref<AdminRole | null>(null)
const selectedPermissionIds = ref<number[]>([])

async function loadData() {
  const token = ensureToken()
  if (!token) return

  loading.value = true
  try {
    const [roleList, permissionList] = await Promise.all([
      fetchRoles(token),
      fetchPermissions(token),
    ])
    roles.value = roleList
    permissions.value = permissionList
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
  editingRole.value = null
  form.name = ''
  form.description = ''
  formVisible.value = true
}

function openEdit(role: AdminRole) {
  editingRole.value = role
  form.name = role.name
  form.description = role.description ?? ''
  formVisible.value = true
}

async function submitForm() {
  const token = ensureToken()
  if (!token) return

  loading.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    }
    if (editingRole.value) {
      await updateRole(token, editingRole.value.id, payload)
      toast.add({ severity: 'success', summary: '角色已更新', life: 2500 })
    } else {
      await createRole(token, payload)
      toast.add({ severity: 'success', summary: '角色已创建', life: 2500 })
    }
    formVisible.value = false
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

function confirmDelete(role: AdminRole) {
  confirm.require({
    message: `确定删除角色「${role.name}」吗？`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: '取消',
    acceptLabel: '删除',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const token = ensureToken()
      if (!token) return
      loading.value = true
      try {
        await deleteRole(token, role.id)
        toast.add({ severity: 'success', summary: '角色已删除', life: 2500 })
        await loadData()
      } catch (e) {
        toast.add({
          severity: 'error',
          summary: '删除失败',
          detail: e instanceof Error ? e.message : '未知错误',
          life: 4000,
        })
      } finally {
        loading.value = false
      }
    },
  })
}

function openPermissions(role: AdminRole) {
  permissionRole.value = role
  selectedPermissionIds.value =
    role.rolePermissions?.map((item) => item.permission.id) ?? []
  permVisible.value = true
}

async function submitPermissions() {
  const token = ensureToken()
  if (!token || !permissionRole.value) return

  loading.value = true
  try {
    await assignRolePermissions(
      token,
      permissionRole.value.id,
      selectedPermissionIds.value,
    )
    permVisible.value = false
    toast.add({ severity: 'success', summary: '权限已更新', life: 2500 })
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

function permissionTags(role: AdminRole) {
  return role.rolePermissions?.map((item) => item.permission.name) ?? []
}

onMounted(loadData)
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">角色管理</h2>
        <p class="mt-1 text-sm text-slate-600">维护角色并为角色绑定权限</p>
      </div>
      <div class="flex gap-2">
        <Button icon="pi pi-refresh" label="刷新" outlined :loading="loading" @click="loadData" />
        <Button icon="pi pi-plus" label="新建角色" @click="openCreate" />
      </div>
    </div>

    <DataTable :value="roles" :loading="loading" striped-rows paginator :rows="10" data-key="id">
      <Column field="id" header="ID" style="width: 5rem" />
      <Column field="name" header="角色名" />
      <Column field="description" header="描述" />
      <Column header="权限">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <Tag
              v-for="name in permissionTags(data as AdminRole)"
              :key="name"
              :value="name"
              severity="success"
            />
            <span v-if="!permissionTags(data as AdminRole).length" class="text-sm text-slate-400">未绑定</span>
          </div>
        </template>
      </Column>
      <Column header="用户数" style="width: 6rem">
        <template #body="{ data }">
          {{ (data as AdminRole)._count?.users ?? 0 }}
        </template>
      </Column>
      <Column header="操作" style="width: 14rem">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-2">
            <Button size="small" outlined label="编辑" @click="openEdit(data as AdminRole)" />
            <Button
              size="small"
              outlined
              severity="info"
              label="权限"
              @click="openPermissions(data as AdminRole)"
            />
            <Button
              size="small"
              outlined
              severity="danger"
              label="删除"
              @click="confirmDelete(data as AdminRole)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="formVisible"
      modal
      :header="editingRole ? '编辑角色' : '新建角色'"
      :style="{ width: '28rem' }"
    >
      <div class="flex flex-col gap-3">
        <InputText v-model="form.name" placeholder="角色名称" />
        <Textarea v-model="form.description" rows="3" placeholder="描述（可选）" auto-resize />
      </div>
      <template #footer>
        <Button label="取消" text @click="formVisible = false" />
        <Button label="保存" :loading="loading" @click="submitForm" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="permVisible"
      modal
      :header="`分配权限：${permissionRole?.name ?? ''}`"
      :style="{ width: '32rem' }"
    >
      <MultiSelect
        v-model="selectedPermissionIds"
        :options="permissions"
        option-label="name"
        option-value="id"
        placeholder="选择权限"
        display="chip"
        filter
        class="w-full"
      />
      <template #footer>
        <Button label="取消" text @click="permVisible = false" />
        <Button label="保存" :loading="loading" @click="submitPermissions" />
      </template>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import {
  createPermission,
  deletePermission,
  fetchPermissions,
  updatePermission,
} from '@/api/rbac'
import { useAdminToken } from '@/composables/useAdminToken'
import type { PermissionItem } from '@/types/rbac'

const toast = useToast()
const confirm = useConfirm()
const { ensureToken } = useAdminToken()

const loading = ref(false)
const permissions = ref<PermissionItem[]>([])

const formVisible = ref(false)
const editing = ref<PermissionItem | null>(null)
const form = reactive({ name: '', action: '', description: '' })

async function loadData() {
  const token = ensureToken()
  if (!token) return

  loading.value = true
  try {
    permissions.value = await fetchPermissions(token)
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
  editing.value = null
  form.name = ''
  form.action = ''
  form.description = ''
  formVisible.value = true
}

function openEdit(item: PermissionItem) {
  editing.value = item
  form.name = item.name
  form.action = item.action
  form.description = item.description ?? ''
  formVisible.value = true
}

async function submitForm() {
  const token = ensureToken()
  if (!token) return

  loading.value = true
  try {
    const payload = {
      name: form.name.trim(),
      action: form.action.trim(),
      description: form.description.trim() || undefined,
    }
    if (editing.value) {
      await updatePermission(token, editing.value.id, payload)
      toast.add({ severity: 'success', summary: '权限已更新', life: 2500 })
    } else {
      await createPermission(token, payload)
      toast.add({ severity: 'success', summary: '权限已创建', life: 2500 })
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

function confirmDelete(item: PermissionItem) {
  confirm.require({
    message: `确定删除权限「${item.name}」吗？`,
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
        await deletePermission(token, item.id)
        toast.add({ severity: 'success', summary: '权限已删除', life: 2500 })
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

onMounted(loadData)
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">权限管理</h2>
        <p class="mt-1 text-sm text-slate-600">维护权限标识，并在角色管理中完成绑定</p>
      </div>
      <div class="flex gap-2">
        <Button icon="pi pi-refresh" label="刷新" outlined :loading="loading" @click="loadData" />
        <Button icon="pi pi-plus" label="新建权限" @click="openCreate" />
      </div>
    </div>

    <DataTable :value="permissions" :loading="loading" striped-rows paginator :rows="10" data-key="id">
      <Column field="id" header="ID" style="width: 5rem" />
      <Column field="name" header="权限标识" />
      <Column field="action" header="操作类型" />
      <Column field="description" header="描述" />
      <Column header="操作" style="width: 10rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button size="small" outlined label="编辑" @click="openEdit(data as PermissionItem)" />
            <Button
              size="small"
              outlined
              severity="danger"
              label="删除"
              @click="confirmDelete(data as PermissionItem)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="formVisible"
      modal
      :header="editing ? '编辑权限' : '新建权限'"
      :style="{ width: '28rem' }"
    >
      <div class="flex flex-col gap-3">
        <InputText v-model="form.name" placeholder="权限标识，如 user:read" />
        <InputText v-model="form.action" placeholder="操作类型，如 read / create" />
        <Textarea v-model="form.description" rows="3" placeholder="描述（可选）" auto-resize />
      </div>
      <template #footer>
        <Button label="取消" text @click="formVisible = false" />
        <Button label="保存" :loading="loading" @click="submitForm" />
      </template>
    </Dialog>
  </section>
</template>

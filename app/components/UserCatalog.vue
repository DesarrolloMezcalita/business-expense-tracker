<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Usuarios</h1>
      <UButton
        icon="i-heroicons-plus"
        label="Agregar Usuario"
        @click="isAddModalOpen = true"
      />
    </div>

    <!-- Filter Panel -->
    <BaseCatalogFilters
      v-model:search-query="searchQuery"
      search-placeholder="Buscar por nombre o correo"
      :has-active-filters="hasActiveFilters"
      @apply-filters="applyFilters"
      @reset-filters="resetFilters"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Rol</label
          >
          <USelect
            v-model="roleFilter"
            :items="roleOptions"
            @update:model-value="applyFilters"
          />
        </div>
        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Estado</label
          >
          <USelect
            v-model="statusFilter"
            :items="statusOptions"
            @update:model-value="applyFilters"
          />
        </div>
      </div>
    </BaseCatalogFilters>

    <!-- Users Table -->
    <BaseCatalogTable
      v-model:current-page="page"
      :page-count="pageCount"
      :paginated-range="paginatedRange"
      :total-count="filteredUsers.length"
      :columns="['Nombre', 'Correo', 'Rol', 'Estado']"
    >
      <!-- No Items Placeholder -->
      <tr v-if="loading">
        <td colspan="6" class="px-6 py-4 text-center">Cargando...</td>
      </tr>
      <tr v-else-if="paginatedUsers.length === 0">
        <td colspan="6" class="px-6 py-4 text-center">
          No se encontraron usuarios
        </td>
      </tr>

      <!-- Row Item Details -->
      <tr
        v-for="user in paginatedUsers"
        :key="user.id"
        class="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
        <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <UBadge :color="getRoleBadgeColor(user.role)" variant="subtle">
            {{ user.role }}
          </UBadge>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <UBadge
            :color="user.is_active ? 'success' : 'error'"
            variant="subtle"
          >
            {{ user.is_active ? "Active" : "Inactive" }}
          </UBadge>
        </td>

        <!-- Row Actions -->
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-eye"
              variant="ghost"
              title="View Details"
              @click="viewUser(user)"
            />
            <UButton
              icon="i-heroicons-pencil-square"
              variant="ghost"
              title="Edit User"
              @click="editUser(user)"
            />
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              title="Delete User"
              @click="confirmDeleteUser(user)"
            />
          </div>
        </td>
      </tr>
    </BaseCatalogTable>

    <!-- Add User Modal -->
    <BaseModal v-model="isAddModalOpen" title="Agregar Nuevo Usuario">
      <UserForm
        :user="newUser"
        @submit="addUser"
        @cancel="isAddModalOpen = false"
      />
    </BaseModal>

    <!-- Edit User Modal -->
    <BaseModal v-model="isEditModalOpen" title="Editar Usuario">
      <UserForm
        :user="editingUser"
        :is-editing="true"
        @submit="updateUser"
        @cancel="isEditModalOpen = false"
      />
    </BaseModal>

    <!-- View User Modal -->
    <BaseModal v-model="isViewModalOpen" title="Detalles de Usuario">
      <UserView
        :user="viewingUser"
        @edit="editFromViewModal"
        @cancel="isViewModalOpen = false"
      />
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="isDeleteModalOpen" title="Confirmar Eliminación">
      <div aria-describedby="delete-user-description">
        <p id="delete-user-description">
          ¿Está seguro que desea eliminar al usuario
          <strong>{{ deletingUser?.name }}</strong
          >? Esta acción no se puede deshacer.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            variant="soft"
            @click="isDeleteModalOpen = false"
          />
          <UButton
            label="Eliminar"
            color="error"
            icon="i-heroicons-trash"
            @click="deleteUser"
          />
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const loading = ref<boolean>(true);
const page = ref(1);
const perPage = ref(10);
const searchQuery = ref("");
const roleFilter = ref(null);
const statusFilter = ref(null);

// Modal states
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

// User data
const defaultUser = {
  name: "",
  email: "",
  password: "",
  role: "Editor",
  is_active: true,
  created_at: new Date().toISOString(),
};

const newUser = ref({ ...defaultUser });
const editingUser = ref({ ...defaultUser });
const viewingUser = ref({ id: 0, ...defaultUser });
const deletingUser = ref({ id: 0, ...defaultUser });

// Table configuration
// We're now using a simple HTML table instead of UTable

// Filter options
const roleOptions = [
  { label: "Todos los Roles", value: null },
  { label: "Admin", value: "Admin" },
  // { label: "User", value: "User" },
  { label: "Editor", value: "Editor" },
];

const statusOptions = [
  { label: "Todos", value: null },
  { label: "Activo", value: true },
  { label: "Inactivo", value: false },
];

/* Computed properties */
const filteredUsers = computed(() => {
  let result = [...userStore.users];

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }

  // Apply role filter
  if (roleFilter.value) {
    result = result.filter((user) => user.role === roleFilter.value);
  }

  // Apply status filter
  if (statusFilter.value !== null) {
    result = result.filter((user) => user.is_active === statusFilter.value);
  }

  return result;
});

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredUsers.value.slice(start, end);
});

const paginatedRange = computed(() => {
  const start = (page.value - 1) * perPage.value + 1;
  const end = Math.min(start + perPage.value - 1, filteredUsers.value.length);
  return `${start}-${end}`;
});

const pageCount = computed(() => {
  return Math.ceil(filteredUsers.value.length / perPage.value);
});

const hasActiveFilters = computed(() => {
  if (searchQuery.value || roleFilter.value || statusFilter.value) return true;

  return false;
});

/* Methods */
function applyFilters() {
  page.value = 1;
}

function resetFilters() {
  searchQuery.value = "";
  roleFilter.value = null;
  statusFilter.value = null;
  page.value = 1;
}

function getRoleBadgeColor(role) {
  switch (role) {
    case "Admin":
      return "info";
    default:
      return "neutral";
  }
}

function viewUser(user) {
  viewingUser.value = { ...user };
  isViewModalOpen.value = true;
}

function editUser(user) {
  editingUser.value = { ...user };
  isEditModalOpen.value = true;
}

function editFromViewModal() {
  editingUser.value = { ...viewingUser.value };
  isViewModalOpen.value = false;
  isEditModalOpen.value = true;
}

function confirmDeleteUser(user) {
  deletingUser.value = user;
  isDeleteModalOpen.value = true;
}

function addUser(userData) {
  userStore.addUser(userData);
  isAddModalOpen.value = false;
  newUser.value = { ...defaultUser };
}

function updateUser(userData) {
  userStore.updateUser(userData);
  isEditModalOpen.value = false;
}

function deleteUser() {
  if (deletingUser.value) {
    userStore.deleteUser(deletingUser.value.id);
    isDeleteModalOpen.value = false;
    deletingUser.value = null;
  }
}

onMounted(async () => {
  try {
    // Always fetch users when the component is mounted
    loading.value = true;
    await userStore.fetchUsers();
  } catch (error) {
    console.error("Error loading users:", error);
  } finally {
    loading.value = false;
  }
});
</script>
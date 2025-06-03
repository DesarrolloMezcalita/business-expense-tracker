<template>
  <div class="container mx-auto p-6">
    <UTabs
      :items="tabItems"
      variant="link"
      class="gap-4 w-full"
      :ui="{ trigger: 'grow' }"
    >
      <template #users>
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold">Usuarios</h1>
          <UButton
            icon="i-heroicons-plus-circle"
            label="Agregar Usuario"
            @click="isAddUserModalOpen = true"
          />
        </div>

        <!-- Search and Filter Section -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-grow">
            <div class="flex">
              <UInput
                v-model="searchQuery"
                placeholder="Buscar por nombre o correo"
                icon="i-heroicons-magnifying-glass"
                class="flex-grow"
                @update:model-value="applyFilters"
              />
              <UButton
                icon="i-heroicons-adjustments-horizontal"
                @click="isAdvancedFilterOpen = !isAdvancedFilterOpen"
                :variant="isAdvancedFilterOpen ? 'solid' : 'outline'"
                class="ml-2"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <USelect
              v-model="roleFilter"
              placeholder="Filter by role"
              :items="roleOptions"
              @update:model-value="applyFilters"
            />
            <UButton
              v-if="hasActiveFilters"
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              @click="resetFilters"
              label="Restablecer Filtros"
            />
          </div>
        </div>

        <!-- Advanced Filter Panel -->
        <UCard v-if="isAdvancedFilterOpen" class="mb-6">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium">Filtros Avanzados</h3>
              <UButton
                icon="i-heroicons-x-mark"
                color="gray"
                variant="ghost"
                @click="isAdvancedFilterOpen = false"
              />
            </div>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700"
                >Estado</label
              >
              <USelect
                v-model="statusFilter"
                :items="statusOptions"
                @update:model-value="applyFilters"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700"
                >Ordenar Por</label
              >
              <USelect
                v-model="sortOption"
                :items="sortOptions"
                class="w-40"
                @update:model-value="applyFilters"
              />
            </div>
          </div>
        </UCard>

        <!-- Users Table -->
        <UCard>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Correo
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rol
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="loading">
                  <td colspan="6" class="px-6 py-4 text-center">Loading...</td>
                </tr>
                <tr v-else-if="paginatedUsers.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center">
                    No users found
                  </td>
                </tr>
                <tr
                  v-for="user in paginatedUsers"
                  :key="user.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UBadge
                      :color="getRoleBadgeColor(user.role)"
                      variant="subtle"
                    >
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
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <UButton
                        icon="i-heroicons-eye"
                        color="gray"
                        variant="ghost"
                        @click="viewUser(user)"
                        title="View Details"
                      />
                      <UButton
                        icon="i-heroicons-pencil-square"
                        color="gray"
                        variant="ghost"
                        @click="editUser(user)"
                        title="Edit User"
                      />
                      <UButton
                        icon="i-heroicons-trash"
                        color="gray"
                        variant="ghost"
                        @click="confirmDeleteUser(user)"
                        title="Delete User"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <template #footer>
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500">
                Mostrando {{ paginatedUsers.length }} de
                {{ filteredUsers.length }} usuarios
              </p>
              <UPagination
                v-model="page"
                :page-count="pageCount"
                :total="filteredUsers.length"
                :ui="{ wrapper: 'flex items-center gap-1' }"
              />
            </div>
          </template>
        </UCard>
      </template>

      <template #wa-users>
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold">Usuarios de WhatsApp</h1>
          <UButton
            icon="i-heroicons-plus-circle"
            label="Agregar Usuario"
            @click="isAddWAUserModalOpen = true"
          />
        </div>

        <!-- Search and Filter Section -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-grow">
            <div class="flex">
              <UInput
                v-model="waSearchQuery"
                placeholder="Buscar por nombre o teléfono"
                icon="i-heroicons-magnifying-glass"
                class="flex-grow"
                @update:model-value="applyWAFilters"
              />
              <UButton
                icon="i-heroicons-adjustments-horizontal"
                @click="isAdvancedWAFilterOpen = !isAdvancedWAFilterOpen"
                :variant="isAdvancedWAFilterOpen ? 'solid' : 'outline'"
                class="ml-2"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <UButton
              v-if="hasActiveWAFilters"
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              @click="resetWAFilters"
              label="Reset Filters"
            />
          </div>
        </div>

        <!-- Advanced Filter Panel -->
        <UCard v-if="isAdvancedWAFilterOpen" class="mb-6">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium">Advanced Filters</h3>
              <UButton
                icon="i-heroicons-x-mark"
                color="gray"
                variant="ghost"
                @click="isAdvancedWAFilterOpen = false"
              />
            </div>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700"
                >Estado</label
              >
              <USelect
                v-model="waStatusFilter"
                :items="statusOptions"
                @update:model-value="applyWAFilters"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700"
                >Ordenar Por</label
              >
              <USelect
                v-model="waSortOption"
                :items="waSortOptions"
                class="w-40"
                @update:model-value="applyWAFilters"
              />
            </div>
          </div>
        </UCard>

        <!-- Users Table -->
        <UCard>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Teléfono
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="loading">
                  <td colspan="6" class="px-6 py-4 text-center">Loading...</td>
                </tr>
                <tr v-else-if="waPaginatedUsers.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center">
                    No se encontraron usuarios
                  </td>
                </tr>
                <tr
                  v-for="user in waPaginatedUsers"
                  :key="user.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ user.phone }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UBadge
                      :color="user.is_active ? 'success' : 'error'"
                      variant="subtle"
                    >
                      {{ user.is_active ? "Active" : "Inactive" }}
                    </UBadge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <UButton
                        icon="i-heroicons-eye"
                        color="gray"
                        variant="ghost"
                        @click="viewWAUser(user)"
                        title="View Details"
                      />
                      <UButton
                        icon="i-heroicons-pencil-square"
                        color="gray"
                        variant="ghost"
                        @click="editWAUser(user)"
                        title="Edit User"
                      />
                      <UButton
                        icon="i-heroicons-trash"
                        color="gray"
                        variant="ghost"
                        @click="confirmDeleteWAUser(user)"
                        title="Delete User"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <template #footer>
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500">
                Mostrando {{ waPaginatedUsers.length }} de
                {{ waFilteredUsers.length }} usuarios
              </p>
              <UPagination
                v-model="waPage"
                :page-count="waPageCount"
                :total="waFilteredUsers.length"
                :ui="{ wrapper: 'flex items-center gap-1' }"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UTabs>

    <!-- Add User Modal -->
    <UModal v-model:open="isAddUserModalOpen" :ui="{ width: 'max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="add-user-title">
            Agregar Nuevo Usuario
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isAddUserModalOpen = false"
            aria-label="Close"
          />
        </div>
      </template>

      <template #body>
        <div aria-describedby="add-user-description">
          <p id="add-user-description" class="sr-only">
            Form to add a new user
          </p>
          <UserForm
            :user="newUser"
            @submit="addUser"
            @cancel="isAddUserModalOpen = false"
          />
        </div>
      </template>
    </UModal>

    <!-- Edit User Modal -->
    <UModal v-model:open="isEditUserModalOpen" :ui="{ width: 'max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="edit-user-title">
            Editar Usuario
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isEditUserModalOpen = false"
            aria-label="Close"
          />
        </div>
      </template>

      <template #body>
        <div aria-describedby="edit-user-description">
          <p id="edit-user-description" class="sr-only">
            Form to edit user details
          </p>
          <UserForm
            :user="editingUser"
            :is-editing="true"
            @submit="updateUser"
            @cancel="isEditUserModalOpen = false"
          />
        </div>
      </template>
    </UModal>

    <!-- View User Modal -->
    <UModal v-model:open="isViewUserModalOpen" :ui="{ width: 'max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="view-user-title">
            Detalles de Usuario
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isViewUserModalOpen = false"
            aria-label="Close"
          />
        </div>
      </template>

      <template #body>
        <div
          v-if="viewingUser"
          class="space-y-4"
          aria-describedby="view-user-description"
        >
          <p id="view-user-description" class="sr-only">
            Detailed information about the selected user
          </p>
          <div class="flex items-center space-x-4">
            <div class="bg-gray-100 rounded-full p-4">
              <UIcon name="i-heroicons-user-circle" class="text-3xl" />
            </div>
            <div>
              <h4 class="text-xl font-medium">{{ viewingUser.name }}</h4>
              <p class="text-gray-500">{{ viewingUser.email }}</p>
            </div>
          </div>

          <hr class="my-4 border-t border-gray-200" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 class="text-sm font-medium text-gray-500">Rol</h5>
              <UBadge
                :color="getRoleBadgeColor(viewingUser.role)"
                variant="subtle"
              >
                {{ viewingUser.role }}
              </UBadge>
            </div>
            <div>
              <h5 class="text-sm font-medium text-gray-500">Estado</h5>
              <UBadge
                :color="viewingUser.is_active ? 'success' : 'error'"
                variant="subtle"
              >
                {{ viewingUser.is_active ? "Active" : "Inactive" }}
              </UBadge>
            </div>
            <!-- <div>
              <h5 class="text-sm font-medium text-gray-500">Created Date</h5>
              <p>
                {{
                  formatDate(viewingUser.created_at || viewingUser.createdAt)
                }}
              </p>
            </div> -->
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cerrar"
            color="gray"
            variant="outline"
            @click="isViewUserModalOpen = false"
          />
          <UButton
            label="Editar"
            icon="i-heroicons-pencil-square"
            @click="editFromViewModal"
          />
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="delete-user-title">
            Confirmar Eliminación
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isDeleteModalOpen = false"
            aria-label="Close"
          />
        </div>
      </template>

      <template #body>
        <div aria-describedby="delete-user-description">
          <p id="delete-user-description">
            ¿Está seguro que desea eliminar al usuario
            <strong>{{ deletingUser?.name }}</strong
            >? Esta acción no se puede deshacer.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            color="gray"
            variant="outline"
            @click="isDeleteModalOpen = false"
          />
          <UButton
            label="Eliminar"
            color="red"
            icon="i-heroicons-trash"
            @click="deleteUser"
          />
        </div>
      </template>
    </UModal>

    <!-- Add WA User Modal -->
    <UModal v-model:open="isAddWAUserModalOpen" :ui="{ width: 'max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="add-user-title">
            Agregar Nuevo Usuario
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isAddWAUserModalOpen = false"
            aria-label="Close"
          />
        </div>
      </template>

      <template #body>
        <div aria-describedby="add-user-description">
          <p id="add-user-description" class="sr-only">
            Form to add a new user
          </p>
          <WAUserForm
            :user="newWAUser"
            @submit="addWAUser"
            @cancel="isAddWAUserModalOpen = false"
          />
        </div>
      </template>
    </UModal>

    <!-- Edit WA User Modal -->
    <UModal v-model:open="isEditWAUserModalOpen" :ui="{ width: 'max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="edit-user-title">
            Editar Usuario
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isEditWAUserModalOpen = false"
            aria-label="Close"
          />
        </div>
      </template>

      <template #body>
        <div aria-describedby="edit-user-description">
          <p id="edit-user-description" class="sr-only">
            Form to edit user details
          </p>
          <WAUserForm
            :user="editingWAUser"
            :is-editing="true"
            @submit="updateWAUser"
            @cancel="isEditWAUserModalOpen = false"
          />
        </div>
      </template>
    </UModal>

    <!-- View WA User Modal -->
    <UModal v-model:open="isViewWAUserModalOpen" :ui="{ width: 'max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="view-user-title">
            Detalles de Usuario
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isViewWAUserModalOpen = false"
            aria-label="Close"
          />
        </div>
      </template>

      <template #body>
        <div
          v-if="viewingWAUser"
          class="space-y-4"
          aria-describedby="view-user-description"
        >
          <p id="view-user-description" class="sr-only">
            Detailed information about the selected user
          </p>
          <div class="flex items-center space-x-4">
            <div class="bg-gray-100 rounded-full p-4">
              <UIcon name="i-heroicons-user-circle" class="text-3xl" />
            </div>
            <div>
              <h4 class="text-xl font-medium">{{ viewingWAUser.name }}</h4>
              <p class="text-gray-500">{{ viewingWAUser.phone }}</p>
            </div>
          </div>

          <hr class="my-4 border-t border-gray-200" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 class="text-sm font-medium text-gray-500">Estado</h5>
              <UBadge
                :color="viewingWAUser.is_active ? 'success' : 'error'"
                variant="subtle"
              >
                {{ viewingWAUser.is_active ? "Active" : "Inactive" }}
              </UBadge>
            </div>
            <!-- <div>
              <h5 class="text-sm font-medium text-gray-500">Created Date</h5>
              <p>
                {{
                  formatDate(
                    viewingWAUser.created_at || viewingWAUser.createdAt
                  )
                }}
              </p>
            </div> -->
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cerrar"
            color="gray"
            variant="outline"
            @click="isViewWAUserModalOpen = false"
          />
          <UButton
            label="Editar"
            icon="i-heroicons-pencil-square"
            @click="editWAFromViewModal"
          />
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteWAModalOpen">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="delete-user-title">
            Confirmar Eliminación
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isDeleteWAModalOpen = false"
            aria-label="Close"
          />
        </div>
      </template>

      <template #body>
        <div aria-describedby="delete-user-description">
          <p id="delete-user-description">
            ¿Está seguro que desea eliminar al usuario
            <strong>{{ deletingWAUser?.name }}</strong
            >? Esta acción no se puede deshacer.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            color="gray"
            variant="outline"
            @click="isDeleteWAModalOpen = false"
          />
          <UButton
            label="Eliminar"
            color="red"
            icon="i-heroicons-trash"
            @click="deleteWAUser"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "~/stores/user";
import { useWAUserStore } from "~/stores/wauser";

const userStore = useUserStore();
const loading = ref(true);
const page = ref(1);
const perPage = ref(10);
const searchQuery = ref("");
const roleFilter = ref(null);
const statusFilter = ref(null);
const dateFilter = ref(null);
const sortOption = ref(null);
const isAdvancedFilterOpen = ref(false);

const waUserStore = useWAUserStore();
const waPage = ref(1);
const waPerPage = ref(10);
const waSearchQuery = ref("");
const waRoleFilter = ref(null);
const waStatusFilter = ref(null);
const waSortOption = ref(null);
const isAdvancedWAFilterOpen = ref(false);

// Modal states
const isAddUserModalOpen = ref(false);
const isEditUserModalOpen = ref(false);
const isViewUserModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

const isAddWAUserModalOpen = ref(false);
const isEditWAUserModalOpen = ref(false);
const isViewWAUserModalOpen = ref(false);
const isDeleteWAModalOpen = ref(false);

// User data
const newUser = ref({
  name: "",
  email: "",
  password: "",
  role: "Editor",
  is_active: true,
  created_at: new Date().toISOString(),
});

const editingUser = ref({
  name: "",
  email: "",
  password: "",
  role: "Editor",
  is_active: true,
  created_at: new Date().toISOString(),
});
const viewingUser = ref({
  id: 0,
  name: "",
  email: "",
  password: "",
  role: "Editor",
  is_active: true,
  created_at: new Date().toISOString(),
});
const deletingUser = ref({
  id: 0,
  name: "",
  email: "",
});

const newWAUser = ref({
  name: "",
  email: "",
  password: "",
  role: "Editor",
  is_active: true,
  created_at: new Date().toISOString(),
});

const editingWAUser = ref({
  name: "",
  phone: "",
  is_active: true,
  created_at: new Date().toISOString(),
});
const viewingWAUser = ref({
  id: 0,
  name: "",
  phone: "",
  is_active: true,
  created_at: new Date().toISOString(),
});
const deletingWAUser = ref({
  id: 0,
  name: "",
  phone: "",
});

// Table configuration
// We're now using a simple HTML table instead of UTable

const sort = ref({ column: "id", direction: "asc" });
const waSort = ref({ column: "id", direction: "asc" });

const tabItems = [
  {
    label: "Usuarios",
    icon: "i-lucide-user",
    slot: "users",
  },
  {
    label: "Usuarios de WhatsApp",
    icon: "i-lucide-user",
    slot: "wa-users",
  },
];

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

const sortOptions = [
  { label: "Nombre (A-Z)", value: { column: "name", direction: "asc" } },
  { label: "Nombre (Z-A)", value: { column: "name", direction: "desc" } },
  { label: "Correo (A-Z)", value: { column: "email", direction: "asc" } },
  { label: "Correo (Z-A)", value: { column: "email", direction: "desc" } },
];

const waSortOptions = [
  { label: "Nombre (A-Z)", value: { column: "name", direction: "asc" } },
  { label: "Nombre (Z-A)", value: { column: "name", direction: "desc" } },
];

// Computed properties
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

  // Apply date filter
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value).setHours(0, 0, 0, 0);
    result = result.filter((user) => {
      // Handle both createdAt and created_at field names
      const dateField = user.created_at || user.createdAt;
      const userDate = new Date(dateField).setHours(0, 0, 0, 0);
      return userDate === filterDate;
    });
  }

  // Apply sorting
  if (sort.value) {
    const { column, direction } = sort.value;
    result.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  return result;
});

const waFilteredUsers = computed(() => {
  let result = [...waUserStore.wausers];

  // Apply search query
  if (waSearchQuery.value) {
    const query = waSearchQuery.value.toLowerCase();
    result = result.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  if (waStatusFilter.value !== null) {
    result = result.filter((user) => user.is_active === waStatusFilter.value);
  }

  // Apply sorting
  if (waSort.value) {
    const { column, direction } = waSort.value;
    result.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  return result;
});

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredUsers.value.slice(start, end);
});

const pageCount = computed(() => {
  return Math.ceil(filteredUsers.value.length / perPage.value);
});

const waPaginatedUsers = computed(() => {
  const start = (waPage.value - 1) * waPerPage.value;
  const end = start + waPerPage.value;
  return waFilteredUsers.value.slice(start, end);
});

const waPageCount = computed(() => {
  return Math.ceil(waFilteredUsers.value.length / waPerPage.value);
});

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value ||
    roleFilter.value ||
    statusFilter.value ||
    dateFilter.value
  );
});

const hasActiveWAFilters = computed(() => {
  return waSearchQuery.value || waRoleFilter.value || waStatusFilter.value;
});

// Methods
function applyFilters() {
  page.value = 1;

  // Apply sort option if selected
  if (sortOption.value) {
    sort.value = sortOption.value;
  }
}

function applyWAFilters() {
  waPage.value = 1;

  // Apply sort option if selected
  if (waSortOption.value) {
    waSort.value = waSortOption.value;
  }
}

function resetFilters() {
  searchQuery.value = "";
  roleFilter.value = null;
  statusFilter.value = null;
  dateFilter.value = null;
  sortOption.value = null;
  sort.value = { column: "id", direction: "asc" };
  page.value = 1;
}

function resetWAFilters() {
  waSearchQuery.value = "";
  waRoleFilter.value = null;
  waStatusFilter.value = null;
  waSortOption.value = null;
  waSort.value = { column: "id", direction: "asc" };
  waPage.value = 1;
}

function getRoleBadgeColor(role) {
  switch (role) {
    case "Admin":
      return "info";
    case "Editor":
      return "neutral";
    default:
      return "neutral";
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function viewUser(user) {
  viewingUser.value = { ...user };
  isViewUserModalOpen.value = true;
}

function editUser(user) {
  editingUser.value = { ...user };
  isEditUserModalOpen.value = true;
}

function editFromViewModal() {
  editingUser.value = { ...viewingUser.value };
  isViewUserModalOpen.value = false;
  isEditUserModalOpen.value = true;
}

function confirmDeleteUser(user) {
  deletingUser.value = user;
  isDeleteModalOpen.value = true;
}

function addUser(userData) {
  userStore.addUser(userData);
  isAddUserModalOpen.value = false;
  newUser.value = {
    name: "",
    email: "",
    role: "Editor",
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

function updateUser(userData) {
  userStore.updateUser(userData);
  isEditUserModalOpen.value = false;
}

function deleteUser() {
  if (deletingUser.value) {
    userStore.deleteUser(deletingUser.value.id);
    isDeleteModalOpen.value = false;
    deletingUser.value = null;
  }
}

function viewWAUser(user) {
  viewingWAUser.value = { ...user };
  isViewWAUserModalOpen.value = true;
}

function editWAUser(user) {
  editingWAUser.value = { ...user };
  isEditWAUserModalOpen.value = true;
}

function editWAFromViewModal() {
  editingWAUser.value = { ...viewingWAUser.value };
  isViewWAUserModalOpen.value = false;
  isEditWAUserModalOpen.value = true;
}

function confirmDeleteWAUser(user) {
  deletingWAUser.value = user;
  isDeleteWAModalOpen.value = true;
}

function addWAUser(userData) {
  waUserStore.addUser(userData);
  isAddWAUserModalOpen.value = false;
  newWAUser.value = {
    name: "",
    phone: "",
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

function updateWAUser(userData) {
  waUserStore.updateUser(userData);
  isEditWAUserModalOpen.value = false;
}

function deleteWAUser() {
  if (deletingWAUser.value) {
    waUserStore.deleteUser(deletingWAUser.value.id);
    isDeleteWAModalOpen.value = false;
    deletingWAUser.value = null;
  }
}

onMounted(async () => {
  try {
    // Always fetch users when the component is mounted
    loading.value = true;
    await userStore.fetchUsers();
    console.log("Users loaded:", userStore.users);
    await waUserStore.fetchUsers();
    console.log("WA Users loaded:", waUserStore.users);
  } catch (error) {
    console.error("Error loading users:", error);
  } finally {
    loading.value = false;
  }
});

// Define page metadata
definePageMeta({
  middleware: ["admin"],
  // The admin middleware already handles the role check,
  // but we keep this as an additional security layer
  validate: async () => {
    const authStore = useAuthStore();
    await authStore.checkAuth();
    return authStore.isAdmin;
  },
});
</script>
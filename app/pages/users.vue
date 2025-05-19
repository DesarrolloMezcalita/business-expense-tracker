<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">User Management</h1>
      <UButton
        icon="i-heroicons-plus-circle"
        label="Add User"
        @click="isAddUserModalOpen = true"
      />
    </div>

    <!-- Search and Filter Section -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-grow">
        <div class="flex">
          <UInput
            v-model="searchQuery"
            placeholder="Search by name, email..."
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
          label="Reset Filters"
        />
      </div>
    </div>

    <!-- Advanced Filter Panel -->
    <UCard v-if="isAdvancedFilterOpen" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Advanced Filters</h3>
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
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <USelect
            v-model="statusFilter"
            :items="statusOptions"
            @update:model-value="applyFilters"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700"
            >Created Date</label
          >
          <UInput
            type="date"
            v-model="dateFilter"
            @update:model-value="applyFilters"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Sort By</label>
          <USelect
            v-model="sortOption"
            :items="sortOptions"
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
                Name
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-4 text-center">Loading...</td>
            </tr>
            <tr v-else-if="paginatedUsers.length === 0">
              <td colspan="6" class="px-6 py-4 text-center">No users found</td>
            </tr>
            <tr
              v-for="user in paginatedUsers"
              :key="user.id"
              class="hover:bg-gray-50"
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
            Showing {{ paginatedUsers.length }} of
            {{ filteredUsers.length }} users
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

    <!-- Add User Modal -->
    <UModal v-model:open="isAddUserModalOpen" :ui="{ width: 'max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="add-user-title">Add New User</h3>
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
          <h3 class="text-lg font-medium" id="edit-user-title">Edit User</h3>
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
          <h3 class="text-lg font-medium" id="view-user-title">User Details</h3>
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
              <h5 class="text-sm font-medium text-gray-500">Role</h5>
              <UBadge
                :color="getRoleBadgeColor(viewingUser.role)"
                variant="subtle"
              >
                {{ viewingUser.role }}
              </UBadge>
            </div>
            <div>
              <h5 class="text-sm font-medium text-gray-500">Status</h5>
              <UBadge
                :color="viewingUser.is_active ? 'success' : 'error'"
                variant="subtle"
              >
                {{ viewingUser.is_active ? "Active" : "Inactive" }}
              </UBadge>
            </div>
            <div>
              <h5 class="text-sm font-medium text-gray-500">Created Date</h5>
              <p>
                {{
                  formatDate(viewingUser.created_at || viewingUser.createdAt)
                }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Close"
            color="gray"
            variant="outline"
            @click="isViewUserModalOpen = false"
          />
          <UButton
            label="Edit"
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
            Confirm Delete
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
            Are you sure you want to delete the user "{{ deletingUser?.name }}"?
            This action cannot be undone.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="gray"
            variant="outline"
            @click="isDeleteModalOpen = false"
          />
          <UButton
            label="Delete"
            color="red"
            icon="i-heroicons-trash"
            @click="deleteUser"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "~/stores/user";

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

// Modal states
const isAddUserModalOpen = ref(false);
const isEditUserModalOpen = ref(false);
const isViewUserModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

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

// Table configuration
// We're now using a simple HTML table instead of UTable

const sort = ref({ column: "id", direction: "asc" });

// Filter options
const roleOptions = [
  { label: "All Roles", value: null },
  { label: "Admin", value: "Admin" },
  // { label: "User", value: "User" },
  { label: "Editor", value: "Editor" },
];

const statusOptions = [
  { label: "All Statuses", value: null },
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const sortOptions = [
  { label: "ID (Ascending)", value: { column: "id", direction: "asc" } },
  { label: "ID (Descending)", value: { column: "id", direction: "desc" } },
  { label: "Name (A-Z)", value: { column: "name", direction: "asc" } },
  { label: "Name (Z-A)", value: { column: "name", direction: "desc" } },
  { label: "Email (A-Z)", value: { column: "email", direction: "asc" } },
  { label: "Email (Z-A)", value: { column: "email", direction: "desc" } },
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

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredUsers.value.slice(start, end);
});

const pageCount = computed(() => {
  return Math.ceil(filteredUsers.value.length / perPage.value);
});

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value ||
    roleFilter.value ||
    statusFilter.value ||
    dateFilter.value
  );
});

// Methods
function applyFilters() {
  page.value = 1;

  // Apply sort option if selected
  if (sortOption.value) {
    sort.value = sortOption.value;
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

onMounted(async () => {
  try {
    // Always fetch users when the component is mounted
    loading.value = true;
    await userStore.fetchUsers();
    console.log("Users loaded:", userStore.users);
  } catch (error) {
    console.error("Error loading users:", error);
  } finally {
    loading.value = false;
  }
});
</script>
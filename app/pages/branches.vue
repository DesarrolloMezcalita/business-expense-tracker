<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Sucursales</h1>
      <UButton
        icon="i-heroicons-plus"
        label="Agregar Sucursal"
        @click="isAddModalOpen = true"
      />
    </div>

    <!-- Filter Panel -->
    <BaseCatalogFilters
      v-model:search-query="searchQuery"
      search-placeholder="Buscar por nombre"
      :has-active-filters="hasActiveFilters"
      @apply-filters="applyFilters"
      @reset-filters="resetFilters"
    />

    <!-- Users Table -->
    <BaseCatalogTable
      v-model:current-page="page"
      :page-count="pageCount"
      :paginated-range="paginatedRange"
      :total-count="filteredBranches.length"
      :columns="['Nombre', 'Fecha de Creación']"
    >
      <!-- No Items Placeholder -->
      <tr v-if="loading">
        <td colspan="6" class="px-6 py-4 text-center">Cargando...</td>
      </tr>
      <tr v-else-if="paginatedBranches.length === 0">
        <td colspan="6" class="px-6 py-4 text-center">
          No se encontraron sucursales
        </td>
      </tr>

      <!-- Row Item Details -->
      <tr
        v-for="branch in paginatedBranches"
        :key="branch.id"
        class="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <td class="px-6 py-4 whitespace-nowrap">{{ branch.nombre }}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          {{ formatDate(branch.created_at) }}
        </td>

        <!-- Row Actions -->
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-eye"
              variant="ghost"
              title="View Details"
              @click="viewBranch(branch)"
            />
            <UButton
              icon="i-heroicons-pencil-square"
              variant="ghost"
              title="Edit Branch"
              @click="editBranch(branch)"
            />
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              title="Delete Branch"
              @click="confirmDeleteBranch(branch)"
            />
          </div>
        </td>
      </tr>
    </BaseCatalogTable>

    <!-- Add User Modal -->
    <BaseModal v-model="isAddModalOpen" title="Agregar Nueva Sucursal">
      <BranchForm
        :branch="newBranch"
        @submit="addBranch"
        @cancel="isAddModalOpen = false"
      />
    </BaseModal>

    <!-- Edit User Modal -->
    <BaseModal v-model="isEditModalOpen" title="Editar Sucursal">
      <BranchForm
        :branch="editingBranch"
        :is-editing="true"
        @submit="updateBranch"
        @cancel="isEditModalOpen = false"
      />
    </BaseModal>

    <!-- View User Modal -->
    <BaseModal v-model="isViewModalOpen" title="Detalles de Sucursal">
      <BranchView
        :branch="viewingBranch"
        @edit="editFromViewModal"
        @cancel="isViewModalOpen = false"
      />
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="isDeleteModalOpen" title="Confirmar Eliminación">
      <div aria-describedby="delete-user-description">
        <p id="delete-user-description">
          ¿Está seguro que desea eliminar la sucursal
          <strong>{{ deletingBranch?.nombre }}</strong
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
            @click="deleteBranch"
          />
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useBranchStore } from "~/stores/branch";

const branchStore = useBranchStore();
const loading = ref<boolean>(true);
const page = ref(1);
const perPage = ref(10);
const searchQuery = ref("");

// // Modal states
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

// // User data
const defaultBranch = {
  nombre: "",
  created_at: new Date().toISOString(),
};

const newBranch = ref({ ...defaultBranch });
const editingBranch = ref({ ...defaultBranch });
const viewingBranch = ref({ id: 0, ...defaultBranch });
const deletingBranch = ref({ id: 0, ...defaultBranch });

// // Table configuration
// // We're now using a simple HTML table instead of UTable

// // Filter options

// /* Computed properties */
const filteredBranches = computed(() => {
  let result = [...branchStore.branches];

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((branch) =>
      branch.nombre.toLowerCase().includes(query)
    );
  }

  return result;
});

const paginatedBranches = computed(() => {
  const start = (page.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredBranches.value.slice(start, end);
});

const paginatedRange = computed(() => {
  const start = (page.value - 1) * perPage.value + 1;
  const end = Math.min(
    start + perPage.value - 1,
    filteredBranches.value.length
  );
  return `${start}-${end}`;
});

const pageCount = computed(() => {
  return Math.ceil(filteredBranches.value.length / perPage.value);
});

const hasActiveFilters = computed(() => {
  if (searchQuery.value) return true;

  return false;
});

// /* Methods */
function applyFilters() {
  page.value = 1;
}

function resetFilters() {
  searchQuery.value = "";
  page.value = 1;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);

  // Opciones de formato, especificando que la zona horaria debe ser UTC.
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC", // ¡Esta es la clave!
  };

  // Usamos el locale 'es-MX' para el formato DD/MM/YYYY y las opciones con UTC.
  // Nota: es-MX naturalmente usa DD/MM/YYYY. Si necesitaras otro locale como 'en-US' (MM/DD/YYYY),
  // las opciones de year, month, day te darían control.
  return new Intl.DateTimeFormat("es-MX", options).format(date);
}

function viewBranch(branch) {
  viewingBranch.value = { ...branch };
  isViewModalOpen.value = true;
}

function editBranch(branch) {
  editingBranch.value = { ...branch };
  isEditModalOpen.value = true;
}

function editFromViewModal() {
  editingBranch.value = { ...viewingBranch.value };
  isViewModalOpen.value = false;
  isEditModalOpen.value = true;
}

function confirmDeleteBranch(branch) {
  deletingBranch.value = branch;
  isDeleteModalOpen.value = true;
}

function addBranch(branchData) {
  branchStore.addBranch(branchData);
  isAddModalOpen.value = false;
  newBranch.value = { ...defaultBranch };
}

function updateBranch(branchData) {
  branchStore.updateBranch(branchData);
  isEditModalOpen.value = false;
}

function deleteBranch() {
  if (deletingBranch.value) {
    branchStore.deleteBranch(deletingBranch.value.id);
    isDeleteModalOpen.value = false;
    deletingBranch.value = null;
  }
}

onMounted(async () => {
  try {
    // Always fetch users when the component is mounted
    loading.value = true;
    await branchStore.fetchBranches();
  } catch (error) {
    console.error("Error loading branches:", error);
  } finally {
    loading.value = false;
  }
});
</script>
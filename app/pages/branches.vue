<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Gestión de Sucursales</h1>
      <UButton
        icon="i-heroicons-plus-circle"
        label="Agregar Sucursal"
        @click="isAddBranchModalOpen = true"
      />
    </div>

    <!-- Search and Filter Section -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-grow">
        <div class="flex">
          <UInput
            v-model="searchQuery"
            placeholder="Buscar por nombre..."
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
        <UButton
          v-if="hasActiveFilters"
          icon="i-heroicons-x-mark"
          color="gray"
          variant="ghost"
          @click="resetFilters"
          label="Limpiar Filtros"
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700"
            >Ordenar Por</label
          >
          <USelect
            v-model="sortOption"
            :items="sortOptions"
            @update:model-value="applyFilters"
          />
        </div>
      </div>
    </UCard>

    <!-- Branches Table -->
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
                Fecha de Creación
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
              <td colspan="3" class="px-6 py-4 text-center">Cargando...</td>
            </tr>
            <tr v-else-if="paginatedBranches.length === 0">
              <td colspan="3" class="px-6 py-4 text-center">
                No se encontraron sucursales
              </td>
            </tr>
            <tr
              v-for="branch in paginatedBranches"
              :key="branch.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">{{ branch.nombre }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatDate(branch.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <UButton
                    icon="i-heroicons-eye"
                    color="gray"
                    variant="ghost"
                    @click="viewBranch(branch)"
                    title="Ver Detalles"
                  />
                  <UButton
                    icon="i-heroicons-pencil-square"
                    color="gray"
                    variant="ghost"
                    @click="editBranch(branch)"
                    title="Editar Sucursal"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    color="gray"
                    variant="ghost"
                    @click="confirmDeleteBranch(branch)"
                    title="Eliminar Sucursal"
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
            Mostrando {{ paginatedBranches.length }} de
            {{ filteredBranches.length }} sucursales
          </p>
          <UPagination
            v-model="page"
            :page-count="pageCount"
            :total="filteredBranches.length"
            :ui="{ wrapper: 'flex items-center gap-1' }"
          />
        </div>
      </template>
    </UCard>

    <!-- Add Branch Modal -->
    <UModal v-model:open="isAddBranchModalOpen" :ui="{ width: 'max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="add-branch-title">
            Agregar Nueva Sucursal
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isAddBranchModalOpen = false"
            aria-label="Cerrar"
          />
        </div>
      </template>

      <template #body>
        <div aria-describedby="add-branch-description">
          <p id="add-branch-description" class="sr-only">
            Formulario para agregar una nueva sucursal
          </p>
          <BranchForm
            :branch="newBranch"
            @submit="addBranch"
            @cancel="isAddBranchModalOpen = false"
          />
        </div>
      </template>
    </UModal>

    <!-- Edit Branch Modal -->
    <UModal v-model:open="isEditBranchModalOpen" :ui="{ width: 'max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="edit-branch-title">
            Editar Sucursal
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isEditBranchModalOpen = false"
            aria-label="Cerrar"
          />
        </div>
      </template>

      <template #body>
        <div aria-describedby="edit-branch-description">
          <p id="edit-branch-description" class="sr-only">
            Formulario para editar detalles de la sucursal
          </p>
          <BranchForm
            :branch="editingBranch"
            :is-editing="true"
            @submit="updateBranch"
            @cancel="isEditBranchModalOpen = false"
          />
        </div>
      </template>
    </UModal>

    <!-- View Branch Modal -->
    <UModal v-model:open="isViewBranchModalOpen" :ui="{ width: 'max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="view-branch-title">
            Detalles de la Sucursal
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isViewBranchModalOpen = false"
            aria-label="Cerrar"
          />
        </div>
      </template>

      <template #body>
        <div
          v-if="viewingBranch"
          class="space-y-4"
          aria-describedby="view-branch-description"
        >
          <p id="view-branch-description" class="sr-only">
            Información detallada sobre la sucursal seleccionada
          </p>
          <div class="flex items-center space-x-4">
            <div class="bg-gray-100 rounded-full p-4">
              <UIcon name="i-heroicons-building-office" class="text-3xl" />
            </div>
            <div>
              <h4 class="text-xl font-medium">{{ viewingBranch.nombre }}</h4>
            </div>
          </div>

          <hr class="my-4 border-t border-gray-200" />

          <div class="grid grid-cols-1 gap-4">
            <div>
              <h5 class="text-sm font-medium text-gray-500">
                Fecha de Creación
              </h5>
              <p>{{ formatDate(viewingBranch.created_at) }}</p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cerrar"
            color="gray"
            variant="outline"
            @click="isViewBranchModalOpen = false"
          />
          <UButton
            label="Editar"
            icon="i-heroicons-pencil-square"
            @click="editViewingBranch"
          />
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium" id="delete-branch-title">
            Confirmar Eliminación
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="isDeleteModalOpen = false"
            aria-label="Cerrar"
          />
        </div>
      </template>

      <template #body>
        <p class="mb-4">
          ¿Está seguro que desea eliminar la sucursal
          <strong>{{ deletingBranch.nombre }}</strong
          >? Esta acción no se puede deshacer.
        </p>
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
            @click="deleteBranch"
            :loading="isDeleting"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useBranchStore } from "~/stores/branch";

const branchStore = useBranchStore();
const loading = ref(true);
const page = ref(1);
const perPage = ref(10);
const searchQuery = ref("");
const sortOption = ref(null);
const isAdvancedFilterOpen = ref(false);

// Modal states
const isAddBranchModalOpen = ref(false);
const isEditBranchModalOpen = ref(false);
const isViewBranchModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);

// Branch data
const newBranch = ref({
  nombre: "",
  created_at: new Date().toISOString(),
});

const editingBranch = ref({
  nombre: "",
  created_at: new Date().toISOString(),
});

const viewingBranch = ref({
  id: 0,
  nombre: "",
  created_at: new Date().toISOString(),
});

const deletingBranch = ref({
  id: 0,
  nombre: "",
});

// Table configuration
const sort = ref({ column: "id", direction: "asc" });

// Sort options
const sortOptions = [
  { label: "Nombre (A-Z)", value: { column: "nombre", direction: "asc" } },
  { label: "Nombre (Z-A)", value: { column: "nombre", direction: "desc" } },
  {
    label: "Fecha (Más reciente)",
    value: { column: "created_at", direction: "desc" },
  },
  {
    label: "Fecha (Más antigua)",
    value: { column: "created_at", direction: "asc" },
  },
];

// Computed properties
const filteredBranches = computed(() => {
  let result = [...branchStore.branches];

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((branch) =>
      branch.nombre.toLowerCase().includes(query)
    );
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

const paginatedBranches = computed(() => {
  const start = (page.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredBranches.value.slice(start, end);
});

const pageCount = computed(() => {
  return Math.ceil(filteredBranches.value.length / perPage.value);
});

const hasActiveFilters = computed(() => {
  return searchQuery.value;
});

// Methods
function applyFilters() {
  page.value = 1; // Reset to first page when filters change

  if (sortOption.value) {
    sort.value = sortOption.value;
  }
}

function resetFilters() {
  searchQuery.value = "";
  sortOption.value = null;
  sort.value = { column: "id", direction: "asc" };
  page.value = 1;
}

function viewBranch(branch) {
  viewingBranch.value = { ...branch };
  isViewBranchModalOpen.value = true;
}

function editBranch(branch) {
  editingBranch.value = { ...branch };
  isEditBranchModalOpen.value = true;
}

function editViewingBranch() {
  editingBranch.value = { ...viewingBranch.value };
  isViewBranchModalOpen.value = false;
  isEditBranchModalOpen.value = true;
}

function confirmDeleteBranch(branch) {
  deletingBranch.value = {
    id: branch.id,
    nombre: branch.nombre,
  };
  isDeleteModalOpen.value = true;
}

async function addBranch(branchData) {
  try {
    await branchStore.addBranch(branchData);
    isAddBranchModalOpen.value = false;

    // Reset form
    newBranch.value = {
      nombre: "",
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error adding branch:", error);
  }
}

async function updateBranch(branchData) {
  try {
    await branchStore.updateBranch(branchData);
    isEditBranchModalOpen.value = false;
  } catch (error) {
    console.error("Error updating branch:", error);
  }
}

async function deleteBranch() {
  isDeleting.value = true;
  try {
    await branchStore.deleteBranch(deletingBranch.value.id);
    isDeleteModalOpen.value = false;
  } catch (error) {
    console.error("Error deleting branch:", error);
  } finally {
    isDeleting.value = false;
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

onMounted(async () => {
  loading.value = true;
  try {
    await branchStore.fetchBranches();
  } catch (error) {
    console.error("Error fetching branches:", error);
  } finally {
    loading.value = false;
  }
});
</script>
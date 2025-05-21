<template>
  <div class="bg-white rounded-lg shadow">
    <!-- Encabezado y botón de agregar -->
    <div class="flex justify-between items-center p-6 border-b">
      <h1 class="text-2xl font-bold text-gray-800">Gestión de Insumos</h1>
      <button
        @click="showAddForm = true"
        class="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <span class="mr-1">+</span> Agregar Insumo
      </button>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <div class="p-6 border-b">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Barra de búsqueda -->
        <div class="flex-grow relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre, descripción, proveedor..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debounceSearch"
          />
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Botón de filtros avanzados -->
        <button
          @click="showFilters = !showFilters"
          class="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            class="h-5 w-5 mr-2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filtros Avanzados
        </button>
      </div>

      <!-- Filtros avanzados (desplegable) -->
      <div
        v-if="showFilters"
        class="mt-4 p-4 border border-gray-200 rounded-md"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Filtros Avanzados</h3>
          <button
            @click="showFilters = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Ordenar por -->
          <div>
            <label
              for="sort-by"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Ordenar por</label
            >
            <select
              id="sort-by"
              v-model="filters.sortBy"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="applyFilters"
            >
              <option value="name">Nombre</option>
              <option value="category">Categoría</option>
              <option value="quantity">Cantidad</option>
              <option value="price">Precio</option>
              <option value="supplier">Proveedor</option>
              <option value="created_at">Fecha de creación</option>
            </select>
          </div>

          <!-- Orden (ascendente/descendente) -->
          <div>
            <label
              for="sort-order"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Orden</label
            >
            <select
              id="sort-order"
              v-model="filters.sortOrder"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="applyFilters"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          <!-- Botón para resetear filtros -->
          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Resetear Filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de insumos -->
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
              Tipo
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Unidad de Medida
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="supplyStore.loading">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
              Cargando insumos...
            </td>
          </tr>
          <tr v-else-if="supplyStore.error">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-red-500">
              Error: {{ supplyStore.error }}
            </td>
          </tr>
          <tr v-else-if="supplyStore.supplies.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
              No se encontraron insumos. Intente con otros filtros o agregue
              nuevos insumos.
            </td>
          </tr>
          <tr
            v-for="supply in supplyStore.supplies"
            :key="supply.id"
            class="hover:bg-gray-50"
          >
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
            >
              {{ supply.nombre }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ supply.tipo }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ supply.unidad_de_medida }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ supply.supplier }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': supply.status === 'available',
                  'bg-yellow-100 text-yellow-800':
                    supply.status === 'low_stock',
                  'bg-red-100 text-red-800': supply.status === 'out_of_stock',
                }"
              >
                {{ getStatusText(supply.status) }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <div class="flex justify-end space-x-2">
                <!-- Ver detalles -->
                <button
                  @click="viewSupply(supply.id)"
                  class="text-gray-500 hover:text-gray-700"
                  title="Ver detalles"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>

                <!-- Editar -->
                <button
                  @click="editSupply(supply.id)"
                  class="text-blue-500 hover:text-blue-700"
                  title="Editar"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                <!-- Eliminar -->
                <button
                  @click="confirmDelete(supply.id, supply.name)"
                  class="text-red-500 hover:text-red-700"
                  title="Eliminar"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="px-6 py-4 border-t flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Mostrando
        <span class="font-medium">{{ paginationInfo.from }}</span>
        a
        <span class="font-medium">{{ paginationInfo.to }}</span>
        de
        <span class="font-medium">{{ supplyStore.pagination.total }}</span>
        insumos
      </div>

      <div class="flex space-x-1">
        <!-- Primera página -->
        <button
          @click="goToPage(1)"
          :disabled="supplyStore.pagination.page === 1"
          :class="[
            'px-3 py-1 rounded-md',
            supplyStore.pagination.page === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100',
          ]"
        >
          &laquo;
        </button>

        <!-- Página anterior -->
        <button
          @click="goToPage(supplyStore.pagination.page - 1)"
          :disabled="supplyStore.pagination.page === 1"
          :class="[
            'px-3 py-1 rounded-md',
            supplyStore.pagination.page === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100',
          ]"
        >
          &lsaquo;
        </button>

        <!-- Números de página -->
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 rounded-md',
            supplyStore.pagination.page === page
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100',
          ]"
        >
          {{ page }}
        </button>

        <!-- Página siguiente -->
        <button
          @click="goToPage(supplyStore.pagination.page + 1)"
          :disabled="supplyStore.pagination.page === totalPages"
          :class="[
            'px-3 py-1 rounded-md',
            supplyStore.pagination.page === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100',
          ]"
        >
          &rsaquo;
        </button>

        <!-- Última página -->
        <button
          @click="goToPage(totalPages)"
          :disabled="supplyStore.pagination.page === totalPages"
          :class="[
            'px-3 py-1 rounded-md',
            supplyStore.pagination.page === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100',
          ]"
        >
          &raquo;
        </button>
      </div>
    </div>

    <!-- Modal para ver detalles -->
    <div
      v-if="showViewModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Detalles del Insumo</h2>
            <button
              @click="showViewModal = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div v-if="supplyStore.supply" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Nombre</h3>
                <p class="mt-1 text-base">{{ supplyStore.supply.nombre }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">Tipo</h3>
                <p class="mt-1 text-base">{{ supplyStore.supply.tipo }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">
                  Unidad de Medida
                </h3>
                <p class="mt-1 text-base">
                  {{ supplyStore.supply.unidad_de_medida }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500">
                  Fecha de creación
                </h3>
                <p class="mt-1 text-base">
                  {{ formatDate(supplyStore.supply.created_at) }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">
                  Última actualización
                </h3>
                <p class="mt-1 text-base">
                  {{ formatDate(supplyStore.supply.updated_at) }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="py-4 text-center text-gray-500">
            Cargando detalles...
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar -->
    <div
      v-if="showAddForm || showEditForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <SupplyForm
          :supply-id="editingSupplyId"
          @saved="handleFormSaved"
          @cancel="closeForm"
        />
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0 bg-red-100 rounded-full p-2 mr-3">
              <svg
                class="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">
              Confirmar eliminación
            </h3>
          </div>

          <p class="mb-4 text-gray-700">
            ¿Está seguro de que desea eliminar el insumo
            <span class="font-semibold">{{ deleteItemName }}</span
            >? Esta acción no se puede deshacer.
          </p>

          <div class="flex justify-end space-x-3">
            <button
              @click="showDeleteConfirm = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              @click="deleteSupply"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              :disabled="supplyStore.loading"
            >
              {{ supplyStore.loading ? "Eliminando..." : "Eliminar" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSupplyStore } from "~/stores/supply";
import SupplyForm from "~/components/SupplyForm.vue";

const supplyStore = useSupplyStore();

// Estado local
const searchQuery = ref("");
const showFilters = ref(false);
const showViewModal = ref(false);
const showAddForm = ref(false);
const showEditForm = ref(false);
const showDeleteConfirm = ref(false);
const editingSupplyId = ref(null);
const deleteItemId = ref(null);
const deleteItemName = ref("");
const filters = ref({
  sortBy: "created_at",
  sortOrder: "desc",
});

// Cargar insumos al montar el componente
onMounted(() => {
  supplyStore.fetchSupplies();
});

// Debounce para la búsqueda
let searchTimeout;
const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 300);
};

// Aplicar filtros
const applyFilters = () => {
  supplyStore.setFilters({
    search: searchQuery.value,
    ...filters.value,
  });
};

// Resetear filtros
const resetFilters = () => {
  searchQuery.value = "";
  filters.value = {
    sortBy: "created_at",
    sortOrder: "desc",
  };
  supplyStore.resetFilters();
};

// Paginación
const totalPages = computed(() => {
  return Math.ceil(
    supplyStore.pagination.total / supplyStore.pagination.itemsPerPage
  );
});

const displayedPages = computed(() => {
  const currentPage = supplyStore.pagination.page;
  const total = totalPages.value;

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= total - 2) {
    return [total - 4, total - 3, total - 2, total - 1, total];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
});

const paginationInfo = computed(() => {
  const page = supplyStore.pagination.page;
  const perPage = supplyStore.pagination.itemsPerPage;
  const total = supplyStore.pagination.total;

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return { from, to };
});

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  supplyStore.setPage(page);
};

// Acciones de la tabla
const viewSupply = async (id) => {
  await supplyStore.fetchSupply(id);
  showViewModal.value = true;
};

const editSupply = (id) => {
  editingSupplyId.value = id;
  showEditForm.value = true;
};

const confirmDelete = (id, name) => {
  deleteItemId.value = id;
  deleteItemName.value = name;
  showDeleteConfirm.value = true;
};

const deleteSupply = async () => {
  try {
    await supplyStore.deleteSupply(deleteItemId.value);
    showDeleteConfirm.value = false;
    deleteItemId.value = null;
    deleteItemName.value = "";
  } catch (error) {
    console.error("Error deleting supply:", error);
  }
};

// Manejo de formularios
const handleFormSaved = () => {
  closeForm();
  supplyStore.fetchSupplies();
};

const closeForm = () => {
  showAddForm.value = false;
  showEditForm.value = false;
  editingSupplyId.value = null;
};

// Utilidades
const getStatusText = (status) => {
  switch (status) {
    case "available":
      return "Disponible";
    case "low_stock":
      return "Bajo stock";
    case "out_of_stock":
      return "Sin stock";
    default:
      return status;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
</script>
<template>
  <div class="bg-white rounded-lg shadow">
    <!-- Encabezado y botón de agregar -->
    <div class="flex justify-between items-center p-6 border-b">
      <h1 class="text-2xl font-bold text-gray-800">Gestión de Categorías</h1>
      <button
        @click="showAddCategoryForm = true"
        class="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <span class="mr-1">+</span> Agregar Categoría
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
            placeholder="Buscar por nombre o descripción..."
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
                <option value="created_at">Fecha de creación</option>
                <option value="updated_at">Última actualización</option>
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
    </div>

    <!-- Tabla de Categorías -->
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
              Descripción
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Subcategorías
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
          <tr v-if="categoryStore.loading">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
              Cargando categorías...
            </td>
          </tr>
          <tr v-else-if="categoryStore.error">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-red-500">
              Error: {{ categoryStore.error }}
            </td>
          </tr>
          <tr v-else-if="categoryStore.categories.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
              No se encontraron categorías. Intente con otros filtros o agregue
              nuevas categorías.
            </td>
          </tr>
          <tr
            v-for="category in categoryStore.categories"
            :key="category.id"
            class="hover:bg-gray-50"
          >
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
            >
              {{ category.name }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              <div class="max-w-xs truncate">
                {{ category.description || "Sin descripción" }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ category.subcategories ? category.subcategories.length : 0 }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <div class="flex justify-end space-x-2">
                <!-- Ver detalles -->
                <button
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCategoryStore } from "~/stores/category";

const categoryStore = useCategoryStore();

// Estado local
const searchQuery = ref("");
const showFilters = ref(false);
const showAddCategoryForm = ref(false);
const filters = ref({
  sortBy: "name",
  sortOrder: "asc",
});

// Cargar categorías al montar el componente
onMounted(() => {
  categoryStore.fetchCategories();
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
  categoryStore.setFilters({
    search: searchQuery.value,
    ...filters.value,
  });
};

// Resetear filtros
const resetFilters = () => {
  searchQuery.value = "";
  filters.value = {
    sortBy: "name",
    sortOrder: "asc",
  };
  categoryStore.resetFilters();
};
</script>
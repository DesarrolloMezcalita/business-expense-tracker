<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Categorías y Subcategorías</h1>
      <UButton
        icon="i-heroicons-plus"
        label="Agregar Categoría"
        @click="showAddCategoryForm = true"
      />
    </div>

    <!-- Filter Panel -->
    <BaseCatalogFilters
      v-model:search-query="searchQuery"
      search-placeholder="Buscar por nombre"
    />

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
            <!-- <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Subcategorías
          </th> -->
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
              No se encontraron categorías
            </td>
          </tr>
          <template
            v-for="category in categoryStore.categories"
            :key="category.id"
          >
            <!-- Fila de categoría principal -->
            <tr class="hover:bg-gray-50">
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                <div class="flex items-center">
                  <!-- Botón expandir/colapsar -->
                  <button
                    @click="toggleExpanded(category.id)"
                    class="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    :class="{
                      'transform rotate-90': expandedCategories.includes(
                        category.id
                      ),
                    }"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <span>{{ category.nombre }}</span>
                  <!-- Contador de subcategorías -->
                  <span
                    v-if="
                      category.subcategorias_gastos &&
                      category.subcategorias_gastos.length > 0
                    "
                    class="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {{ category.subcategorias_gastos.length }}
                  </span>
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex justify-end space-x-2">
                  <!-- Agregar subcategoría -->
                  <button
                    @click="showAddSubcategoryForm(category)"
                    class="text-emerald-500 hover:text-emerald-700"
                    title="Agregar subcategoría"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>

                  <!-- Ver detalles -->
                  <button
                    @click="showCategoryDetails(category)"
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
                    @click="showEditCategoryForm(category)"
                    class="text-gray-500 hover:text-gray-700"
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
                    @click="confirmDeleteCategory(category)"
                    class="text-gray-500 hover:text-gray-700"
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

            <!-- Filas de subcategorías (cuando la categoría está expandida) -->
            <template
              v-if="
                expandedCategories.includes(category.id) &&
                category.subcategorias_gastos &&
                category.subcategorias_gastos.length > 0
              "
            >
              <tr
                v-for="subcategory in category.subcategorias_gastos"
                :key="`${category.id}-${subcategory.id}`"
                class="bg-gray-50"
              >
                <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                  <div
                    class="flex items-center pl-6 border-l-2 border-gray-300"
                  >
                    <span>{{ subcategory.nombre }}</span>
                  </div>
                </td>
                <td
                  class="px-6 py-3 whitespace-nowrap text-right text-sm font-medium"
                >
                  <div class="flex justify-end space-x-2">
                    <!-- Ver detalles de subcategoría -->
                    <button
                      @click="showSubcategoryDetails(subcategory, category)"
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

                    <!-- Editar subcategoría -->
                    <button
                      @click="showEditSubcategoryForm(subcategory, category)"
                      class="text-gray-500 hover:text-gray-700"
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

                    <!-- Eliminar subcategoría -->
                    <button
                      @click="confirmDeleteSubcategory(subcategory, category)"
                      class="text-gray-500 hover:text-gray-700"
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
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar/editar categoría -->
    <!-- <div
      v-if="showAddCategoryForm || selectedCategoryId"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="max-w-md w-full mx-auto">
        <CategoryForm
          :categoryId="selectedCategoryId"
          @saved="handleCategorySaved"
          @cancel="closeModals"
        />
      </div>
    </div> -->

    <BaseModal v-model="showAddCategoryForm" title="Agregar Nueva Categoría">
      <CategoryForm
        :category-id="selectedCategoryId"
        @saved="handleCategorySaved"
        @cancel="closeModals"
      />
    </BaseModal>

    <BaseModal v-model="selectedCategoryId" title="Editar Categoría">
      <CategoryForm
        :category-id="selectedCategoryId"
        @saved="handleCategorySaved"
        @cancel="closeModals"
      />
    </BaseModal>

    <!-- Modal para agregar/editar subcategoría -->
    <BaseModal
      v-model="showSubcategoryForm"
      :title="
        selectedSubcategoryId ? 'Editar Subcategoría' : 'Agregar Subcategoría'
      "
    >
      <form @submit.prevent="saveSubcategory" class="space-y-4">
        <div>
          <label
            for="subcategory-name"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Nombre</label
          >
          <input
            id="subcategory-name"
            v-model="subcategoryForm.nombre"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <UButton
            type="button"
            label="Cancelar"
            variant="soft"
            @click="closeModals"
          />
          <UButton
            type="submit"
            :label="
              isEditing ? 'Actualizar Subcategoría' : 'Agregar Subcategoría'
            "
            :loading="isSubmitting"
            :disabled="categoryStore.loading"
          />
        </div>
        <!-- <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModals"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            :disabled="categoryStore.loading"
          >
            {{
              categoryStore.loading
                ? "Guardando..."
                : selectedSubcategoryId
                ? "Actualizar"
                : "Guardar"
            }}
          </button>
        </div> -->
      </form>
    </BaseModal>

    <!-- <div
      v-if="showSubcategoryForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="max-w-md w-full mx-auto bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">
            {{
              selectedSubcategoryId
                ? "Editar Subcategoría"
                : "Agregar Subcategoría"
            }}
          </h2>
          <button
            @click="closeModals"
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

        <form @submit.prevent="saveSubcategory" class="space-y-4">
          <div>
            <label
              for="subcategory-name"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Nombre</label
            >
            <input
              id="subcategory-name"
              v-model="subcategoryForm.nombre"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModals"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              :disabled="categoryStore.loading"
            >
              {{
                categoryStore.loading
                  ? "Guardando..."
                  : selectedSubcategoryId
                  ? "Actualizar"
                  : "Guardar"
              }}
            </button>
          </div>
        </form>
      </div>
    </div> -->

    <!-- Modal para ver detalles de categoría/subcategoría -->

    <BaseModal
      v-model="showCategoryDetailsModal"
      :title="
        isViewingSubcategory
          ? 'Detalles de Subcategoría'
          : 'Detalles de Categoría'
      "
    >
      <div v-if="selectedCategory" class="space-y-4">
        <div>
          <h3 class="text-sm font-medium text-gray-500">Nombre</h3>
          <p class="mt-1">{{ selectedCategory.nombre }}</p>
        </div>
        <div v-if="selectedCategory.descripcion">
          <h3 class="text-sm font-medium text-gray-500">Descripción</h3>
          <p class="mt-1">{{ selectedCategory.descripcion }}</p>
        </div>
        <div v-if="isViewingSubcategory && parentCategory">
          <h3 class="text-sm font-medium text-gray-500">Categoría Principal</h3>
          <p class="mt-1">{{ parentCategory.nombre }}</p>
        </div>
      </div>
    </BaseModal>
    <!-- <div
      v-if="showCategoryDetailsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">
            {{
              isViewingSubcategory
                ? "Detalles de Subcategoría"
                : "Detalles de Categoría"
            }}
          </h2>
          <button
            @click="closeModals"
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
        <div v-if="selectedCategory" class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Nombre</h3>
            <p class="mt-1">{{ selectedCategory.nombre }}</p>
          </div>
          <div v-if="selectedCategory.descripcion">
            <h3 class="text-sm font-medium text-gray-500">Descripción</h3>
            <p class="mt-1">{{ selectedCategory.descripcion }}</p>
          </div>
          <div v-if="isViewingSubcategory && parentCategory">
            <h3 class="text-sm font-medium text-gray-500">
              Categoría Principal
            </h3>
            <p class="mt-1">{{ parentCategory.nombre }}</p>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Modal de confirmación para eliminar -->

    <BaseModal v-model="showDeleteConfirmation" title="Confirmar Eliminación">
      <p class="mb-6">
        ¿Está seguro que desea eliminar
        <span v-if="isDeletingSubcategory">la subcategoría</span>
        <span v-else>la categoría</span>
        <b> "{{ selectedCategory?.nombre }}" </b>
        ? Esta acción no se puede deshacer.
      </p>
      <!-- <div class="flex justify-end space-x-3">
        <button
          @click="closeModals"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Cancelar
        </button>
        <button
          @click="
            isDeletingSubcategory ? deleteSubcategory() : deleteCategory()
          "
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Eliminar
        </button>
      </div> -->

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" variant="soft" @click="closeModals" />
          <UButton
            label="Eliminar"
            color="error"
            icon="i-heroicons-trash"
            @click="
              isDeletingSubcategory ? deleteSubcategory() : deleteCategory()
            "
          />
        </div>
      </template>
    </BaseModal>

    <!-- <div
      v-if="showDeleteConfirmation"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-auto">
        <h2 class="text-xl font-semibold mb-4">Confirmar Eliminación</h2>
        <p class="mb-6">
          ¿Está seguro que desea eliminar
          <span v-if="isDeletingSubcategory">la subcategoría</span>
          <span v-else>la categoría</span>
          "{{ selectedCategory?.nombre }}"? Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="closeModals"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Cancelar
          </button>
          <button
            @click="
              isDeletingSubcategory ? deleteSubcategory() : deleteCategory()
            "
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCategoryStore } from "~/stores/category";
import CategoryForm from "~/components/CategoryForm.vue";

const categoryStore = useCategoryStore();

// Estado local
const searchQuery = ref("");
const showFilters = ref(false);
const showAddCategoryForm = ref(false);
const selectedCategoryId = ref(null);
const selectedCategory = ref(null);
const showCategoryDetailsModal = ref(false);
const showDeleteConfirmation = ref(false);
const expandedCategories = ref([]);
const showSubcategoryForm = ref(false);
const selectedSubcategoryId = ref(null);
const parentCategory = ref(null);
const isViewingSubcategory = ref(false);
const isDeletingSubcategory = ref(false);
const subcategoryForm = ref({
  nombre: "",
  categoria_id: null,
});
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

// Mostrar formulario de edición
const showEditCategoryForm = (category) => {
  selectedCategoryId.value = category.id;
  showAddCategoryForm.value = false;
};

// Mostrar detalles de categoría
const showCategoryDetails = (category) => {
  selectedCategory.value = category;
  showCategoryDetailsModal.value = true;
};

// Confirmar eliminación de categoría
const confirmDeleteCategory = (category) => {
  selectedCategory.value = category;
  showDeleteConfirmation.value = true;
};

// Expandir/colapsar categoría
const toggleExpanded = (categoryId) => {
  const index = expandedCategories.value.indexOf(categoryId);
  if (index === -1) {
    expandedCategories.value.push(categoryId);
  } else {
    expandedCategories.value.splice(index, 1);
  }
};

// Mostrar formulario para agregar subcategoría
const showAddSubcategoryForm = (category) => {
  parentCategory.value = category;
  subcategoryForm.value = {
    nombre: "",
    categoria_id: category.id,
  };
  selectedSubcategoryId.value = null;
  showSubcategoryForm.value = true;
};

// Mostrar formulario para editar subcategoría
const showEditSubcategoryForm = (subcategory, category) => {
  selectedSubcategoryId.value = subcategory.id;
  parentCategory.value = category;
  subcategoryForm.value = {
    nombre: subcategory.nombre,
    categoria_id: category.id,
  };
  showSubcategoryForm.value = true;
};

// Mostrar detalles de subcategoría
const showSubcategoryDetails = (subcategory, category) => {
  selectedCategory.value = subcategory;
  parentCategory.value = category;
  isViewingSubcategory.value = true;
  showCategoryDetailsModal.value = true;
};

// Confirmar eliminación de subcategoría
const confirmDeleteSubcategory = (subcategory, category) => {
  selectedCategory.value = subcategory;
  parentCategory.value = category;
  isDeletingSubcategory.value = true;
  showDeleteConfirmation.value = true;
};

// Guardar subcategoría (crear o actualizar)
const saveSubcategory = async () => {
  try {
    if (selectedSubcategoryId.value) {
      // Actualizar subcategoría existente
      await categoryStore.updateSubcategory(
        selectedSubcategoryId.value,
        subcategoryForm.value
      );
    } else {
      // Crear nueva subcategoría
      await categoryStore.createSubcategory(subcategoryForm.value);
    }
    closeModals();
    categoryStore.fetchCategories();
  } catch (error) {
    console.error("Error al guardar subcategoría:", error);
  }
};

// Eliminar subcategoría
const deleteSubcategory = async () => {
  if (selectedCategory.value) {
    await categoryStore.deleteSubcategory(selectedCategory.value.id);
    closeModals();
    categoryStore.fetchCategories();
  }
};

// Eliminar categoría
const deleteCategory = async () => {
  if (selectedCategory.value) {
    await categoryStore.deleteCategory(selectedCategory.value.id);
    closeModals();
    categoryStore.fetchCategories();
  }
};

// Manejar guardado de categoría
const handleCategorySaved = (_result) => {
  closeModals();
  categoryStore.fetchCategories();
};

// Cerrar todos los modales
const closeModals = () => {
  showAddCategoryForm.value = false;
  showSubcategoryForm.value = false;
  selectedCategoryId.value = null;
  selectedSubcategoryId.value = null;
  selectedCategory.value = null;
  parentCategory.value = null;
  showCategoryDetailsModal.value = false;
  showDeleteConfirmation.value = false;
  isViewingSubcategory.value = false;
  isDeletingSubcategory.value = false;
};
</script>
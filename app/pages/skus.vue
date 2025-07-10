<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">SKUs</h1>
      <UButton
        icon="i-heroicons-plus"
        label="Agregar SKU"
        @click="isAddModalOpen = true"
      />
    </div>

    <!-- Filter Panel -->
    <BaseCatalogFilters
      v-model:search-query="searchQuery"
      search-placeholder="Buscar por sku o proveedor"
    />

    <!-- Users Table -->
    <BaseCatalogTable
      v-model:current-page="skuStore.pagination.page"
      :page-count="skuStore.pagination.pageCount"
      :paginated-range="paginatedRange"
      :total-count="skuStore.pagination.total"
      :columns="['Sku', 'Proveedor', 'U. Medida', 'Cantidad', 'Insumo']"
    >
      <!-- No Items Placeholder -->
      <tr v-if="skuStore.loading">
        <td colspan="6" class="px-6 py-4 text-center">Cargando...</td>
      </tr>
      <tr v-else-if="skuStore.skus.length === 0">
        <td colspan="6" class="px-6 py-4 text-center">
          No se encontraron SKUs
        </td>
      </tr>

      <!-- Row Item Details -->
      <tr
        v-for="sku in skuStore.skus"
        :key="sku.id"
        class="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <td class="px-6 py-4 whitespace-nowrap">{{ sku.sku }}</td>
        <td class="px-6 py-4 whitespace-nowrap">{{ sku.proveedor }}</td>
        <td class="px-6 py-4 whitespace-nowrap">{{ sku.cantidad }}</td>
        <td class="px-6 py-4 whitespace-nowrap">{{ sku.unidad_de_medida }}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          {{ sku.insumo ? sku.insumo.nombre : "No Asignado" }}
        </td>

        <!-- Row Actions -->
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-eye"
              variant="ghost"
              title="View Details"
              @click="viewSku(sku.id)"
            />
            <UButton
              icon="i-heroicons-pencil-square"
              variant="ghost"
              title="Edit Branch"
              @click="editSku(sku.id)"
            />
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              title="Delete Branch"
              @click="confirmDelete(sku.id, sku.sku)"
            />
          </div>
        </td>
      </tr>
    </BaseCatalogTable>

    <!-- Add Modal -->
    <BaseModal v-model="isAddModalOpen" title="Agregar Nuevo SKU">
      <SkuForm
        :sku-id="editingItemId"
        @saved="addSku"
        @cancel="isAddModalOpen = false"
      />
    </BaseModal>

    <!-- Edit Modal -->
    <BaseModal v-model="isEditModalOpen" title="Editar SKU">
      <SkuForm
        :sku-id="editingItemId"
        :is-editing="true"
        @submit="addSku"
        @cancel="isEditModalOpen = false"
      />
    </BaseModal>

    <!-- View Modal -->
    <BaseModal v-model="isViewModalOpen" title="Detalles de SKU">
      <SkuView
        :sku="skuStore.sku"
        @edit="editFromViewModal"
        @cancel="isViewModalOpen = false"
      />
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="isDeleteModalOpen" title="Confirmar Eliminación">
      <div aria-describedby="delete-user-description">
        <p id="delete-user-description">
          ¿Está seguro que desea eliminar la sucursal
          <strong>{{ deleteItemName }}</strong
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
            @click="confirmDeleteSku"
          />
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useSkuStore } from "~/stores/sku";

const skuStore = useSkuStore();
const searchQuery = ref("");
const editingItemId = ref(null);
const deleteItemId = ref(null);
const deleteItemName = ref("");

// // // Modal states
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

// // // data
// const defaultBranch = {
//   nombre: "",
//   created_at: new Date().toISOString(),
// };

// const newBranch = ref({ ...defaultBranch });
// const editingBranch = ref({ ...defaultBranch });
// const viewingBranch = ref({ id: 0, ...defaultBranch });
// const deletingBranch = ref({ id: 0, ...defaultBranch });

// // // Table configuration
// // // We're now using a simple HTML table instead of UTable

// // // Filter options

// // /* Computed properties */
// const filteredBranches = computed(() => {
//   let result = [...skuStore.];

//   // Apply search query
//   if (searchQuery.value) {
//     const query = searchQuery.value.toLowerCase();
//     result = result.filter((branch) =>
//       branch.nombre.toLowerCase().includes(query)
//     );
//   }

//   return result;
// });

const paginatedRange = computed(() => {
  const start =
    (skuStore.pagination.page - 1) * skuStore.pagination.itemsPerPage + 1;
  const end = Math.min(
    start + skuStore.pagination.itemsPerPage - 1,
    skuStore.pagination.total
  );
  return `${start}-${end}`;
});

// const pageCount = computed(() => {
//   return Math.ceil(
//     filteredBranches.value.length / skuStore.pagination.itemsPerPage
//   );
// });

// const hasActiveFilters = computed(() => {
//   if (searchQuery.value) return true;

//   return false;
// });

watch(
  () => searchQuery.value,
  () => {
    debounceSearch();
  }
);

watch(
  () => skuStore.pagination.page,
  () => {
    skuStore.fetchSkus();
  }
);

// // /* Methods */
// function applyFilters() {
//   page.value = 1;
// }

// function resetFilters() {
//   searchQuery.value = "";
//   page.value = 1;
// }

// function formatDate(dateString) {
//   if (!dateString) return "";
//   const date = new Date(dateString);

//   // Opciones de formato, especificando que la zona horaria debe ser UTC.
//   const options = {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     timeZone: "UTC", // ¡Esta es la clave!
//   };

//   // Usamos el locale 'es-MX' para el formato DD/MM/YYYY y las opciones con UTC.
//   // Nota: es-MX naturalmente usa DD/MM/YYYY. Si necesitaras otro locale como 'en-US' (MM/DD/YYYY),
//   // las opciones de year, month, day te darían control.
//   return new Intl.DateTimeFormat("es-MX", options).format(date);
// }

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
  skuStore.setFilters({
    search: searchQuery.value,
  });
};

const viewSku = async (id) => {
  await skuStore.fetchSku(id);
  isViewModalOpen.value = true;
};

const editSku = async (id) => {
  editingItemId.value = id;
  isEditModalOpen.value = true;
};

function editFromViewModal() {
  editingItemId.value = skuStore.sku?.id;
  isViewModalOpen.value = false;
  isEditModalOpen.value = true;
}

const confirmDelete = (id, name) => {
  deleteItemId.value = id;
  deleteItemName.value = name;
  isDeleteModalOpen.value = true;
};

const confirmDeleteSku = async () => {
  try {
    await skuStore.deleteSku(deleteItemId.value);
    isDeleteModalOpen.value = false;
    deleteItemId.value = null;
    deleteItemName.value = "";
  } catch (error) {
    console.error("Error deleting supply:", error);
  }
};

function addSku() {
  isAddModalOpen.value = false;
  isEditModalOpen.value = false;
  editingItemId.value = null;
  skuStore.fetchSkus();
}

// function updateBranch(skuData) {
//   skuStore.updateBranch(skuData);
//   isEditModalOpen.value = false;
// }

// function deleteBranch() {
//   if (deletingBranch.value) {
//     skuStore.deleteBranch(deletingBranch.value.id);
//     isDeleteModalOpen.value = false;
//     deletingBranch.value = null;
//   }
// }

onMounted(() => {
  skuStore.fetchSkus();
});
</script>
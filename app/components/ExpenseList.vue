<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestor de Gastos</h1>
      <UButton color="primary" icon="i-heroicons-plus" @click="$emit('new')">
        Nuevo Gasto
      </UButton>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6"
    >
      <!-- Barra de búsqueda y filtros -->
      <div class="p-4 flex flex-col md:flex-row gap-4">
        <div class="flex-grow">
          <UInput
            v-model="filters.search"
            placeholder="Buscar por proveedor"
            icon="i-heroicons-magnifying-glass"
            class="w-full"
            @input="applyFilters"
          />
        </div>
        <div class="flex gap-2">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-adjustments-horizontal"
            :trailing="showAdvancedFilters"
            @click="showAdvancedFilters = !showAdvancedFilters"
          >
            Filtros
          </UButton>
          <UButton
            v-if="hasActiveFilters"
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="clearFilters"
          >
            Limpiar
          </UButton>
        </div>
      </div>

      <!-- Filtros avanzados -->
      <div
        v-if="showAdvancedFilters"
        class="px-4 pb-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <!-- <UFormGroup label="Categoría">
            <USelect
              v-model="filters.category"
              :options="categoryOptions"
              placeholder="Todas las categorías"
              @input="applyFilters"
            />
          </UFormGroup> -->

          <!-- <UFormGroup label="Forma de Pago">
            <USelect
              v-model="filters.formaPago"
              :options="formaPagoOptions"
              placeholder="Todas las formas de pago"
              @input="applyFilters"
            />
          </UFormGroup> -->

          <!-- <UFormGroup label="Ordenar por">
            <USelect
              v-model="sortBy"
              :options="sortOptions"
              placeholder="Seleccionar"
              @input="applySorting"
            />
          </UFormGroup> -->

          <UFormField label="Sucursal">
            <USelect
              v-model="filters.sucursalId"
              :items="branchOptions"
              placeholder="Todas las sucursales"
              @update:model-value="applyFilters"
            />
            <!-- @input="applyFilters" -->
          </UFormField>

          <UFormField label="Fecha desde">
            <UInput
              v-model="filters.dateFrom"
              type="date"
              @input="applyFilters"
            />
          </UFormField>

          <UFormField label="Fecha hasta">
            <UInput
              v-model="filters.dateTo"
              type="date"
              @input="applyFilters"
            />
          </UFormField>

          <!-- <UFormGroup label="Monto">
            <div class="flex space-x-2">
              <UInput
                v-model="filters.minAmount"
                type="number"
                placeholder="Min"
                @input="applyFilters"
              />
              <UInput
                v-model="filters.maxAmount"
                type="number"
                placeholder="Max"
                @input="applyFilters"
              />
            </div>
          </UFormGroup> -->
        </div>
      </div>
    </div>

    <!-- Tabla de gastos -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
      </div>

      <div v-else-if="!paginatedExpenses.length" class="py-8 text-center">
        <p class="text-gray-500 dark:text-gray-400">
          {{
            hasActiveFilters
              ? "No se encontraron gastos con los filtros aplicados."
              : "No hay gastos registrados."
          }}
        </p>
        <UButton
          v-if="hasActiveFilters"
          class="mt-4"
          size="sm"
          @click="clearFilters"
        >
          Limpiar filtros
        </UButton>
      </div>

      <div v-else>
        <!-- Vista de tabla para pantallas medianas y grandes -->
        <div class="hidden md:block">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('fecha')"
                  >
                    Fecha
                    <UIcon
                      v-if="sortField === 'fecha'"
                      :name="
                        sortDirection
                          ? 'i-heroicons-arrow-up'
                          : 'i-heroicons-arrow-down'
                      "
                      class="inline-block ml-1"
                    />
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('proveedor')"
                  >
                    Proveedor
                    <UIcon
                      v-if="sortField === 'proveedor'"
                      :name="
                        sortDirection
                          ? 'i-heroicons-arrow-up'
                          : 'i-heroicons-arrow-down'
                      "
                      class="inline-block ml-1"
                    />
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('sucursal')"
                  >
                    Sucursal
                    <UIcon
                      v-if="sortField === 'sucursal'"
                      :name="
                        sortDirection
                          ? 'i-heroicons-arrow-up'
                          : 'i-heroicons-arrow-down'
                      "
                      class="inline-block ml-1"
                    />
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('subtotal')"
                  >
                    Subtotal
                    <UIcon
                      v-if="sortField === 'subtotal'"
                      :name="
                        sortDirection
                          ? 'i-heroicons-arrow-up'
                          : 'i-heroicons-arrow-down'
                      "
                      class="inline-block ml-1"
                    />
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('descuento')"
                  >
                    Descuento
                    <UIcon
                      v-if="sortField === 'descuento'"
                      :name="
                        sortDirection
                          ? 'i-heroicons-arrow-up'
                          : 'i-heroicons-arrow-down'
                      "
                      class="inline-block ml-1"
                    />
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('impuesto')"
                  >
                    Impuesto
                    <UIcon
                      v-if="sortField === 'impuesto'"
                      :name="
                        sortDirection
                          ? 'i-heroicons-arrow-up'
                          : 'i-heroicons-arrow-down'
                      "
                      class="inline-block ml-1"
                    />
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('total')"
                  >
                    Total
                    <UIcon
                      v-if="sortField === 'total'"
                      :name="
                        sortDirection
                          ? 'i-heroicons-arrow-up'
                          : 'i-heroicons-arrow-down'
                      "
                      class="inline-block ml-1"
                    />
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr
                  v-for="expense in paginatedExpenses"
                  :key="expense.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                  >
                    {{ formatDate(expense.fecha) }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                  >
                    <span
                      :title="expense.proveedor"
                      class="inline-block max-w-[150px] truncate"
                    >
                      {{ expense.proveedor }}
                    </span>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                  >
                    {{ expense.sucursal?.nombre || "No asignada" }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                  >
                    {{ formatCurrency(expense.subtotal) }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                  >
                    {{ formatCurrency(expense.descuento) }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                  >
                    {{ formatCurrency(expense.impuesto) }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                  >
                    {{ formatCurrency(expense.total) }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                  >
                    <div class="flex justify-end space-x-2">
                      <UButton
                        color="gray"
                        variant="ghost"
                        icon="i-heroicons-eye"
                        size="xs"
                        @click="$emit('view', expense)"
                        title="Ver detalles"
                      />
                      <UButton
                        color="gray"
                        variant="ghost"
                        icon="i-heroicons-pencil-square"
                        size="xs"
                        @click="$emit('edit', expense)"
                        title="Editar"
                      />
                      <UButton
                        color="gray"
                        variant="ghost"
                        icon="i-heroicons-trash"
                        size="xs"
                        @click="confirmDelete(expense)"
                        title="Eliminar"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Vista de tarjetas para dispositivos móviles -->
        <div class="md:hidden">
          <div class="space-y-4 px-4 py-2">
            <div
              v-for="expense in paginatedExpenses"
              :key="expense.id"
              class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                    <span
                      :title="expense.proveedor"
                      class="inline-block max-w-full truncate"
                    >
                      {{ expense.proveedor }}
                    </span>
                  </h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(expense.fecha) }} |
                    {{ expense.sucursal?.nombre || "No asignada" }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium">
                    {{ formatCurrency(expense.total) }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Subtotal
                  </p>
                  <p>{{ formatCurrency(expense.subtotal) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Descuento
                  </p>
                  <p>{{ formatCurrency(expense.descuento) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Impuesto
                  </p>
                  <p>{{ formatCurrency(expense.impuesto) }}</p>
                </div>
              </div>

              <div
                class="flex justify-end space-x-2 border-t border-gray-100 dark:border-gray-700 pt-3"
              >
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-eye"
                  size="xs"
                  @click="$emit('view', expense)"
                  title="Ver detalles"
                />
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-pencil-square"
                  size="xs"
                  @click="$emit('edit', expense)"
                  title="Editar"
                />
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  size="xs"
                  @click="confirmDelete(expense)"
                  title="Eliminar"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div
          class="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700"
        >
          <div class="flex-1 flex justify-between sm:hidden">
            <UButton
              :disabled="currentPage === 1"
              @click="currentPage--"
              color="gray"
              variant="ghost"
            >
              Anterior
            </UButton>
            <UButton
              :disabled="currentPage === totalPages"
              @click="currentPage++"
              color="gray"
              variant="ghost"
            >
              Siguiente
            </UButton>
          </div>
          <div
            class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Mostrando
                <span class="font-medium">{{ paginationInfo }}</span>
              </p>
            </div>
            <div>
              <nav
                class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <UButton
                  :disabled="currentPage === 1"
                  @click="currentPage = 1"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-chevron-double-left"
                  class="rounded-l-md"
                />
                <UButton
                  :disabled="currentPage === 1"
                  @click="currentPage--"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-chevron-left"
                />
                <span
                  class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                >
                  {{ currentPage }}
                </span>
                <UButton
                  :disabled="currentPage === totalPages"
                  @click="currentPage++"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-chevron-right"
                />
                <UButton
                  :disabled="currentPage === totalPages"
                  @click="currentPage = totalPages"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-chevron-double-right"
                  class="rounded-r-md"
                />
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <UModal v-model:open="showDeleteModal">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium">Confirmar eliminación</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showDeleteModal = false"
          />
        </div>
      </template>

      <template #body>
        <p>¿Estás seguro de que deseas eliminar este gasto?</p>
        <p class="mt-2 font-medium">{{ expenseToDelete?.proveedor }}</p>
        <p class="mt-1 text-sm text-gray-500">
          Esta acción no se puede deshacer.
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton
            color="gray"
            variant="outline"
            @click="showDeleteModal = false"
          >
            Cancelar
          </UButton>
          <UButton color="red" :loading="deleteLoading" @click="deleteExpense">
            Eliminar
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useExpenseStore } from "~/stores/expense";
import { useBranchStore } from "~/stores/branch";

const emit = defineEmits(["new", "view", "edit", "delete"]);
const expenseStore = useExpenseStore();
const branchStore = useBranchStore();

// Estado local
const showDeleteModal = ref(false);
const expenseToDelete = ref(null);
const deleteLoading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showAdvancedFilters = ref(false);
const sortField = ref("fecha");
const sortDirection = ref(false); // false = desc, true = asc

// Opciones para filtros
// Estas opciones están definidas pero no se usan actualmente
// Se mantienen para uso futuro cuando se descomenten los filtros correspondientes
const _categoryOptions = [
  { label: "Alimentación", value: 1 },
  { label: "Transporte", value: 2 },
  { label: "Alojamiento", value: 3 },
  { label: "Material de oficina", value: 4 },
  { label: "Software", value: 5 },
  { label: "Equipamiento", value: 6 },
  { label: "Servicios", value: 7 },
  { label: "Marketing", value: 8 },
];

const _formaPagoOptions = [
  { label: "Todas", value: "" },
  { label: "Efectivo", value: "Efectivo" },
  { label: "Tarjeta de crédito", value: "Tarjeta de crédito" },
  { label: "Tarjeta de débito", value: "Tarjeta de débito" },
  { label: "Transferencia bancaria", value: "Transferencia bancaria" },
  { label: "Cheque", value: "Cheque" },
  { label: "Domiciliación bancaria", value: "Domiciliación bancaria" },
];

const _sortOptions = [
  { label: "Fecha (más reciente)", value: "fecha-desc" },
  { label: "Fecha (más antigua)", value: "fecha-asc" },
  { label: "Total (mayor)", value: "total-desc" },
  { label: "Total (menor)", value: "total-asc" },
  { label: "Proveedor (A-Z)", value: "proveedor-asc" },
  { label: "Proveedor (Z-A)", value: "proveedor-desc" },
];

// Estado de filtros
const filters = ref({
  search: "",
  category: "",
  status: "",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
  formaPago: "",
});

// Computed properties
const loading = computed(() => expenseStore.loading);
const paginatedExpenses = computed(() => expenseStore.paginatedExpenses);
const totalPages = computed(() => expenseStore.totalPages);
const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(
    start + itemsPerPage.value - 1,
    expenseStore.pagination.total
  );
  return `${start}-${end} de ${expenseStore.pagination.total}`;
});
const hasActiveFilters = computed(() => {
  return (
    Object.values(filters.value).some((value) => value !== "") ||
    sortField.value !== "fecha" ||
    sortDirection.value !== false
  );
});

// Opciones para el selector de sucursales
const branchOptions = computed(() => {
  const options = [{ label: "Todas las sucursales", value: "All" }];

  // Obtener todas las sucursales disponibles del store
  if (branchStore.branches && branchStore.branches.length > 0) {
    // Ordenar alfabéticamente para facilitar la selección
    const sortedBranches = [...branchStore.branches].sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );

    // Añadir todas las sucursales al selector
    sortedBranches.forEach((branch) => {
      options.push({
        label: branch.nombre,
        value: branch.id.toString(),
      });
    });
  }

  return options;
});

// Watchers
watch(currentPage, (newPage) => {
  expenseStore.setPage(newPage);
});

watch(itemsPerPage, (newLimit) => {
  expenseStore.setLimit(newLimit);
});

// Métodos
const applyFilters = async () => {
  await expenseStore.setFilters(filters.value);
};

const toggleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = !sortDirection.value;
  } else {
    sortField.value = field;
    sortDirection.value = true;
  }

  expenseStore.setSorting(sortField.value, !sortDirection.value);
};

// Esta propiedad computada se usará cuando se descomente el selector de ordenación
const _sortBy = computed({
  get() {
    return `${sortField.value}-${sortDirection.value ? "asc" : "desc"}`;
  },
  set(value) {
    if (!value) return;

    const [field, direction] = value.split("-");
    sortField.value = field;
    sortDirection.value = direction === "asc";

    expenseStore.setSorting(field, direction === "desc");
  },
});

// Este método se usará cuando se descomente el selector de ordenación
const _applySorting = () => {
  // La lógica está en el setter de _sortBy
};

const clearFilters = async () => {
  filters.value = {
    search: "",
    category: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
    formaPago: "",
    sucursalId: "",
  };
  sortField.value = "fecha";
  sortDirection.value = false;
  await expenseStore.clearFilters();
};

const confirmDelete = (expense) => {
  expenseToDelete.value = expense;
  showDeleteModal.value = true;
};

const deleteExpense = async () => {
  if (!expenseToDelete.value) return;

  deleteLoading.value = true;

  try {
    const success = await expenseStore.deleteExpense(expenseToDelete.value.id);

    if (success) {
      emit("delete", expenseToDelete.value);
      showDeleteModal.value = false;
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
  } finally {
    deleteLoading.value = false;
  }
};

// Formatters
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);

  // Opciones de formato, especificando que la zona horaria debe ser UTC.
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC", // ¡Esta es la clave!
  };

  // Usamos el locale 'es-MX' para el formato DD/MM/YYYY y las opciones con UTC.
  // Nota: es-MX naturalmente usa DD/MM/YYYY. Si necesitaras otro locale como 'en-US' (MM/DD/YYYY),
  // las opciones de year, month, day te darían control.
  return new Intl.DateTimeFormat("es-MX", options).format(date);
};

// Cargar datos al montar el componente
onMounted(async () => {
  // Cargar sucursales para el filtro
  if (!branchStore.branches.length) {
    await branchStore.fetchBranches();
  }

  await expenseStore.clearFilters();

  // Cargar gastos
  if (!expenseStore.expenses.length) {
    await expenseStore.fetchExpenses();
  }
});
</script>
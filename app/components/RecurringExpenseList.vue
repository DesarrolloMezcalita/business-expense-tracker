<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestor de Gastos Recurrentes</h1>
      <UButton color="primary" icon="i-heroicons-plus" @click="$emit('new')">
        Nuevo Gasto Recurrente
      </UButton>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 mb-6">
      <!-- Barra de búsqueda y filtros -->
      <div class="p-4 flex flex-col md:flex-row gap-4">
        <div class="flex-grow">
          <UInput
            v-model="filters.search"
            placeholder="Buscar por nombre, proveedor, descripción..."
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
        class="px-4 pb-4 border-t border-gray-200"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <UFormGroup label="Categoría">
            <USelect
              v-model="filters.category"
              :options="categoryOptions"
              placeholder="Todas las categorías"
              @input="applyFilters"
            />
          </UFormGroup>

          <UFormGroup label="Frecuencia">
            <USelect
              v-model="filters.frequency"
              :options="frequencyOptions"
              placeholder="Todas las frecuencias"
              @input="applyFilters"
            />
          </UFormGroup>

          <UFormGroup label="Estado">
            <USelect
              v-model="filters.active"
              :options="statusOptions"
              placeholder="Todos los estados"
              @input="applyFilters"
            />
          </UFormGroup>

          <UFormGroup label="Forma de Pago">
            <USelect
              v-model="filters.formaPago"
              :options="formaPagoOptions"
              placeholder="Todas las formas de pago"
              @input="applyFilters"
            />
          </UFormGroup>

          <UFormGroup label="Ordenar por">
            <USelect
              v-model="sortBy"
              :options="sortOptions"
              placeholder="Seleccionar"
              @input="applySorting"
            />
          </UFormGroup>

          <UFormGroup label="Monto">
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
          </UFormGroup>

          <UFormGroup label="Fecha inicio desde">
            <UInput
              v-model="filters.dateFrom"
              type="date"
              @input="applyFilters"
            />
          </UFormGroup>

          <UFormGroup label="Fecha inicio hasta">
            <UInput
              v-model="filters.dateTo"
              type="date"
              @input="applyFilters"
            />
          </UFormGroup>
        </div>
      </div>
    </div>

    <!-- Tabla de gastos recurrentes -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
      </div>

      <div
        v-else-if="!paginatedRecurringExpenses.length"
        class="py-8 text-center"
      >
        <p class="text-gray-500">
          {{
            hasActiveFilters
              ? "No se encontraron gastos recurrentes con los filtros aplicados."
              : "No hay gastos recurrentes registrados."
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
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('nombre')"
                  >
                    Nombre
                    <UIcon
                      v-if="sortField === 'nombre'"
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
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('monto')"
                  >
                    Monto
                    <UIcon
                      v-if="sortField === 'monto'"
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
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('frecuencia')"
                  >
                    Frecuencia
                    <UIcon
                      v-if="sortField === 'frecuencia'"
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
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    @click="toggleSort('fecha_inicio')"
                  >
                    Fecha Inicio
                    <UIcon
                      v-if="sortField === 'fecha_inicio'"
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
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
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
                <tr
                  v-for="expense in paginatedRecurringExpenses"
                  :key="expense.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ expense.nombre }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ expense.proveedor }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatCurrency(expense.monto) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatFrecuencia(expense.frecuencia) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(expense.fecha_inicio) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <UBadge
                      :color="expense.activo ? 'green' : 'gray'"
                      variant="subtle"
                      size="sm"
                    >
                      {{ expense.activo ? "Activo" : "Inactivo" }}
                    </UBadge>
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
                        :icon="
                          expense.activo
                            ? 'i-heroicons-pause'
                            : 'i-heroicons-play'
                        "
                        size="xs"
                        @click="toggleActive(expense)"
                        :title="expense.activo ? 'Desactivar' : 'Activar'"
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
              v-for="expense in paginatedRecurringExpenses"
              :key="expense.id"
              class="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ expense.nombre }}
                  </h3>
                  <p class="text-xs text-gray-500">
                    {{ expense.proveedor }}
                  </p>
                </div>
                <UBadge
                  :color="expense.activo ? 'green' : 'gray'"
                  variant="subtle"
                  size="sm"
                >
                  {{ expense.activo ? "Activo" : "Inactivo" }}
                </UBadge>
              </div>

              <div class="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <p class="text-xs text-gray-500">Monto</p>
                  <p>{{ formatCurrency(expense.monto) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Frecuencia</p>
                  <p>{{ formatFrecuencia(expense.frecuencia) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Fecha Inicio</p>
                  <p>{{ formatDate(expense.fecha_inicio) }}</p>
                </div>
                <div v-if="expense.fecha_fin">
                  <p class="text-xs text-gray-500">Fecha Fin</p>
                  <p>{{ formatDate(expense.fecha_fin) }}</p>
                </div>
              </div>

              <div
                class="flex justify-end space-x-2 border-t border-gray-100 pt-3"
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
                  :icon="
                    expense.activo ? 'i-heroicons-pause' : 'i-heroicons-play'
                  "
                  size="xs"
                  @click="toggleActive(expense)"
                  :title="expense.activo ? 'Desactivar' : 'Activar'"
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
          class="px-6 py-3 flex items-center justify-between border-t border-gray-200"
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
              <p class="text-sm text-gray-700">
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
                  class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white"
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
    <UModal v-model="showDeleteModal">
      <template #header>
        <div class="flex items-center justify-between">
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
        <p>¿Estás seguro de que deseas eliminar este gasto recurrente?</p>
        <p class="mt-2 font-medium">{{ expenseToDelete?.nombre }}</p>
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

    <!-- Modal de confirmación de cambio de estado -->
    <UModal v-model="showToggleModal">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Confirmar cambio de estado</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showToggleModal = false"
          />
        </div>
      </template>

      <template #body>
        <p>
          ¿Estás seguro de que deseas
          {{ expenseToToggle?.activo ? "desactivar" : "activar" }}
          este gasto recurrente?
        </p>
        <p class="mt-2 font-medium">{{ expenseToToggle?.nombre }}</p>
        <p class="mt-1 text-sm text-gray-500">
          {{
            expenseToToggle?.activo
              ? "Al desactivarlo, no se generarán nuevas instancias de este gasto."
              : "Al activarlo, se volverán a generar instancias de este gasto."
          }}
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton
            color="gray"
            variant="outline"
            @click="showToggleModal = false"
          >
            Cancelar
          </UButton>
          <UButton
            :color="expenseToToggle?.activo ? 'yellow' : 'green'"
            :loading="toggleLoading"
            @click="confirmToggleActive"
          >
            {{ expenseToToggle?.activo ? "Desactivar" : "Activar" }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRecurringExpenseStore } from "~/stores/recurring-expense";
import { FRECUENCIAS } from "~/types/recurring-expense";

const emit = defineEmits(["new", "view", "edit", "delete", "toggle-active"]);
const recurringExpenseStore = useRecurringExpenseStore();

// Estado local
const showDeleteModal = ref(false);
const expenseToDelete = ref(null);
const deleteLoading = ref(false);
const showToggleModal = ref(false);
const expenseToToggle = ref(null);
const toggleLoading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showAdvancedFilters = ref(false);
const sortField = ref("fecha_inicio");
const sortDirection = ref(false); // false = desc, true = asc

// Opciones para filtros
const categoryOptions = [
  { label: "Alimentación", value: 1 },
  { label: "Transporte", value: 2 },
  { label: "Alojamiento", value: 3 },
  { label: "Material de oficina", value: 4 },
  { label: "Software", value: 5 },
  { label: "Equipamiento", value: 6 },
  { label: "Servicios", value: 7 },
  { label: "Marketing", value: 8 },
];

const frequencyOptions = FRECUENCIAS.map((f) => ({
  label: f.label,
  value: f.value,
}));

const statusOptions = [
  { label: "Todos", value: null },
  { label: "Activos", value: true },
  { label: "Inactivos", value: false },
];

const formaPagoOptions = [
  { label: "Todas", value: "" },
  { label: "Efectivo", value: "Efectivo" },
  { label: "Tarjeta de crédito", value: "Tarjeta de crédito" },
  { label: "Tarjeta de débito", value: "Tarjeta de débito" },
  { label: "Transferencia bancaria", value: "Transferencia bancaria" },
  { label: "Cheque", value: "Cheque" },
  { label: "Domiciliación bancaria", value: "Domiciliación bancaria" },
];

const sortOptions = [
  { label: "Fecha inicio (más reciente)", value: "fecha_inicio-desc" },
  { label: "Fecha inicio (más antigua)", value: "fecha_inicio-asc" },
  { label: "Nombre (A-Z)", value: "nombre-asc" },
  { label: "Nombre (Z-A)", value: "nombre-desc" },
  { label: "Monto (mayor)", value: "monto-desc" },
  { label: "Monto (menor)", value: "monto-asc" },
  { label: "Proveedor (A-Z)", value: "proveedor-asc" },
  { label: "Proveedor (Z-A)", value: "proveedor-desc" },
];

// Estado de filtros
const filters = ref({
  search: "",
  category: "",
  frequency: "",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
  formaPago: "",
  active: null,
});

// Computed properties
const loading = computed(() => recurringExpenseStore.loading);
const paginatedRecurringExpenses = computed(
  () => recurringExpenseStore.paginatedRecurringExpenses
);
const totalPages = computed(() => recurringExpenseStore.totalPages);
const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(
    start + itemsPerPage.value - 1,
    recurringExpenseStore.pagination.total
  );
  return `${start}-${end} de ${recurringExpenseStore.pagination.total}`;
});
const hasActiveFilters = computed(() => {
  return (
    Object.values(filters.value).some(
      (value) => value !== "" && value !== null
    ) ||
    sortField.value !== "fecha_inicio" ||
    sortDirection.value !== false
  );
});

// Watchers
watch(currentPage, (newPage) => {
  recurringExpenseStore.setPage(newPage);
});

watch(itemsPerPage, (newLimit) => {
  recurringExpenseStore.setLimit(newLimit);
});

// Métodos
const applyFilters = () => {
  recurringExpenseStore.setFilters(filters.value);
};

const toggleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = !sortDirection.value;
  } else {
    sortField.value = field;
    sortDirection.value = true;
  }

  recurringExpenseStore.setSorting(sortField.value, !sortDirection.value);
};

const sortBy = computed({
  get() {
    return `${sortField.value}-${sortDirection.value ? "asc" : "desc"}`;
  },
  set(value) {
    if (!value) return;

    const [field, direction] = value.split("-");
    sortField.value = field;
    sortDirection.value = direction === "asc";

    recurringExpenseStore.setSorting(field, direction === "desc");
  },
});

const applySorting = () => {
  // La lógica está en el setter de sortBy
};

const clearFilters = () => {
  filters.value = {
    search: "",
    category: "",
    frequency: "",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
    formaPago: "",
    active: null,
  };
  sortField.value = "fecha_inicio";
  sortDirection.value = false;
  recurringExpenseStore.clearFilters();
};

const confirmDelete = (expense) => {
  expenseToDelete.value = expense;
  showDeleteModal.value = true;
};

const deleteExpense = async () => {
  if (!expenseToDelete.value) return;

  deleteLoading.value = true;

  try {
    const success = await recurringExpenseStore.deleteRecurringExpense(
      expenseToDelete.value.id
    );

    if (success) {
      emit("delete", expenseToDelete.value);
      showDeleteModal.value = false;
    }
  } catch (error) {
    console.error("Error deleting recurring expense:", error);
  } finally {
    deleteLoading.value = false;
  }
};

const toggleActive = (expense) => {
  expenseToToggle.value = expense;
  showToggleModal.value = true;
};

const confirmToggleActive = async () => {
  if (!expenseToToggle.value) return;

  toggleLoading.value = true;

  try {
    const updatedExpense = await recurringExpenseStore.toggleActive(
      expenseToToggle.value.id,
      !expenseToToggle.value.activo
    );

    if (updatedExpense) {
      emit("toggle-active", updatedExpense);
      showToggleModal.value = false;
    }
  } catch (error) {
    console.error("Error toggling recurring expense status:", error);
  } finally {
    toggleLoading.value = false;
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
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-MX").format(date);
};

const formatFrecuencia = (frecuencia) => {
  const found = FRECUENCIAS.find((f) => f.value === frecuencia);
  return found ? found.label : frecuencia;
};

// Cargar datos al montar el componente
onMounted(async () => {
  if (!recurringExpenseStore.recurringExpenses.length) {
    await recurringExpenseStore.fetchRecurringExpenses();
  }
});
</script>
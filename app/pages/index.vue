<template>
  <div class="flex flex-col gap-6 py-3 px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Filtro de fecha -->
      <div class="w-full bg-white rounded-lg shadow-sm p-3">
        <div
          class="flex flex-wrap flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <h3 class="text-lg font-medium text-gray-700 flex items-center">
            <UIcon name="i-heroicons-calendar" class="mr-2" />
            Rango de fechas
          </h3>

          <div class="flex items-center mt-3 lg:mt-0">
            <div class="flex items-center">
              <span class="mr-2 text-sm text-gray-500">De</span>
              <UInput
                v-model="filters.dateFrom"
                type="date"
                :max="filters.dateTo || maxFecha"
                class="w-36"
                @update:model-value="applyFilters"
              />
            </div>
            <div class="flex items-center">
              <span class="mx-2 text-sm text-gray-500">a</span>
              <UInput
                v-model="filters.dateTo"
                type="date"
                :min="filters.dateFrom"
                :max="maxFecha"
                class="w-36"
                @update:model-value="applyFilters"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Filtro de sucursal -->
      <div class="w-full bg-white rounded-lg shadow-sm p-3">
        <div
          class="flex flex-wrap flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <h3 class="text-lg font-medium text-gray-700 flex items-center">
            <UIcon name="i-heroicons-building-office-2" class="mr-2" />
            Sucursal
          </h3>
          <div class="flex items-center space-x-3 mt-3 lg:mt-0">
            <USelect
              v-model="filters.sucursalId"
              :items="branchOptions"
              placeholder="Todas las sucursales"
              class="w-48"
              @update:model-value="applyFilters"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Indicador de gastos totales para la sucursal seleccionada -->
    <!-- <div v-if="selectedBranch" class="w-full bg-blue-50 rounded-lg p-3 mt-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-building-office-2"
            class="mr-2 text-blue-500"
          />
          <span class="text-blue-700">
            Gastos totales para
            <span class="font-semibold">{{ selectedBranchName }}</span>
          </span>
        </div>
        <span class="text-xl font-bold text-blue-700"
          >${{ formatCurrency(branchTotalExpenses) }}</span
        >
      </div>
    </div> -->

    <!-- Tarjetas de resumen de gastos -->
    <ExpenseSummaryCards />

    <!-- Componentes de análisis detallado -->
    <!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <ExpenseCategoryDistribution />
      <ExpensePaymentMethodBreakdown />
    </div> -->

    <!-- Análisis por subcategoría -->
    <!-- <div class="mt-6">
      <ExpenseSubcategoryAnalysis />
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useExpenseStore } from "~/stores/expense";
import { useBranchStore } from "~/stores/branch";

// Stores
const expenseStore = useExpenseStore();
const branchStore = useBranchStore();

const maxFecha = new Date().toISOString().split("T")[0];

// Estado de filtros
const filters = ref({
  dateFrom: "",
  dateTo: "",
  sucursalId: 0,
});

// Filtro de sucursal
const selectedBranch = ref("");
const branchOptions = ref([{ label: "Todas las sucursales", value: "All" }]);

// Nombre de la sucursal seleccionada
const selectedBranchName = computed(() => {
  if (!selectedBranch.value) return "Todas las sucursales";
  const branch = branchStore.branches.find(
    (b) => b.id === selectedBranch.value
  );
  return branch ? branch.nombre : "Sucursal desconocida";
});

// Total de gastos para la sucursal seleccionada
const branchTotalExpenses = computed(() => {
  if (!selectedBranch.value) return 0;

  return expenseStore.expenses
    .filter((expense) => expense.sucursalId === parseInt(selectedBranch.value))
    .reduce((sum, expense) => sum + expense.total, 0);
});

// Métodos
const applyFilters = async () => {
  await expenseStore.setFilters2(filters.value);
};

// Formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX").format(Math.round(value));
};

// Cargar datos iniciales
onMounted(async () => {
  // Cargar sucursales
  await branchStore.fetchBranches();

  // Poblar opciones de sucursales
  branchOptions.value = [
    { label: "Todas las sucursales", value: 0 },
    ...branchStore.branches.map((branch) => ({
      label: branch.nombre,
      value: branch.id,
    })),
  ];

  // Establecer rango de fechas inicial (primer y último día del mes actual)
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  filters.value.dateFrom = firstDay.toISOString().split("T")[0];
  filters.value.dateTo = lastDay.toISOString().split("T")[0];

  // Aplicar filtros iniciales
  await applyFilters(filters.value);
});
</script>

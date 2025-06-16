<template>
  <div class="flex flex-col gap-6 py-8 px-4">
    <!-- Filtros interactivos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Filtro de fecha -->
      <div class="w-full bg-white rounded-lg shadow-sm p-3">
        <div class="flex flex-wrap items-center justify-between">
          <h3 class="text-lg font-medium text-gray-700 flex items-center">
            <UIcon name="i-heroicons-calendar" class="mr-2" />
            Fecha
          </h3>
          <div class="flex items-center space-x-3">
            <div class="flex items-center">
              <UInput
                v-model="filters.date"
                type="date"
                :max="maxFecha"
                size="sm"
                class="w-40"
                @update:model-value="applyFilters"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Filtro de sucursal -->
      <div class="w-full bg-white rounded-lg shadow-sm p-3">
        <div class="flex flex-wrap items-center justify-between">
          <h3 class="text-lg font-medium text-gray-700 flex items-center">
            <UIcon name="i-heroicons-building-office-2" class="mr-2" />
            Sucursal
          </h3>
          <div class="flex items-center space-x-3">
            <USelect
              v-model="filters.sucursalId"
              :items="branchOptions"
              placeholder="Todas las sucursales"
              @update:model-value="applyFilters"
              class="w-40"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Indicador de gastos totales para la sucursal seleccionada -->
    <div v-if="selectedBranch" class="w-full bg-blue-50 rounded-lg p-3 mt-2">
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
    </div>

    <!-- Componente de tarjetas de resumen de gastos -->
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
import ExpenseSummaryCards from "~/components/ExpenseSummaryCards.vue";
// import ExpenseCategoryDistribution from "~/components/ExpenseCategoryDistribution.vue";
// import ExpensePaymentMethodBreakdown from "~/components/ExpensePaymentMethodBreakdown.vue";
// import ExpenseSubcategoryAnalysis from "~/components/ExpenseSubcategoryAnalysis.vue";

// Define page metadata
definePageMeta({
  // No middleware required for demonstration
});

// Stores
const expenseStore = useExpenseStore();
const branchStore = useBranchStore();

const maxFecha = new Date().toISOString().split("T")[0];

// Estado de filtros
const filters = ref({
  date: "",
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

  // Establecer fecha inicial (primer día del mes actual)
  const now = new Date();
  filters.value.date = now.toISOString().split("T")[0];

  // Aplicar filtros iniciales
  await applyFilters(filters.value);
});
</script>

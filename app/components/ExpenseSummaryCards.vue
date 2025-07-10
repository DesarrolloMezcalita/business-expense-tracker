<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Total de gastos acumulados -->
    <UCard class="light:bg-gray-700 dark:bg-gray-800 text-white">
      <div class="flex justify-between items-start">
        <h3 class="text-xl font-medium">Total de Gastos</h3>
      </div>
      <div class="mt-4">
        <p class="text-4xl font-bold">${{ formatCurrency(totalExpenses) }}</p>
      </div>
    </UCard>

    <!-- Totales por forma de pago -->
    <UCard class="bg-gray-100">
      <div class="flex justify-between items-start">
        <h3 class="text-xl font-medium text-gray-800">Pago con Tarjeta</h3>
      </div>
      <div class="mt-4">
        <p class="text-4xl font-bold text-gray-800">
          ${{ formatCurrency(cardPayments) }}
        </p>
      </div>
    </UCard>

    <!-- Distribución por categoría principal -->
    <UCard class="bg-gray-100">
      <div class="flex justify-between items-start">
        <h3 class="text-xl font-medium text-gray-800">Pago en Efectivo</h3>
      </div>
      <div class="mt-4">
        <p class="text-4xl font-bold text-gray-800">
          ${{ formatCurrency(cashPayments) }}
        </p>
      </div>
    </UCard>

    <!-- Análisis por subcategoría -->
    <UCard class="bg-gray-100">
      <div class="flex justify-between items-start">
        <h3 class="text-xl font-medium text-gray-800">
          Pago con Transferencias
        </h3>
      </div>
      <div class="mt-4">
        <p class="text-4xl font-bold text-gray-800">
          ${{ formatCurrency(transferPayments) }}
        </p>
      </div>
    </UCard>
  </div>

  <!-- Distribución por categoría -->
  <!-- <div class="mt-6">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-medium">Distribución por Categoría</h3>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(category, index) in topCategories"
          :key="index"
          class="flex justify-between items-center p-2 rounded-lg"
          :class="getCategoryColorClass(index)"
        >
          <span class="font-medium">{{ category.name }}</span>
          <div class="flex items-center">
            <span class="font-bold"
              >${{ formatCurrency(category.amount) }}</span
            >
            <span class="ml-2 text-sm opacity-80"
              >{{ category.percentage }}%</span
            >
          </div>
        </div>
      </div>
    </UCard>
  </div> -->

  <!-- Análisis por subcategoría -->
  <!-- <div class="mt-6">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-medium">Análisis por Subcategoría</h3>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="(subcategory, index) in topSubcategories"
          :key="index"
          class="p-3 rounded-lg bg-gray-50"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">{{ subcategory.name }}</span>
            <UBadge :color="getSubcategoryColor(index)" variant="subtle">
              {{ subcategory.percentage }}%
            </UBadge>
          </div>
          <p class="text-xl font-bold">
            ${{ formatCurrency(subcategory.amount) }}
          </p>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              class="h-2 rounded-full"
              :class="getSubcategoryProgressColor(index)"
              :style="{ width: `${subcategory.percentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </UCard>
  </div> -->
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useExpenseStore } from "~/stores/expense";
import { useCategoryStore } from "~/stores/category";

const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();

// Datos calculados
const totalExpenses = ref(0);
const cardPayments = ref(0);
const cashPayments = ref(0);
const transferPayments = ref(0);

// Categorías principales
const topCategories = ref([
  { name: "Alimentación", amount: 0, percentage: 0 },
  { name: "Transporte", amount: 0, percentage: 0 },
  { name: "Alojamiento", amount: 0, percentage: 0 },
  { name: "Material de oficina", amount: 0, percentage: 0 },
]);

// Subcategorías
const topSubcategories = ref([
  { name: "Comidas de negocios", amount: 0, percentage: 0 },
  { name: "Vuelos", amount: 0, percentage: 0 },
  { name: "Hoteles", amount: 0, percentage: 0 },
  { name: "Papelería", amount: 0, percentage: 0 },
  { name: "Taxis", amount: 0, percentage: 0 },
  { name: "Software", amount: 0, percentage: 0 },
]);

// Formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX").format(value);
};

// Obtener clase de color para categorías
const getCategoryColorClass = (index) => {
  const colors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-orange-100 text-orange-800",
  ];
  return colors[index % colors.length];
};

// Obtener color para subcategorías
const getSubcategoryColor = (index) => {
  const colors = ["blue", "green", "purple", "orange", "red", "yellow"];
  return colors[index % colors.length];
};

// Obtener color para la barra de progreso de subcategorías
const getSubcategoryProgressColor = (index) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-yellow-500",
  ];
  return colors[index % colors.length];
};

const updateData = () => {
  // Total de gastos
  totalExpenses.value = expenseStore.expenses.reduce(
    (sum, expense) => sum + expense.total,
    0
  );

  // Totales por forma de pago
  const paymentMethods = {
    Efectivo: 0,
    Transferencia: 0,
    Tarjeta: 0,
  };

  expenseStore.expenses.forEach((expense) => {
    if (paymentMethods[expense.formaPago] !== undefined) {
      paymentMethods[expense.formaPago] += expense.total;
    }
  });

  cardPayments.value = paymentMethods["Tarjeta"];
  cashPayments.value = paymentMethods["Efectivo"];
  transferPayments.value = paymentMethods["Transferencia"];
};

watch(() => expenseStore.expenses, updateData, { deep: true });

// Cargar datos
onMounted(async () => {
  await categoryStore.fetchCategories();

  updateData();
});
</script>
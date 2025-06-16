<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-medium">Distribución por Categoría</h3>
        <UButton
          variant="ghost"
          icon="i-heroicons-adjustments-horizontal"
          size="sm"
          @click="toggleView"
        >
          {{ viewMode === "percentage" ? "Ver Montos" : "Ver Porcentajes" }}
        </UButton>
      </div>
    </template>

    <!-- Vista de gráfico -->
    <div class="h-64 mb-4">
      <div class="flex h-full">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="h-full"
          :style="{ width: `${category.percentage}%` }"
          :class="getCategoryColor(index)"
        ></div>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="(category, index) in categories"
        :key="index"
        class="flex items-center justify-between p-2 rounded-lg"
        :class="getCategoryBgColor(index)"
      >
        <div class="flex items-center">
          <div
            class="w-4 h-4 rounded-full mr-2"
            :class="getCategoryColor(index)"
          ></div>
          <span class="font-medium">{{ category.name }}</span>
        </div>
        <div class="font-bold">
          <template v-if="viewMode === 'percentage'">
            {{ category.percentage }}%
          </template>
          <template v-else> ${{ formatCurrency(category.amount) }} </template>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useExpenseStore } from "~/stores/expense";
import { useCategoryStore } from "~/stores/category";

const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();
const categories = ref([]);
const viewMode = ref("percentage"); // 'percentage' o 'amount'
const categoryMap = ref({});

// Formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX").format(Math.round(value));
};

// Obtener color para categorías
const getCategoryColor = (index) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
  ];
  return colors[index % colors.length];
};

// Obtener color de fondo para categorías
const getCategoryBgColor = (index) => {
  const colors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-orange-100 text-orange-800",
    "bg-red-100 text-red-800",
    "bg-yellow-100 text-yellow-800",
    "bg-indigo-100 text-indigo-800",
    "bg-pink-100 text-pink-800",
  ];
  return colors[index % colors.length];
};

// Cambiar entre vista de porcentajes y montos
const toggleView = () => {
  viewMode.value = viewMode.value === "percentage" ? "amount" : "percentage";
};

// Cargar categorías desde la base de datos
const loadCategoryMap = async () => {
  await categoryStore.fetchCategories();

  // Crear un mapa de ID a nombre de categoría
  categoryMap.value = {};
  categoryStore.categories.forEach((category) => {
    categoryMap.value[category.id] = category.nombre;
  });
};

// Calcular distribución de gastos por categoría
const calculateCategoryDistribution = () => {
  if (
    expenseStore.expenses.length === 0 ||
    Object.keys(categoryMap.value).length === 0
  ) {
    return;
  }

  // Calcular distribución por categoría
  const categoriesMap = {};
  expenseStore.expenses.forEach((expense) => {
    const categoryId = expense.categoriaId;
    if (!categoriesMap[categoryId]) {
      categoriesMap[categoryId] = 0;
    }
    categoriesMap[categoryId] += expense.total;
  });

  // Convertir a array y ordenar por monto
  const categoriesArray = Object.entries(categoriesMap)
    .map(([id, amount]) => ({
      id: parseInt(id),
      name: categoryMap.value[id] || `Categoría ${id}`,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Calcular porcentajes
  const totalAmount = categoriesArray.reduce((sum, cat) => sum + cat.amount, 0);

  if (totalAmount > 0) {
    categoriesArray.forEach((cat) => {
      cat.percentage = Math.round((cat.amount / totalAmount) * 100);
    });

    // Asegurar que los porcentajes sumen 100%
    const totalPercentage = categoriesArray.reduce(
      (sum, cat) => sum + cat.percentage,
      0
    );
    if (totalPercentage !== 100 && categoriesArray.length > 0) {
      // Ajustar el porcentaje de la categoría más grande
      const diff = 100 - totalPercentage;
      categoriesArray[0].percentage += diff;
    }

    categories.value = categoriesArray;
  }
};

// Observar cambios en las categorías y gastos
watch(() => categoryStore.categories, calculateCategoryDistribution, {
  deep: true,
});
watch(() => expenseStore.expenses, calculateCategoryDistribution, {
  deep: true,
});

// Cargar datos
onMounted(async () => {
  await Promise.all([expenseStore.fetchExpenses(), loadCategoryMap()]);

  calculateCategoryDistribution();
});
</script>
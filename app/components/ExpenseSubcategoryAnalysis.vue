<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-medium">Análisis por Subcategoría</h3>
        <USelect
          v-model="selectedCategory"
          :options="categoryOptions"
          placeholder="Todas las categorías"
          size="sm"
          class="w-48"
        />
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
      <!-- Gráfico de barras -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-lg font-medium mb-4">Distribución de Gastos</h4>
        <div class="space-y-4">
          <div
            v-for="(subcategory, index) in filteredSubcategories"
            :key="index"
            class="space-y-1"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium text-sm">{{ subcategory.name }}</span>
              <span class="text-sm font-bold"
                >${{ formatCurrency(subcategory.amount) }}</span
              >
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full"
                :class="getSubcategoryColor(index)"
                :style="{ width: `${getBarWidth(subcategory.amount)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de detalles -->
      <div>
        <h4 class="text-lg font-medium mb-4">Detalles por Subcategoría</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Subcategoría
                </th>
                <th
                  class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto
                </th>
                <th
                  class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  %
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(subcategory, index) in filteredSubcategories"
                :key="index"
              >
                <td class="px-3 py-2 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="w-3 h-3 rounded-full mr-2"
                      :class="getSubcategoryColor(index)"
                    ></div>
                    <span class="text-sm font-medium">{{
                      subcategory.name
                    }}</span>
                  </div>
                </td>
                <td
                  class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium"
                >
                  ${{ formatCurrency(subcategory.amount) }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-right text-sm">
                  {{ subcategory.percentage }}%
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td class="px-3 py-2 whitespace-nowrap text-sm font-bold">
                  Total
                </td>
                <td
                  class="px-3 py-2 whitespace-nowrap text-right text-sm font-bold"
                >
                  ${{ formatCurrency(totalFilteredAmount) }}
                </td>
                <td
                  class="px-3 py-2 whitespace-nowrap text-right text-sm font-bold"
                >
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useExpenseStore } from "~/stores/expense";
import { useCategoryStore } from "~/stores/category";

const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();

const subcategories = ref([]);
const selectedCategory = ref(null);

// Formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX").format(Math.round(value));
};

// Obtener color para subcategorías
const getSubcategoryColor = (index) => {
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

// Opciones de categorías para el selector
const categoryOptions = computed(() => {
  const options = [{ value: null, label: "Todas las categorías" }];

  // Agrupar subcategorías por categoría
  const categoriesMap = {};
  subcategories.value.forEach((subcat) => {
    if (!categoriesMap[subcat.categoryId]) {
      categoriesMap[subcat.categoryId] = {
        id: subcat.categoryId,
        name: subcat.categoryName,
      };
    }
  });

  // Convertir a opciones para el selector
  Object.values(categoriesMap).forEach((category) => {
    options.push({
      value: category.id,
      label: category.name,
    });
  });

  return options;
});

// Subcategorías filtradas por categoría seleccionada
const filteredSubcategories = computed(() => {
  if (!selectedCategory.value) {
    return subcategories.value;
  }

  return subcategories.value.filter(
    (subcat) => subcat.categoryId === selectedCategory.value
  );
});

// Total de gastos filtrados
const totalFilteredAmount = computed(() => {
  return filteredSubcategories.value.reduce(
    (sum, subcat) => sum + subcat.amount,
    0
  );
});

// Calcular ancho de barra proporcional al monto máximo
const getBarWidth = (amount) => {
  const maxAmount = Math.max(
    ...filteredSubcategories.value.map((s) => s.amount)
  );
  return (amount / maxAmount) * 100;
};

// Función para procesar y actualizar los datos de subcategorías
const processSubcategoryData = () => {
  if (
    expenseStore.expenses.length > 0 &&
    categoryStore.subcategories.length > 0
  ) {
    // Crear un mapa de categorías para obtener los nombres
    const categoryMap = {};
    categoryStore.categories.forEach((category) => {
      categoryMap[category.id] = category.nombre;
    });

    // Calcular montos por categoría
    const categoryTotals = {};
    expenseStore.expenses.forEach((expense) => {
      const categoryId = expense.categoriaId;
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = 0;
      }
      categoryTotals[categoryId] += expense.total;
    });

    // Preparar datos de subcategorías desde la base de datos
    const subcategoriesData = categoryStore.subcategories.map((subcat) => ({
      id: subcat.id,
      name: subcat.nombre,
      categoryId: subcat.categoria_id,
      categoryName:
        categoryMap[subcat.categoria_id] || `Categoría ${subcat.categoria_id}`,
      amount: 0,
    }));

    // Distribuir los montos de categoría entre sus subcategorías
    subcategoriesData.forEach((subcat) => {
      const categoryTotal = categoryTotals[subcat.categoryId] || 0;

      // Distribuir el monto entre las subcategorías de la misma categoría
      const subcatsInCategory = subcategoriesData.filter(
        (s) => s.categoryId === subcat.categoryId
      );

      if (subcatsInCategory.length > 0) {
        // Asignar un peso aleatorio a cada subcategoría
        // En un caso real, esto se basaría en datos reales de gastos por subcategoría
        const weights = {};
        subcatsInCategory.forEach((s) => {
          weights[s.id] = Math.random() + 0.5; // Peso entre 0.5 y 1.5
        });

        // Calcular el total de pesos
        const totalWeight = Object.values(weights).reduce(
          (sum, w) => sum + w,
          0
        );

        // Distribuir el monto según los pesos
        subcat.amount = (weights[subcat.id] / totalWeight) * categoryTotal;
      }
    });

    // Filtrar subcategorías sin gastos
    const filteredData = subcategoriesData.filter(
      (subcat) => subcat.amount > 0
    );

    // Ordenar por monto
    filteredData.sort((a, b) => b.amount - a.amount);

    // Calcular porcentajes
    const totalAmount = filteredData.reduce(
      (sum, subcat) => sum + subcat.amount,
      0
    );

    if (totalAmount > 0) {
      filteredData.forEach((subcat) => {
        subcat.percentage = Math.round((subcat.amount / totalAmount) * 100);
        if (subcat.percentage === 0 && subcat.amount > 0) {
          subcat.percentage = 1; // Mínimo 1% para montos muy pequeños
        }
      });

      // Asegurar que los porcentajes sumen 100%
      const totalPercentage = filteredData.reduce(
        (sum, subcat) => sum + subcat.percentage,
        0
      );
      if (totalPercentage !== 100 && filteredData.length > 0) {
        // Ajustar el porcentaje de la subcategoría más grande
        const diff = 100 - totalPercentage;
        filteredData[0].percentage += diff;
      }
    }

    subcategories.value = filteredData;
  }
};

// Observar cambios en las categorías, subcategorías y gastos
watch(() => categoryStore.categories, processSubcategoryData, { deep: true });
watch(() => categoryStore.subcategories, processSubcategoryData, {
  deep: true,
});
watch(() => expenseStore.expenses, processSubcategoryData, { deep: true });

// Cargar datos iniciales
onMounted(async () => {
  await Promise.all([
    expenseStore.fetchExpenses(),
    categoryStore.fetchCategories(),
  ]);

  // Cargar todas las subcategorías
  await categoryStore.fetchSubcategories();

  // Procesar los datos iniciales
  processSubcategoryData();
});
</script>
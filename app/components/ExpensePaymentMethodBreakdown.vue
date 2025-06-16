<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-medium">Desglose por Forma de Pago</h3>
      </div>
    </template>

    <!-- Gráfico circular -->
    <div class="flex justify-center my-4">
      <div class="relative w-48 h-48">
        <!-- Círculo base -->
        <div class="absolute inset-0 rounded-full bg-gray-100"></div>

        <!-- Segmentos del gráfico -->
        <template v-for="(segment, index) in paymentSegments" :key="index">
          <div
            class="absolute inset-0 rounded-full"
            :style="{
              clipPath: `polygon(50% 50%, ${
                50 + 50 * Math.cos(segment.startAngle)
              }% ${50 + 50 * Math.sin(segment.startAngle)}%, ${segment.path}, ${
                50 + 50 * Math.cos(segment.endAngle)
              }% ${50 + 50 * Math.sin(segment.endAngle)}%)`,
              backgroundColor: segment.color,
            }"
          ></div>
        </template>

        <!-- Círculo central (para crear efecto de dona) -->
        <div
          class="absolute rounded-full bg-white"
          style="top: 25%; left: 25%; width: 50%; height: 50%"
        >
          <div class="flex flex-col items-center justify-center h-full">
            <span class="text-sm text-gray-500">Total</span>
            <span class="font-bold">${{ formatCurrency(totalAmount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div
        v-for="(method, index) in paymentMethods"
        :key="index"
        class="flex items-center justify-between p-3 rounded-lg"
        :class="getPaymentMethodBgColor(index)"
      >
        <div class="flex items-center">
          <div
            class="w-4 h-4 rounded-full mr-2"
            :style="{ backgroundColor: getPaymentMethodColor(index) }"
          ></div>
          <span class="font-medium">{{ method.name }}</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="font-bold">${{ formatCurrency(method.amount) }}</span>
          <span class="text-sm text-gray-500">{{ method.percentage }}%</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useExpenseStore } from "~/stores/expense";

const expenseStore = useExpenseStore();
const paymentMethods = ref([]);
const totalAmount = ref(0);

// Formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX").format(Math.round(value));
};

// Colores para los métodos de pago
const getPaymentMethodColor = (index) => {
  const colors = [
    "#4F46E5", // Indigo
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#EC4899", // Pink
  ];
  return colors[index % colors.length];
};

// Colores de fondo para los métodos de pago
const getPaymentMethodBgColor = (index) => {
  const colors = [
    "bg-indigo-100 text-indigo-800",
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-red-100 text-red-800",
    "bg-violet-100 text-violet-800",
    "bg-pink-100 text-pink-800",
  ];
  return colors[index % colors.length];
};

// Calcular segmentos para el gráfico circular
const paymentSegments = computed(() => {
  const segments = [];
  let startAngle = -Math.PI / 2; // Comenzar desde arriba (270 grados)

  paymentMethods.value.forEach((method, index) => {
    const angleSize = (method.percentage / 100) * 2 * Math.PI;
    const endAngle = startAngle + angleSize;

    // Calcular puntos intermedios para el path del polígono
    const steps = Math.max(2, Math.floor(angleSize * 10)); // Más pasos para segmentos más grandes
    let path = "";

    for (let i = 1; i < steps; i++) {
      const stepAngle = startAngle + (angleSize * i) / steps;
      const x = 50 + 50 * Math.cos(stepAngle);
      const y = 50 + 50 * Math.sin(stepAngle);
      path += `${x}% ${y}%, `;
    }

    segments.push({
      startAngle,
      endAngle,
      path,
      color: getPaymentMethodColor(index),
    });

    startAngle = endAngle;
  });

  return segments;
});

// Cargar datos
onMounted(async () => {
  await expenseStore.fetchExpenses();

  if (expenseStore.expenses.length > 0) {
    // Calcular totales por forma de pago
    const methodsMap = {};

    expenseStore.expenses.forEach((expense) => {
      const method = expense.formaPago;
      if (!methodsMap[method]) {
        methodsMap[method] = 0;
      }
      methodsMap[method] += expense.total;
    });

    // Simplificar los métodos de pago
    const simplifiedMethods = {
      "Tarjeta de crédito": 0,
      "Tarjeta corporativa": 0,
      Efectivo: 0,
      "Transferencia bancaria": 0,
      "Domiciliación bancaria": 0,
    };

    // Agrupar los métodos de pago
    Object.entries(methodsMap).forEach(([method, amount]) => {
      if (method.includes("Tarjeta")) {
        if (method.includes("corporativa")) {
          simplifiedMethods["Tarjeta corporativa"] += amount;
        } else {
          simplifiedMethods["Tarjeta de crédito"] += amount;
        }
      } else if (method.includes("Efectivo")) {
        simplifiedMethods["Efectivo"] += amount;
      } else if (method.includes("Transferencia")) {
        simplifiedMethods["Transferencia bancaria"] += amount;
      } else if (method.includes("Domiciliación")) {
        simplifiedMethods["Domiciliación bancaria"] += amount;
      } else {
        // Si hay un método no reconocido, agregarlo a Otros
        if (!simplifiedMethods["Otros"]) {
          simplifiedMethods["Otros"] = 0;
        }
        simplifiedMethods["Otros"] += amount;
      }
    });

    // Convertir a array y ordenar por monto
    const methodsArray = Object.entries(simplifiedMethods)
      .filter(([_, amount]) => amount > 0) // Eliminar métodos sin gastos
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calcular el total
    totalAmount.value = methodsArray.reduce(
      (sum, method) => sum + method.amount,
      0
    );

    // Calcular porcentajes
    methodsArray.forEach((method) => {
      method.percentage = Math.round((method.amount / totalAmount.value) * 100);
    });

    // Asegurar que los porcentajes sumen 100%
    const totalPercentage = methodsArray.reduce(
      (sum, method) => sum + method.percentage,
      0
    );
    if (totalPercentage !== 100 && methodsArray.length > 0) {
      // Ajustar el porcentaje del método más grande
      const diff = 100 - totalPercentage;
      methodsArray[0].percentage += diff;
    }

    paymentMethods.value = methodsArray;
  }
});
</script>
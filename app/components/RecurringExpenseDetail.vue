<template>
  <div>
    <div class="flex justify-between items-start mb-6">
      <div>
        <h2 class="text-xl font-bold text-gray-900">{{ expense.nombre }}</h2>
        <p class="text-sm text-gray-500">{{ expense.proveedor }}</p>
      </div>
      <UBadge
        :color="expense.activo ? 'green' : 'gray'"
        variant="subtle"
        size="md"
      >
        {{ expense.activo ? "Activo" : "Inactivo" }}
      </UBadge>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <h3 class="text-sm font-medium text-gray-500 mb-1">Monto</h3>
        <p class="text-base font-medium">
          {{ formatCurrency(expense.monto) }}
        </p>
      </div>
      <div>
        <h3 class="text-sm font-medium text-gray-500 mb-1">Día de cobro</h3>
        <p class="text-base">{{ formatDiaCobro(expense) }}</p>
      </div>
      <div>
        <h3 class="text-sm font-medium text-gray-500 mb-1">Forma de pago</h3>
        <p class="text-base">{{ expense.formapago }}</p>
      </div>
      <!-- <div>
        <h3 class="text-sm font-medium text-gray-500 mb-1">Categoría</h3>
        <p class="text-base">{{ getCategoryName(expense.categoriaId) }}</p>
      </div> -->
      <div>
        <h3 class="text-sm font-medium text-gray-500 mb-1">Sucursal</h3>
        <p class="text-base">{{ getBranchName(expense.sucursal?.nombre) }}</p>
      </div>
    </div>

    <div v-if="expense.descripcion" class="mb-6">
      <h3 class="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
      <p class="text-base whitespace-pre-line">{{ expense.descripcion }}</p>
    </div>

    <!-- <div class="border-t border-gray-200 pt-6">
      <h3 class="text-lg font-medium mb-4">Historial de pagos</h3>

      <div v-if="loading" class="flex justify-center py-4">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
      </div>

      <div v-else-if="!instances.length" class="text-center py-4">
        <p class="text-gray-500">
          No hay registros de pagos para este gasto recurrente.
        </p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto
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
                v-for="instance in instances"
                :key="instance.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(instance.fecha) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatCurrency(instance.monto) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <UBadge
                    :color="instance.pagado ? 'green' : 'yellow'"
                    variant="subtle"
                    size="sm"
                  >
                    {{ instance.pagado ? "Pagado" : "Pendiente" }}
                  </UBadge>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <div class="flex justify-end space-x-2">
                    <UButton
                      v-if="!instance.pagado"
                      color="green"
                      variant="ghost"
                      icon="i-heroicons-check"
                      size="xs"
                      @click="$emit('mark-paid', instance)"
                      title="Marcar como pagado"
                    />
                    <UButton
                      v-if="instance.pagado && instance.compra_gasto_id"
                      color="gray"
                      variant="ghost"
                      icon="i-heroicons-document-text"
                      size="xs"
                      @click="$emit('view-expense', instance.compra_gasto_id)"
                      title="Ver gasto asociado"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div> -->

    <div class="flex justify-end space-x-2 mt-6">
      <UButton color="gray" variant="outline" @click="$emit('close')">
        Cerrar
      </UButton>
      <UButton
        color="primary"
        icon="i-heroicons-pencil-square"
        @click="$emit('edit', expense)"
      >
        Editar
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRecurringExpenseStore } from "~/stores/recurring-expense";
import { useBranchStore } from "~/stores/branch";

const props = defineProps({
  expense: {
    type: Object,
    required: true,
  },
});

defineEmits(["close", "edit", "toggle-active", "mark-paid", "view-expense"]);
const recurringExpenseStore = useRecurringExpenseStore();
const branchStore = useBranchStore();

const loading = ref(false);
const instances = ref([]);

// No necesitamos opciones de sucursales ya que usamos directamente el nombre

// Métodos

const getBranchName = (nombre) => {
  return nombre || "No asignada";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

const formatDiaCobro = (expense) => {
  if (!expense.dia_cobro) return "No especificado";

  if (expense.frecuencia === "semanal") {
    const diasSemana = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];
    return diasSemana[expense.dia_cobro - 1] || `Día ${expense.dia_cobro}`;
  } else if (
    ["mensual", "bimestral", "trimestral", "semestral", "anual"].includes(
      expense.frecuencia
    )
  ) {
    return `Día ${expense.dia_cobro} del mes`;
  } else {
    return `${expense.dia_cobro}`;
  }
};

// Cargar instancias del gasto recurrente
const fetchInstances = async () => {
  loading.value = true;
  try {
    const data = await recurringExpenseStore.fetchInstances(props.expense.id);
    instances.value = data;
  } catch (error) {
    console.error("Error fetching instances:", error);
  } finally {
    loading.value = false;
  }
};

// Inicialización
onMounted(async () => {
  fetchInstances();

  // Cargar sucursales si no están cargadas
  if (!branchStore.branches.length) {
    try {
      await branchStore.fetchBranches();
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
    }
  }
});
</script>
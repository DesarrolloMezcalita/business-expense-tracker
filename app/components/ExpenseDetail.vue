<template>
  <div v-if="loading" class="flex justify-center py-8">
    <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
  </div>

  <div v-else-if="!expense" class="py-8 text-center text-gray-500">
    No se encontró información del gasto.
  </div>

  <div v-else class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 class="text-sm font-medium text-gray-500">Fecha</h4>
        <p class="mt-1">{{ formatDate(expense.fecha) }}</p>
      </div>

      <div>
        <h4 class="text-sm font-medium text-gray-500">Proveedor</h4>
        <p class="mt-1">{{ expense.proveedor }}</p>
      </div>

      <div>
        <h4 class="text-sm font-medium text-gray-500">Sucursal</h4>
        <p class="mt-1">{{ getSucursalName(expense.sucursalId) }}</p>
      </div>
    </div>

    <!-- Detalles del gasto (insumos o conceptos) -->
    <div class="mt-6">
      <h4 class="text-sm font-medium text-gray-500 mb-2">Detalles del Gasto</h4>

      <div
        v-if="!expense.items || expense.items.length === 0"
        class="text-center py-4 border border-dashed border-gray-300 rounded-md"
      >
        <p class="text-gray-500">
          No hay detalles disponibles para este gasto.
        </p>
      </div>

      <div v-else class="border rounded-md">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Concepto
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cant
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Precio Unitario
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Subtotal
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Descuento
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Impuesto
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(item, index) in expense.items"
                :key="index"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ item.concepto || item.nombre }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ item.cantidad }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{
                    formatCurrency(item.precioUnitario || item.precio_unitario)
                  }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ formatCurrency(item.subtotal) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ formatCurrency(item.descuento) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ formatCurrency(item.impuesto) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ formatCurrency(item.total) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 class="text-sm font-medium text-gray-500">Subtotal</h4>
        <p class="mt-1">{{ formatCurrency(expense.subtotal) }}</p>
      </div>

      <div>
        <h4 class="text-sm font-medium text-gray-500">Descuento</h4>
        <p class="mt-1">{{ formatCurrency(expense.descuento) }}</p>
      </div>

      <div>
        <h4 class="text-sm font-medium text-gray-500">Impuesto</h4>
        <p class="mt-1">{{ formatCurrency(expense.impuesto) }}</p>
      </div>

      <div>
        <h4 class="text-sm font-medium text-gray-500">Total</h4>
        <p class="mt-1 font-medium">{{ formatCurrency(expense.total) }}</p>
      </div>

      <div>
        <h4 class="text-sm font-medium text-gray-500">Forma de Pago</h4>
        <p class="mt-1">{{ expense.formaPago }}</p>
      </div>
    </div>

    <div v-if="expense.comprobante" class="mt-6">
      <h4 class="text-sm font-medium text-gray-500 mb-2">Comprobante</h4>
      <div class="border rounded-lg overflow-hidden">
        <img
          :src="expense.comprobante"
          alt="Comprobante"
          class="w-full h-auto max-h-64 object-contain"
          @error="imageError = true"
        />
        <div v-if="imageError" class="p-4 text-center text-gray-500">
          <UIcon name="i-heroicons-photo" class="h-12 w-12 mx-auto mb-2" />
          <p>No se pudo cargar la imagen del comprobante.</p>
          <UButton
            size="sm"
            color="gray"
            variant="outline"
            class="mt-2"
            :to="expense.comprobante"
            target="_blank"
          >
            Ver enlace
          </UButton>
        </div>
      </div>
    </div>
  </div>

  <div class="flex justify-end space-x-2 mt-5">
    <UButton color="gray" variant="outline" @click="$emit('close')">
      Cerrar
    </UButton>
    <UButton
      color="yellow"
      icon="i-heroicons-pencil-square"
      @click="$emit('edit', expense)"
    >
      Editar
    </UButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useBranchStore } from "~/stores/branch";

// Initialize the branch store
const branchStore = useBranchStore();

const props = defineProps({
  expense: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close", "edit"]);
const imageError = ref(false);

// Formatters
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-MX").format(date);
};

const _formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A";

  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Helper functions for category and sucursal names
const _getCategoryName = (categoryId) => {
  const categories = {
    1: "Alimentación",
    2: "Transporte",
    3: "Alojamiento",
    4: "Material de oficina",
    5: "Software",
    6: "Equipamiento",
    7: "Servicios",
    8: "Marketing",
    9: "Otros",
  };

  return categories[categoryId] || `Categoría ${categoryId}`;
};

const getSucursalName = (sucursalId) => {
  // Get the branch from the store
  const branch = branchStore.getBranchById(sucursalId);

  // Return the branch name if found, otherwise a fallback
  return branch ? branch.nombre : `Sucursal ${sucursalId}`;
};

// Fetch branches when component is mounted
onMounted(async () => {
  // Only fetch if branches haven't been loaded yet
  if (branchStore.branches.length === 0) {
    await branchStore.fetchBranches();
  }
});

// Calcular el total de los conceptos
const _calculateItemsTotal = () => {
  if (
    !props.expense ||
    !props.expense.items ||
    props.expense.items.length === 0
  ) {
    return 0;
  }

  return props.expense.items.reduce((total, item) => total + item.subtotal, 0);
};
</script>
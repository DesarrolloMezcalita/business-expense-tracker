<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">Detalles del Gasto</h3>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="$emit('close')"
        />
      </div>
    </template>

    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
    </div>

    <div v-else-if="!expense" class="py-8 text-center text-gray-500">
      No se encontró información del gasto.
    </div>

    <div v-else class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="text-sm font-medium text-gray-500">Proveedor</h4>
          <p class="mt-1">{{ expense.proveedor }}</p>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-500">Total</h4>
          <p class="mt-1 font-medium">{{ formatCurrency(expense.total) }}</p>
        </div>

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
          <h4 class="text-sm font-medium text-gray-500">Fecha</h4>
          <p class="mt-1">{{ formatDate(expense.fecha) }}</p>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-500">Categoría</h4>
          <p class="mt-1">{{ getCategoryName(expense.categoriaId) }}</p>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-500">Sucursal</h4>
          <p class="mt-1">{{ getSucursalName(expense.sucursalId) }}</p>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-500">Forma de Pago</h4>
          <p class="mt-1">{{ expense.formaPago }}</p>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-500">Estado</h4>
          <div class="mt-1">
            <UBadge
              :color="expense.validado ? 'green' : 'yellow'"
              variant="subtle"
            >
              {{ expense.validado ? "Validado" : "Pendiente" }}
            </UBadge>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-500">Fecha de creación</h4>
          <p class="mt-1">{{ formatDateTime(expense.created_at) }}</p>
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

    <template #footer>
      <div class="flex justify-end space-x-2">
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
  </UCard>
</template>

<script setup>
import { ref } from "vue";

defineProps({
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

const formatDateTime = (dateTimeString) => {
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
const getCategoryName = (categoryId) => {
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
  const sucursales = {
    1: "Sucursal Principal",
    2: "Sucursal Norte",
    3: "Sucursal Sur",
  };

  return sucursales[sucursalId] || `Sucursal ${sucursalId}`;
};
</script>
<template>
  <div>
    <div v-if="sku" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="text-sm font-medium text-gray-500">SKU</h3>
          <p class="mt-1 text-base">{{ sku.sku }}</p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-500">Proveedor</h3>
          <p class="mt-1 text-base">{{ sku.proveedor }}</p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-500">Unidad de Medida</h3>
          <p class="mt-1 text-base">
            {{ sku.unidad_de_medida }}
          </p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-500">Cantidad</h3>
          <p class="mt-1 text-base">{{ sku.cantidad }}</p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-500">Insumo</h3>
          <p class="mt-1 text-base">
            {{ sku.insumo?.nombre || "No asignado" }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="py-4 text-center text-gray-500">
      Cargando detalles...
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <UButton
        label="Editar"
        icon="i-heroicons-pencil-square"
        @click="$emit('edit')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  sku: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["edit", "cancel"]);
</script>
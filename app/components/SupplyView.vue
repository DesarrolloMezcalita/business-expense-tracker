<template>
  <div>
    <div class="p-6">
      <div v-if="supply" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Nombre</h3>
            <p class="mt-1 text-base">{{ supply.nombre }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500">Tipo</h3>
            <p class="mt-1 text-base">{{ supply.tipo }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500">Unidad de Medida</h3>
            <p class="mt-1 text-base">
              {{ supply.unidad_de_medida }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="py-4 text-center text-gray-500">
        Cargando detalles...
      </div>
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
  supply: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["edit", "cancel"]);
</script>
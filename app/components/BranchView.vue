<template>
  <div>
    <div
      v-if="branch"
      class="space-y-4"
      aria-describedby="view-branch-description"
    >
      <p id="view-branch-description" class="sr-only">
        Información detallada sobre la sucursal seleccionada
      </p>
      <div class="flex items-center space-x-4">
        <div class="bg-gray-100 rounded-full p-4">
          <UIcon name="i-heroicons-building-office" class="text-3xl" />
        </div>
        <div>
          <h4 class="text-xl font-medium">{{ branch.nombre }}</h4>
        </div>
      </div>

      <hr class="my-4 border-t border-gray-200" />

      <div class="grid grid-cols-1 gap-4">
        <div>
          <h5 class="text-sm font-medium text-gray-500">Fecha de Creación</h5>
          <p>{{ formatDate(branch.created_at) }}</p>
        </div>
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
  branch: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["edit", "cancel"]);

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<style>
</style>
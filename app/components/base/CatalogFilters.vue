<template>
  <div>
    <!-- Search and Filter Section -->
    <div class="flex flex-col md:flex-row mb-6">
      <div class="flex-grow">
        <div class="flex">
          <UInput
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            icon="i-heroicons-magnifying-glass"
            class="flex-grow"
            @update:model-value="$emit('applyFilters')"
          />
          <UButton
            v-if="$slots.filters"
            icon="i-heroicons-adjustments-horizontal"
            :variant="isAdvancedFilterOpen ? 'solid' : 'outline'"
            class="ml-2"
            @click="isAdvancedFilterOpen = !isAdvancedFilterOpen"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <UButton
          v-if="hasActiveFilters && $slots.filters"
          icon="i-heroicons-x-mark"
          variant="ghost"
          label="Restablecer Filtros"
          @click="$emit('resetFilters')"
        />
      </div>
    </div>

    <!-- Advanced Filter Panel -->
    <UCard v-if="isAdvancedFilterOpen && $slots.filters" class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Filtros Avanzados</h3>
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            @click="isAdvancedFilterOpen = false"
          />
        </div>
      </template>

      <slot name="filters" />
    </UCard>
  </div>
</template>

<script lang="ts" setup>
const isAdvancedFilterOpen = ref(false);

const props = defineProps({
  searchPlaceholder: {
    type: String,
    default: "Buscar...",
  },
  hasActiveFilters: {
    type: Boolean,
    default: false,
  },
});

const searchQuery = defineModel<string>("searchQuery", { default: "" });

const emit = defineEmits(["applyFilters", "resetFilters"]);
</script>
<template>
  <UModal
    v-model:open="model"
    :ui="{ width: 'max-w-2xl', footer: 'justify-end' }"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-medium">
          {{ title }}
        </h3>
        <UButton
          icon="i-heroicons-x-mark"
          variant="link"
          aria-label="Close"
          @click="model = false"
        />
      </div>
    </template>

    <template #body>
      <slot />
    </template>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: null,
  },
});

const model = defineModel({
  type: Boolean,
  default: false,
  required: true,
});
</script>
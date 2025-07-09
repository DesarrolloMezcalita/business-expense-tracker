<template>
  <UCard>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              v-for="(c, i) in columns"
              :key="i"
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              {{ c }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <slot />
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <template v-if="totalCount" #footer>
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {{ paginatedRange }} de {{ totalCount }} usuarios
        </p>
        <UPagination
          v-model:page="page"
          :page-count="pageCount"
          :total="totalCount"
          :show-controls="false"
          show-edges
          :ui="{ wrapper: 'flex items-center gap-1' }"
        />
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
const props = defineProps({
  columns: {
    type: Array as () => string[],
    default: () => [],
  },
  pageCount: {
    type: Number,
    default: 0,
  },
  paginatedRange: {
    type: String,
    default: "1",
  },
  totalCount: {
    type: Number,
    default: 0,
  },
});

const page = defineModel<number>("currentPage", { default: 0 });
</script>
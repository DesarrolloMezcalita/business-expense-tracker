<template>
  <div>
    <div v-if="user" class="space-y-4" aria-describedby="view-user-description">
      <p id="view-user-description" class="sr-only">
        Detailed information about the selected user
      </p>
      <div class="flex items-center space-x-4">
        <div class="bg-gray-100 dark:bg-gray-700 rounded-full p-4">
          <UIcon name="i-heroicons-user-circle" class="text-3xl" />
        </div>
        <div>
          <h4 class="text-xl font-medium">{{ user.name }}</h4>
          <p class="text-gray-500 dark:text-gray-400">
            {{ user.email }}
          </p>
        </div>
      </div>

      <hr class="my-4 border-t border-gray-200 dark:border-gray-700" />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="user.role">
          <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Rol
          </h5>
          <UBadge :color="getRoleBadgeColor(user.role)" variant="subtle">
            {{ user.role }}
          </UBadge>
        </div>
        <div>
          <h5 class="text-sm font-medium text-gray-500">Estado</h5>
          <UBadge
            :color="user.is_active ? 'success' : 'error'"
            variant="subtle"
          >
            {{ user.is_active ? "Active" : "Inactive" }}
          </UBadge>
        </div>
        <div>
          <h5 class="text-sm font-medium text-gray-500">Created Date</h5>
          <p>
            {{ formatDate(user.created_at || user.createdAt) }}
          </p>
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
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["edit", "cancel"]);

function getRoleBadgeColor(role) {
  switch (role) {
    case "Admin":
      return "info";
    case "Editor":
      return "neutral";
    default:
      return "neutral";
  }
}

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
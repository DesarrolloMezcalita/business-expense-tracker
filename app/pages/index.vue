<template>
  <div class="flex flex-col items-center justify-center gap-6 py-12">
    <h1 class="font-bold text-3xl text-(--ui-primary)">
      Business Expense Tracker
    </h1>

    <p class="text-lg text-gray-600 max-w-md text-center">
      A comprehensive solution for managing business expenses and user accounts
    </p>

    <UCard class="w-full max-w-3xl">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            Welcome, {{ authStore.user?.name || "Guest" }}
          </h2>
          <UBadge
            v-if="authStore.user?.role"
            :color="userRoleColor"
            variant="subtle"
          >
            {{ authStore.user?.role }}
          </UBadge>
        </div>
      </template>

      <div class="py-4">
        <p v-if="authStore.isAuthenticated" class="mb-4">
          You are logged in as <strong>{{ authStore.user?.email }}</strong
          >. Use the navigation links above to manage your account and access
          features.
        </p>
        <p v-else class="mb-4">
          Please log in to access all features of the Business Expense Tracker.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <UCard v-if="authStore.isAuthenticated">
            <template #header>
              <h3 class="text-lg font-medium">Quick Actions</h3>
            </template>
            <div class="space-y-2">
              <UButton
                label="Gestor de Gastos"
                icon="i-heroicons-banknotes"
                to="/expenses"
                block
              />
              <UButton
                label="User Management"
                icon="i-heroicons-user-group"
                to="/users"
                block
              />
              <UButton
                label="My Profile"
                icon="i-heroicons-user-circle"
                to="/profile"
                block
              />
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-lg font-medium">Resources</h3>
            </template>
            <div class="space-y-2">
              <UButton
                label="Documentation"
                color="gray"
                variant="outline"
                icon="i-heroicons-document-text"
                to="https://ui.nuxt.com"
                target="_blank"
                block
              />
              <UButton
                label="Support"
                color="gray"
                variant="outline"
                icon="i-heroicons-question-mark-circle"
                to="#"
                block
              />
            </div>
          </UCard>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

const userRoleColor = computed(() => {
  const role = authStore.user?.role;
  switch (role) {
    case "Admin":
      return "blue";
    case "Editor":
      return "yellow";
    case "User":
      return "gray";
    default:
      return "gray";
  }
});

// Define page metadata
definePageMeta({
  middleware: ["auth"],
});
</script>

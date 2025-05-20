<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Barra de navegación -->
    <UContainer class="py-4">
      <header class="flex justify-between items-center mb-4">
        <NuxtLink to="/" class="font-bold text-xl">
          Business Expense Tracker
        </NuxtLink>

        <div class="flex items-center gap-2">
          <!-- Show these links only when authenticated -->
          <template v-if="authStore.isAuthenticated">
            <UButton
              to="/users"
              variant="ghost"
              icon="i-heroicons-user-group"
              label="User Management"
            />
            <UButton
              to="/profile"
              variant="ghost"
              icon="i-heroicons-user-circle"
              label="My Profile"
            />
            <UButton
              variant="ghost"
              icon="i-heroicons-arrow-right-on-rectangle"
              label="Logout"
              @click="logout"
            />
          </template>

          <!-- Show these links when not authenticated -->
          <template v-else>
            <UButton
              to="/auth"
              variant="ghost"
              icon="i-heroicons-arrow-left-on-rectangle"
              label="Login"
            />
          </template>
        </div>
      </header>
    </UContainer>

    <!-- Contenido principal -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "~/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const logout = async () => {
  await authStore.logout();
  router.push("/auth");
};
</script>
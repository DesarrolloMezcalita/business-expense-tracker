<template>
  <UApp>
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

    <!-- Skip rendering the layout on auth pages -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
import { useAuthStore } from "~/stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const logout = async () => {
  await authStore.logout();
  router.push("/auth");
};
</script>
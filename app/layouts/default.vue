<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile navigation bar -->
    <UContainer class="py-4 lg:hidden">
      <header class="flex justify-between items-center mb-4">
        <NuxtLink to="/" class="font-bold text-xl">
          Gestor de Gastos Empresariales
        </NuxtLink>

        <div class="flex items-center gap-2">
          <!-- Toggle sidebar button for mobile -->
          <UButton
            v-if="authStore.isAuthenticated"
            variant="ghost"
            icon="i-heroicons-bars-3"
            @click="isSidebarOpen = !isSidebarOpen"
          />

          <!-- Show login link when not authenticated -->
          <template v-if="!authStore.isAuthenticated">
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

    <div class="flex h-[calc(100vh-4rem)] lg:h-screen">
      <!-- Sidebar - hidden on mobile by default, always visible on desktop -->
      <div
        v-if="authStore.isAuthenticated"
        class="fixed inset-0 z-40 lg:relative transition-all duration-300 ease-in-out"
        :class="[
          isSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0',
        ]"
      >
        <!-- Backdrop for mobile -->
        <div
          v-if="isSidebarOpen"
          class="absolute inset-0 bg-gray-500 bg-opacity-75 lg:hidden"
          @click="isSidebarOpen = false"
        ></div>

        <!-- Actual sidebar -->
        <div class="relative w-64 h-full z-50">
          <SidebarNav />
        </div>
      </div>

      <!-- Main content -->
      <main class="flex-1 overflow-auto p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const isSidebarOpen = ref(false);
</script>
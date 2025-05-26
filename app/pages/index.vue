<template>
  <div class="flex flex-col items-center justify-center gap-6 py-12">
    <h1 class="font-bold text-3xl text-(--ui-primary)">
      Gestor de Gastos Empresariales
    </h1>

    <p class="text-lg text-gray-600 max-w-md text-center">
      Una solución integral para gestionar gastos empresariales y cuentas de
      usuario
    </p>

    <UCard class="w-full max-w-3xl">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            Bienvenido, {{ authStore.user?.name || "Invitado" }}
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
          Has iniciado sesión como <strong>{{ authStore.user?.email }}</strong
          >. Utiliza los enlaces de navegación a la izquierda para gestionar tu
          cuenta y acceder a las funciones.
        </p>
        <p v-else class="mb-4">
          Por favor, inicia sesión para acceder a todas las funciones del Gestor
          de Gastos Empresariales.
        </p>
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
      return "neutral";
    default:
      return "neutral";
  }
});

// Define page metadata
definePageMeta({
  middleware: ["auth"],
});
</script>

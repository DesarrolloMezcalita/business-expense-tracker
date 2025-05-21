<template>
  <div class="h-full bg-white border-r border-gray-200">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-800">
        Business Expense Tracker
      </h2>
    </div>

    <nav class="p-4 space-y-2">
      <UButton
        to="/"
        block
        variant="ghost"
        class="justify-start"
        :active="route.path === '/'"
        icon="i-heroicons-home"
        label="Dashboard"
      />

      <UButton
        to="/expenses"
        block
        variant="ghost"
        class="justify-start"
        :active="route.path === '/expenses'"
        icon="i-heroicons-banknotes"
        label="Gastos"
      />

      <UButton
        to="/recurring-expenses"
        block
        variant="ghost"
        class="justify-start"
        :active="route.path === '/recurring-expenses'"
        icon="i-heroicons-clock"
        label="Gastos Recurrentes"
      />

      <UButton
        to="/supplies"
        block
        variant="ghost"
        class="justify-start"
        :active="route.path === '/supplies'"
        icon="i-heroicons-cube"
        label="Insumos"
      />

      <UButton
        to="/skus"
        block
        variant="ghost"
        class="justify-start"
        :active="route.path === '/skus'"
        icon="i-heroicons-tag"
        label="SKUs"
      />

      <UButton
        to="/categories"
        block
        variant="ghost"
        class="justify-start"
        :active="route.path === '/categories'"
        icon="i-heroicons-folder"
        label="Categorías"
      />

      <UButton
        to="/branches"
        block
        variant="ghost"
        class="justify-start"
        :active="route.path === '/branches'"
        icon="i-heroicons-building-office"
        label="Sucursales"
      />

      <UButton
        to="/users"
        block
        variant="ghost"
        class="justify-start"
        :active="route.path === '/users'"
        icon="i-heroicons-user-group"
        label="Usuarios"
      />

      <UButton
        to="/profile"
        block
        variant="ghost"
        class="justify-start"
        :active="route.path === '/profile'"
        icon="i-heroicons-user-circle"
        label="Mi Perfil"
      />

      <div class="pt-4 mt-4 border-t border-gray-200">
        <UButton
          variant="ghost"
          block
          class="justify-start"
          icon="i-heroicons-arrow-right-on-rectangle"
          label="Logout"
          @click="logout"
        />
      </div>
    </nav>
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
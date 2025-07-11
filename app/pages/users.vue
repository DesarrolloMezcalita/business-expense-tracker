<template>
  <div class="container mx-auto p-6">
    <UTabs
      :items="tabItems"
      variant="link"
      class="gap-4 w-full"
      :ui="{ trigger: 'grow' }"
    >
      <template #users>
        <UserCatalog />
      </template>

      <template #wa-users>
        <WAUserCatalog />
      </template>
    </UTabs>
  </div>
</template>

<script lang="ts" setup>
const tabItems = [
  {
    label: "Usuarios",
    icon: "i-lucide-user",
    slot: "users",
  },
  {
    label: "Usuarios de WhatsApp",
    icon: "i-lucide-user",
    slot: "wa-users",
  },
];

// Define page metadata
definePageMeta({
  middleware: ["admin"],
  // The admin middleware already handles the role check,
  // but we keep this as an additional security layer
  validate: async () => {
    const authStore = useAuthStore();
    await authStore.checkAuth();
    return authStore.isAdmin;
  },
});
</script>
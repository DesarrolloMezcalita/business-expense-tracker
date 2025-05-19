<template>
  <UApp>
    <UContainer class="py-4">
      <header class="flex justify-between items-center mb-4">
        <NuxtLink to="/" class="font-bold text-xl"
          >Business Expense Tracker</NuxtLink
        >
        <UButton
          to="/users"
          variant="ghost"
          icon="i-heroicons-user-group"
          label="User Management"
        />
      </header>
    </UContainer>
    <NuxtPage />
  </UApp>
</template>
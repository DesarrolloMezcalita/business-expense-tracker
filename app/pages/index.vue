<template>
  <div class="flex flex-col items-center justify-center gap-6 h-screen">
    <h1 class="font-bold text-3xl text-(--ui-primary)">
      Business Expense Tracker
    </h1>

    <p class="text-lg text-gray-600 max-w-md text-center">
      A comprehensive solution for managing business expenses and user accounts
    </p>

    <div class="flex items-center gap-4 mt-4">
      <UButton
        label="User Management"
        icon="i-heroicons-user-group"
        to="/users"
        size="lg"
      />

      <UButton
        label="Documentation"
        color="gray"
        variant="outline"
        icon="i-heroicons-document-text"
        to="https://ui.nuxt.com"
        target="_blank"
        size="lg"
      />
    </div>
  </div>
</template>

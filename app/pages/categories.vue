<template>
  <div>
    <CategoryList />
  </div>
</template>

<script setup>
import CategoryList from "~/components/CategoryList.vue";

// Define page metadata
definePageMeta({
  middleware: ["auth"],
});
</script>
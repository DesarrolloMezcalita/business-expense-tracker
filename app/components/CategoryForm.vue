<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-1 gap-4">
      <!-- Nombre -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          id="name"
          v-model="form.nombre"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>
    </div>

    <!-- Botones -->
    <div class="flex justify-end gap-2 mt-6">
      <UButton
        type="button"
        label="Cancelar"
        variant="soft"
        @click="$emit('cancel')"
      />
      <UButton
        type="submit"
        :label="isEditing ? 'Actualizar Categoría' : 'Agregar Categoría'"
        :loading="isSubmitting"
        :disabled="categoryStore.loading"
      />
    </div>
    <!-- <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        :disabled="categoryStore.loading"
      >
        {{
          categoryStore.loading
            ? "Guardando..."
            : isEditing
            ? "Actualizar"
            : "Guardar"
        }}
      </button>
    </div> -->
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCategoryStore } from "~/stores/category";

const props = defineProps({
  categoryId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(["saved", "cancel"]);
const categoryStore = useCategoryStore();

const isEditing = computed(() => !!props.categoryId);

const form = ref({
  nombre: "",
});

onMounted(async () => {
  if (props.categoryId) {
    await categoryStore.fetchCategory(props.categoryId);
    if (categoryStore.category) {
      form.value = {
        nombre: categoryStore.category.nombre,
      };
    }
  }
});

const handleSubmit = async () => {
  try {
    let result;

    if (isEditing.value) {
      result = await categoryStore.updateCategory(props.categoryId, form.value);
    } else {
      result = await categoryStore.createCategory(form.value);
    }

    emit("saved", result);
  } catch (error) {
    console.error("Error saving category:", error);
  }
};
</script>
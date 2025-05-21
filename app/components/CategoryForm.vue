<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {{ isEditing ? "Editar Categoría" : "Agregar Nueva Categoría" }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 gap-4">
        <!-- Nombre -->
        <div>
          <label
            for="name"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Descripción -->
        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Descripción
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>
    </form>
  </div>
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
  name: "",
  description: "",
});

onMounted(async () => {
  if (props.categoryId) {
    await categoryStore.fetchCategory(props.categoryId);
    if (categoryStore.category) {
      form.value = {
        name: categoryStore.category.name,
        description: categoryStore.category.description || "",
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
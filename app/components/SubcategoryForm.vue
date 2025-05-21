<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {{ isEditing ? "Editar Subcategoría" : "Agregar Nueva Subcategoría" }}
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

        <!-- Categoría Padre (solo si no se proporciona categoryId) -->
        <div v-if="!props.categoryId">
          <label
            for="category_id"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Categoría
          </label>
          <select
            id="category_id"
            v-model="form.category_id"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Seleccione una categoría</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
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
  subcategoryId: {
    type: [String, Number],
    default: null,
  },
  categoryId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(["saved", "cancel"]);
const categoryStore = useCategoryStore();
const categories = ref([]);

const isEditing = computed(() => !!props.subcategoryId);

const form = ref({
  name: "",
  description: "",
  category_id: props.categoryId || "",
});

onMounted(async () => {
  // Cargar categorías para el selector
  if (!props.categoryId) {
    await loadCategories();
  }

  // Si estamos editando, cargar los datos de la subcategoría
  if (props.subcategoryId) {
    await categoryStore.fetchSubcategory(props.subcategoryId);
    if (categoryStore.subcategory) {
      form.value = {
        name: categoryStore.subcategory.name,
        description: categoryStore.subcategory.description || "",
        category_id: categoryStore.subcategory.category_id,
      };
    }
  }
});

const loadCategories = async () => {
  try {
    await categoryStore.fetchCategories();
    categories.value = categoryStore.categories;
  } catch (error) {
    console.error("Error loading categories:", error);
  }
};

const handleSubmit = async () => {
  try {
    let result;

    // Si se proporciona categoryId como prop, asegurarse de usarlo
    if (props.categoryId && !form.value.category_id) {
      form.value.category_id = props.categoryId;
    }

    if (isEditing.value) {
      result = await categoryStore.updateSubcategory(
        props.subcategoryId,
        form.value
      );
    } else {
      result = await categoryStore.createSubcategory(form.value);
    }

    emit("saved", result);
  } catch (error) {
    console.error("Error saving subcategory:", error);
  }
};
</script>
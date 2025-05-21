<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {{ isEditing ? "Editar Insumo" : "Agregar Nuevo Insumo" }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nombre -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1"
            >Nombre</label
          >
          <input
            id="name"
            v-model="form.nombre"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Categoría -->
        <div>
          <label
            for="category"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Categoría</label
          >
          <select
            id="category"
            v-model="form.tipo"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Seleccionar tipo</option>
            <option
              v-for="category in supplyStore.categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>

        <!-- Unidad -->
        <div>
          <label for="unit" class="block text-sm font-medium text-gray-700 mb-1"
            >Unidad</label
          >
          <input
            id="unit"
            v-model="form.unidad_de_medida"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
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
          :disabled="supplyStore.loading"
        >
          {{
            supplyStore.loading
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
import { useSupplyStore } from "~/stores/supply";

const props = defineProps({
  supplyId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["saved", "cancel"]);
const supplyStore = useSupplyStore();

const isEditing = computed(() => !!props.supplyId);

const form = ref({
  nombre: "",
  tipo: "",
  unidad_de_medida: "",
});

onMounted(async () => {
  if (props.supplyId) {
    await supplyStore.fetchSupply(props.supplyId);
    if (supplyStore.supply) {
      form.value = { ...supplyStore.supply };
    }
  }
});

const handleSubmit = async () => {
  try {
    let result;

    if (isEditing.value) {
      result = await supplyStore.updateSupply(props.supplyId, form.value);
    } else {
      result = await supplyStore.createSupply(form.value);
    }

    emit("saved", result);
  } catch (error) {
    console.error("Error saving supply:", error);
  }
};
</script>
<template>
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

      <!-- Tipo -->
      <div>
        <label
          for="category"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Tipo</label
        >
        <input
          id="category"
          v-model="form.tipo"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
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
    <div class="flex justify-end gap-2 mt-6">
      <UButton
        type="button"
        label="Cancelar"
        variant="soft"
        @click="$emit('cancel')"
      />
      <UButton
        type="submit"
        :label="isEditing ? 'Actualizar Insumo' : 'Agregar Insumo'"
        :loading="isSubmitting"
        :disabled="supplyStore.loading"
      />
    </div>
  </form>
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
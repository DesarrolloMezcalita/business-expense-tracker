<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {{ isEditing ? "Editar SKU" : "Agregar Nuevo SKU" }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- SKU -->
        <div>
          <label for="sku" class="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            id="sku"
            v-model="form.sku"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Proveedor -->
        <div>
          <label
            for="proveedor"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Proveedor
          </label>
          <input
            id="proveedor"
            v-model="form.proveedor"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Unidad de Medida -->
        <div>
          <label
            for="unidad_de_medida"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Unidad de Medida
          </label>
          <input
            id="unidad_de_medida"
            v-model="form.unidad_de_medida"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Cantidad -->
        <div>
          <label
            for="cantidad"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Cantidad
          </label>
          <input
            id="cantidad"
            v-model.number="form.cantidad"
            type="number"
            min="0"
            step="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Insumo ID -->
        <div>
          <label
            for="insumoId"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            ID de Insumo
          </label>
          <input
            id="insumoId"
            v-model.number="form.insumoId"
            type="number"
            min="1"
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
          :disabled="skuStore.loading"
        >
          {{
            skuStore.loading
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
import { useSkuStore } from "~/stores/sku";

const props = defineProps({
  skuId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["saved", "cancel"]);
const skuStore = useSkuStore();

const isEditing = computed(() => !!props.skuId);

const form = ref({
  sku: "",
  proveedor: "",
  unidad_de_medida: "",
  cantidad: 0,
  insumoId: 0,
});

onMounted(async () => {
  if (props.skuId) {
    await skuStore.fetchSku(props.skuId);
    if (skuStore.sku) {
      form.value = { ...skuStore.sku };
    }
  }
});

const handleSubmit = async () => {
  try {
    let result;

    if (isEditing.value) {
      result = await skuStore.updateSku(props.skuId, form.value);
    } else {
      result = await skuStore.createSku(form.value);
    }

    emit("saved", result);
  } catch (error) {
    console.error("Error saving SKU:", error);
  }
};
</script>
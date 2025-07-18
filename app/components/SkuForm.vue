<template>
  <div>
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

        <!-- Insumo (Dropdown) -->
        <div>
          <label
            for="insumoId"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Insumo
          </label>
          <select
            id="insumoId"
            v-model="form.insumoId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Seleccionar insumo</option>
            <option
              v-for="insumo in supplyStore.supplies"
              :key="insumo.id"
              :value="insumo.id"
            >
              {{ insumo.nombre }} ({{ insumo.tipo }})
            </option>
          </select>
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
          :label="isEditing ? 'Actualizar SKU' : 'Agregar SKU'"
          :loading="isSubmitting"
          :disabled="skuStore.loading"
        />
      </div>

      <!-- <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
      </div> -->
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSkuStore } from "~/stores/sku";
import { useSupplyStore } from "~/stores/supply";

const props = defineProps({
  skuId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["saved", "cancel"]);
const skuStore = useSkuStore();
const supplyStore = useSupplyStore();

const isEditing = computed(() => !!props.skuId);

const form = ref({
  sku: "",
  proveedor: "",
  unidad_de_medida: "",
  cantidad: 0,
  insumoId: "",
});

onMounted(async () => {
  // Cargar la lista de insumos
  await supplyStore.fetchAllSupplies();

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
<template>
  <div>
    <UForm :state="form" @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nombre -->
        <UFormField label="Nombre" name="nombre" required>
          <UInput
            v-model="form.nombre"
            placeholder="Nombre del gasto recurrente"
          />
        </UFormField>

        <!-- Proveedor -->
        <UFormField label="Proveedor" name="proveedor" required>
          <UInput v-model="form.proveedor" placeholder="Nombre del proveedor" />
        </UFormField>

        <!-- Monto -->
        <UFormField label="Monto" name="monto" required>
          <UInput
            v-model="form.monto"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </UFormField>

        <!-- Frecuencia -->
        <UFormField label="Frecuencia" name="frecuencia" required>
          <USelect
            v-model="form.frecuencia"
            :options="frecuenciaOptions"
            placeholder="Seleccionar frecuencia"
          />
        </UFormField>

        <!-- Día de cobro -->
        <UFormField
          label="Día de cobro"
          name="dia_cobro"
          :required="isDiaCobro"
          :description="diaCobro.description"
        >
          <UInput
            v-model="form.dia_cobro"
            type="number"
            :min="diaCobro.min"
            :max="diaCobro.max"
            :placeholder="diaCobro.placeholder"
            :disabled="!isDiaCobro"
          />
        </UFormField>

        <!-- Forma de pago -->
        <UFormField label="Forma de pago" name="formaPago" required>
          <USelect
            v-model="form.formaPago"
            :items="formaPagoOptions"
            placeholder="Seleccionar forma de pago"
          />
        </UFormField>

        <!-- Sucursal -->
        <UFormField label="Sucursal" name="sucursalId" required>
          <USelect
            v-model="form.sucursalId"
            :items="branchOptions"
            placeholder="Seleccionar sucursal"
          />
        </UFormField>

        <!-- Estado -->
        <UFormField label="Estado" name="activo" class="md:col-span-2">
          <UToggle
            v-model="form.activo"
            :on-icon="{ icon: 'i-heroicons-check', class: 'text-white' }"
            :off-icon="{ icon: 'i-heroicons-x-mark', class: 'text-white' }"
          >
            <template #on>
              <span class="text-xs">Activo</span>
            </template>
            <template #off>
              <span class="text-xs">Inactivo</span>
            </template>
          </UToggle>
        </UFormField>
      </div>

      <div class="flex justify-end space-x-2 mt-6">
        <UButton
          type="button"
          color="gray"
          variant="outline"
          @click="$emit('cancel')"
        >
          Cancelar
        </UButton>
        <UButton type="submit" color="primary" :loading="loading">
          {{ isEditing ? "Actualizar" : "Guardar" }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { FRECUENCIAS } from "~/types/recurring-expense";

const props = defineProps({
  expense: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit", "cancel"]);

// Opciones para los selects

const frecuenciaOptions = FRECUENCIAS.map((f) => ({
  label: f.label,
  value: f.value,
}));

const formaPagoOptions = [
  { label: "Efectivo", value: "Efectivo" },
  { label: "Tarjeta de crédito", value: "Tarjeta de crédito" },
  { label: "Tarjeta de débito", value: "Tarjeta de débito" },
  { label: "Transferencia bancaria", value: "Transferencia bancaria" },
  { label: "Cheque", value: "Cheque" },
  { label: "Domiciliación bancaria", value: "Domiciliación bancaria" },
];

const branchOptions = [
  { label: "Sucursal Principal", value: 1 },
  { label: "Sucursal Norte", value: 2 },
  { label: "Sucursal Sur", value: 3 },
];

// Estado del formulario
const form = ref({
  nombre: "",
  monto: "",
  frecuencia: "",
  dia_cobro: "",
  proveedor: "",
  formaPago: "",
  sucursalId: "",
  activo: true,
});

// Computed properties
const isEditing = computed(() => !!props.expense);

const isDiaCobro = computed(() => {
  return ["mensual", "bimestral", "trimestral", "semestral", "anual"].includes(
    form.value.frecuencia
  );
});

const diaCobro = computed(() => {
  if (form.value.frecuencia === "mensual") {
    return {
      min: 1,
      max: 31,
      placeholder: "Día del mes (1-31)",
      description: "Día del mes en que se realiza el cobro",
    };
  } else if (form.value.frecuencia === "semanal") {
    return {
      min: 1,
      max: 7,
      placeholder: "Día de la semana (1-7)",
      description:
        "Día de la semana en que se realiza el cobro (1=Lunes, 7=Domingo)",
    };
  } else if (
    ["bimestral", "trimestral", "semestral", "anual"].includes(
      form.value.frecuencia
    )
  ) {
    return {
      min: 1,
      max: 31,
      placeholder: "Día del mes (1-31)",
      description: "Día del mes en que se realiza el cobro",
    };
  } else {
    return {
      min: 1,
      max: 31,
      placeholder: "No aplica",
      description: "No aplica para esta frecuencia",
    };
  }
});

// Watchers
watch(
  () => props.expense,
  (newExpense) => {
    if (newExpense) {
      // Llenar el formulario con los datos del gasto recurrente
      form.value = {
        nombre: newExpense.nombre || "",
        monto: newExpense.monto || "",
        frecuencia: newExpense.frecuencia || "",
        dia_cobro: newExpense.dia_cobro || "",
        proveedor: newExpense.proveedor || "",
        formaPago: newExpense.formaPago || "",
        sucursalId: newExpense.sucursalId || "",
        activo: newExpense.activo !== undefined ? newExpense.activo : true,
      };
    } else {
      // Resetear el formulario
      form.value = {
        nombre: "",
        monto: "",
        frecuencia: "",
        dia_cobro: "",
        proveedor: "",
        formaPago: "",
        sucursalId: "",
        activo: true,
      };
    }
  },
  { immediate: true }
);

// Métodos
const onSubmit = () => {
  // Validar el formulario
  if (
    !form.value.nombre ||
    !form.value.proveedor ||
    !form.value.monto ||
    !form.value.frecuencia ||
    !form.value.formaPago ||
    !form.value.sucursalId
  ) {
    return;
  }

  // Validar día de cobro si es necesario
  if (isDiaCobro.value && !form.value.dia_cobro) {
    return;
  }

  // Convertir valores numéricos
  const formData = {
    ...form.value,
    monto: parseFloat(form.value.monto),
    categoriaId: 1, // Default category ID
    sucursalId: parseInt(form.value.sucursalId),
    dia_cobro: form.value.dia_cobro ? parseInt(form.value.dia_cobro) : null,
    fecha_inicio: new Date().toISOString().split("T")[0], // Current date as default
  };

  // Emitir evento con los datos del formulario
  emit("submit", formData);
};

// Inicialización
onMounted(() => {
  // No need to set fecha_inicio anymore as it's handled in onSubmit
});
</script>
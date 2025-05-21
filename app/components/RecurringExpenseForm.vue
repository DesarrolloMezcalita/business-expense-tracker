<template>
  <div>
    <UForm :state="form" @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nombre -->
        <UFormGroup label="Nombre" name="nombre" required>
          <UInput
            v-model="form.nombre"
            placeholder="Nombre del gasto recurrente"
          />
        </UFormGroup>

        <!-- Proveedor -->
        <UFormGroup label="Proveedor" name="proveedor" required>
          <UInput v-model="form.proveedor" placeholder="Nombre del proveedor" />
        </UFormGroup>

        <!-- Monto -->
        <UFormGroup label="Monto" name="monto" required>
          <UInput
            v-model="form.monto"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </UFormGroup>

        <!-- Categoría -->
        <UFormGroup label="Categoría" name="categoriaId" required>
          <USelect
            v-model="form.categoriaId"
            :options="categoryOptions"
            placeholder="Seleccionar categoría"
          />
        </UFormGroup>

        <!-- Frecuencia -->
        <UFormGroup label="Frecuencia" name="frecuencia" required>
          <USelect
            v-model="form.frecuencia"
            :options="frecuenciaOptions"
            placeholder="Seleccionar frecuencia"
          />
        </UFormGroup>

        <!-- Día de cobro -->
        <UFormGroup
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
        </UFormGroup>

        <!-- Fecha de inicio -->
        <UFormGroup label="Fecha de inicio" name="fecha_inicio" required>
          <UInput v-model="form.fecha_inicio" type="date" />
        </UFormGroup>

        <!-- Fecha de fin -->
        <UFormGroup
          label="Fecha de fin"
          name="fecha_fin"
          description="Dejar en blanco si no tiene fecha de finalización"
        >
          <UInput
            v-model="form.fecha_fin"
            type="date"
            :min="form.fecha_inicio"
          />
        </UFormGroup>

        <!-- Forma de pago -->
        <UFormGroup label="Forma de pago" name="formaPago" required>
          <USelect
            v-model="form.formaPago"
            :options="formaPagoOptions"
            placeholder="Seleccionar forma de pago"
          />
        </UFormGroup>

        <!-- Sucursal -->
        <UFormGroup label="Sucursal" name="sucursalId" required>
          <USelect
            v-model="form.sucursalId"
            :options="branchOptions"
            placeholder="Seleccionar sucursal"
          />
        </UFormGroup>

        <!-- Descripción -->
        <UFormGroup
          label="Descripción"
          name="descripcion"
          class="md:col-span-2"
        >
          <UTextarea
            v-model="form.descripcion"
            placeholder="Descripción o notas adicionales"
            rows="3"
          />
        </UFormGroup>

        <!-- Estado -->
        <UFormGroup label="Estado" name="activo" class="md:col-span-2">
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
        </UFormGroup>
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
const categoryOptions = [
  { label: "Alimentación", value: 1 },
  { label: "Transporte", value: 2 },
  { label: "Alojamiento", value: 3 },
  { label: "Material de oficina", value: 4 },
  { label: "Software", value: 5 },
  { label: "Equipamiento", value: 6 },
  { label: "Servicios", value: 7 },
  { label: "Marketing", value: 8 },
];

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
  descripcion: "",
  monto: "",
  frecuencia: "",
  dia_cobro: "",
  fecha_inicio: "",
  fecha_fin: "",
  proveedor: "",
  categoriaId: "",
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
        descripcion: newExpense.descripcion || "",
        monto: newExpense.monto || "",
        frecuencia: newExpense.frecuencia || "",
        dia_cobro: newExpense.dia_cobro || "",
        fecha_inicio: newExpense.fecha_inicio || "",
        fecha_fin: newExpense.fecha_fin || "",
        proveedor: newExpense.proveedor || "",
        categoriaId: newExpense.categoriaId || "",
        formaPago: newExpense.formaPago || "",
        sucursalId: newExpense.sucursalId || "",
        activo: newExpense.activo !== undefined ? newExpense.activo : true,
      };
    } else {
      // Resetear el formulario
      form.value = {
        nombre: "",
        descripcion: "",
        monto: "",
        frecuencia: "",
        dia_cobro: "",
        fecha_inicio: "",
        fecha_fin: "",
        proveedor: "",
        categoriaId: "",
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
    !form.value.fecha_inicio ||
    !form.value.categoriaId ||
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
    categoriaId: parseInt(form.value.categoriaId),
    sucursalId: parseInt(form.value.sucursalId),
    dia_cobro: form.value.dia_cobro ? parseInt(form.value.dia_cobro) : null,
  };

  // Emitir evento con los datos del formulario
  emit("submit", formData);
};

// Inicialización
onMounted(() => {
  // Establecer fecha de inicio por defecto si es un nuevo gasto
  if (!isEditing.value && !form.value.fecha_inicio) {
    const today = new Date();
    form.value.fecha_inicio = today.toISOString().split("T")[0];
  }
});
</script>
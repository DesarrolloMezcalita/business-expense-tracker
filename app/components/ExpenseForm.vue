<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <UFormField label="Proveedor" name="proveedor">
      <UInput
        v-model="form.proveedor"
        placeholder="Nombre del proveedor"
        :error="errors.proveedor"
        required
      />
    </UFormField>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UFormField label="Subtotal" name="subtotal">
        <UInput
          v-model="form.subtotal"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          :error="errors.subtotal"
          required
        />
      </UFormField>

      <UFormField label="Descuento" name="descuento">
        <UInput
          v-model="form.descuento"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          :error="errors.descuento"
          required
        />
      </UFormField>

      <UFormField label="Impuesto" name="impuesto">
        <UInput
          v-model="form.impuesto"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          :error="errors.impuesto"
          required
        />
      </UFormField>
    </div>

    <UFormField label="Total" name="total">
      <UInput
        v-model="form.total"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        :error="errors.total"
        required
        disabled
      />
    </UFormField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Categoría" name="categoriaId">
        <USelect
          v-model="form.categoriaId"
          :options="categoryOptions"
          placeholder="Selecciona una categoría"
          :error="errors.categoriaId"
          required
        />
      </UFormField>

      <UFormField label="Sucursal" name="sucursalId">
        <USelect
          v-model="form.sucursalId"
          :options="sucursalOptions"
          placeholder="Selecciona una sucursal"
          :error="errors.sucursalId"
          required
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Fecha" name="fecha">
        <UInput
          v-model="form.fecha"
          type="date"
          :error="errors.fecha"
          required
        />
      </UFormField>

      <UFormField label="Forma de Pago" name="formaPago">
        <USelect
          v-model="form.formaPago"
          :options="formaPagoOptions"
          placeholder="Selecciona forma de pago"
          :error="errors.formaPago"
          required
        />
      </UFormField>
    </div>

    <UFormField label="URL del Comprobante" name="comprobante">
      <UInput
        v-model="form.comprobante"
        placeholder="URL de la imagen del comprobante (opcional)"
        :error="errors.comprobante"
      />
    </UFormField>

    <!-- Sección de detalles del gasto -->
    <div class="mt-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">Detalles del Gasto</h3>
      </div>

      <!-- Lista de conceptos con campos de entrada directos -->
      <div class="space-y-6">
        <div
          v-if="expenseItems.length === 0"
          class="text-center py-4 border border-dashed border-gray-300 rounded-md"
        >
          <p class="text-gray-500">
            No hay conceptos agregados. Haga clic en "Agregar Concepto" para
            añadir detalles al gasto.
          </p>
        </div>

        <!-- Campos de entrada para cada concepto -->
        <div
          v-for="(item, index) in expenseItems"
          :key="index"
          class="p-4 border rounded-md bg-gray-50"
        >
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">Concepto #{{ index + 1 }}</h4>
            <UButton
              type="button"
              color="gray"
              variant="ghost"
              size="xs"
              icon="i-heroicons-trash"
              @click="removeExpenseItem(index)"
              title="Eliminar concepto"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <UFormField label="Concepto" name="concepto">
              <UInput
                v-model="expenseItems[index].concepto"
                placeholder="Nombre del concepto o insumo"
                required
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
            <UFormField label="Cantidad" name="cantidad">
              <UInput
                v-model.number="expenseItems[index].cantidad"
                type="number"
                min="1"
                step="1"
                required
                @input="updateItemSubtotal(index)"
              />
            </UFormField>

            <UFormField label="Precio Unitario" name="precioUnitario">
              <UInput
                v-model.number="expenseItems[index].precioUnitario"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                @input="updateItemSubtotal(index)"
              />
            </UFormField>

            <UFormField label="Subtotal" name="subtotal">
              <UInput
                v-model="expenseItems[index].subtotal"
                type="number"
                step="0.01"
                min="0"
                disabled
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormField label="Descuento" name="descuento">
              <UInput
                v-model.number="expenseItems[index].descuento"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                @input="updateItemSubtotal(index)"
              />
            </UFormField>

            <UFormField label="Impuesto" name="impuesto">
              <UInput
                v-model.number="expenseItems[index].impuesto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                @input="updateItemSubtotal(index)"
              />
            </UFormField>

            <UFormField label="Total" name="total">
              <UInput
                v-model="expenseItems[index].total"
                type="number"
                step="0.01"
                min="0"
                disabled
              />
            </UFormField>
          </div>
        </div>

        <!-- Botón para agregar nuevo concepto -->
        <div class="flex justify-center">
          <UButton
            type="button"
            color="primary"
            variant="soft"
            icon="i-heroicons-plus"
            @click="addNewExpenseItem"
          >
            Agregar Concepto
          </UButton>
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-2 pt-4">
      <UButton
        type="button"
        color="gray"
        variant="outline"
        @click="$emit('cancel')"
      >
        Cancelar
      </UButton>
      <UButton type="submit" :loading="loading" :disabled="loading">
        {{ expense ? "Actualizar" : "Guardar" }}
      </UButton>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useExpenseStore } from "~/stores/expense";

const props = defineProps({
  expense: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["submit", "cancel"]);
const expenseStore = useExpenseStore();
const loading = ref(false);

// Form state
const form = reactive({
  proveedor: "",
  subtotal: "",
  descuento: "",
  impuesto: "",
  total: "",
  fecha: "",
  comprobante: "",
  sucursalId: 1,
  validado: false,
  formaPago: "",
  categoriaId: null,
});

// Expense items state
const expenseItems = ref([]);

// Form validation errors
const errors = reactive({
  proveedor: "",
  subtotal: "",
  descuento: "",
  impuesto: "",
  total: "",
  fecha: "",
  comprobante: "",
  sucursalId: "",
  validado: "",
  formaPago: "",
  categoriaId: "",
});

// Category options
const categoryOptions = [
  { label: "Alimentación", value: 1 },
  { label: "Transporte", value: 2 },
  { label: "Alojamiento", value: 3 },
  { label: "Material de oficina", value: 4 },
  { label: "Software", value: 5 },
  { label: "Equipamiento", value: 6 },
  { label: "Servicios", value: 7 },
  { label: "Marketing", value: 8 },
  { label: "Otros", value: 9 },
];

// Sucursal options
const sucursalOptions = [
  { label: "Sucursal Principal", value: 1 },
  { label: "Sucursal Norte", value: 2 },
  { label: "Sucursal Sur", value: 3 },
];

// Forma de pago options
const formaPagoOptions = [
  { label: "Efectivo", value: "Efectivo" },
  { label: "Tarjeta de crédito", value: "Tarjeta de crédito" },
  { label: "Tarjeta de débito", value: "Tarjeta de débito" },
  { label: "Transferencia bancaria", value: "Transferencia bancaria" },
  { label: "Cheque", value: "Cheque" },
  { label: "Domiciliación bancaria", value: "Domiciliación bancaria" },
];

// Calculate total when subtotal, descuento or impuesto change
watch([() => form.subtotal, () => form.descuento, () => form.impuesto], () => {
  const subtotal = parseFloat(form.subtotal) || 0;
  const descuento = parseFloat(form.descuento) || 0;
  const impuesto = parseFloat(form.impuesto) || 0;

  form.total = (subtotal - descuento + impuesto).toFixed(2);
});

// Initialize form with expense data if editing
onMounted(() => {
  if (props.expense) {
    form.proveedor = props.expense.proveedor;
    form.subtotal = props.expense.subtotal;
    form.descuento = props.expense.descuento;
    form.impuesto = props.expense.impuesto;
    form.total = props.expense.total;
    form.fecha = props.expense.fecha;
    form.comprobante = props.expense.comprobante || "";
    form.sucursalId = props.expense.sucursalId;
    form.validado = props.expense.validado;
    form.formaPago = props.expense.formaPago;
    form.categoriaId = props.expense.categoriaId;

    // Cargar los detalles del gasto si existen
    if (props.expense.items && props.expense.items.length > 0) {
      expenseItems.value = [...props.expense.items];
    }
  } else {
    // Set default date to today for new expenses
    form.fecha = new Date().toISOString().split("T")[0];
  }
});

// Validate form
const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });

  if (!form.proveedor.trim()) {
    errors.proveedor = "El proveedor es requerido";
    isValid = false;
  }

  if (
    !form.subtotal ||
    isNaN(parseFloat(form.subtotal)) ||
    parseFloat(form.subtotal) < 0
  ) {
    errors.subtotal = "Ingrese un subtotal válido";
    isValid = false;
  }

  if (
    !form.descuento ||
    isNaN(parseFloat(form.descuento)) ||
    parseFloat(form.descuento) < 0
  ) {
    errors.descuento = "Ingrese un descuento válido";
    isValid = false;
  }

  if (
    !form.impuesto ||
    isNaN(parseFloat(form.impuesto)) ||
    parseFloat(form.impuesto) < 0
  ) {
    errors.impuesto = "Ingrese un impuesto válido";
    isValid = false;
  }

  if (
    !form.total ||
    isNaN(parseFloat(form.total)) ||
    parseFloat(form.total) <= 0
  ) {
    errors.total = "El total debe ser mayor a 0";
    isValid = false;
  }

  if (!form.fecha) {
    errors.fecha = "La fecha es requerida";
    isValid = false;
  }

  if (!form.categoriaId) {
    errors.categoriaId = "La categoría es requerida";
    isValid = false;
  }

  if (!form.sucursalId) {
    errors.sucursalId = "La sucursal es requerida";
    isValid = false;
  }

  if (!form.formaPago) {
    errors.formaPago = "La forma de pago es requerida";
    isValid = false;
  }

  if (form.comprobante && !isValidUrl(form.comprobante)) {
    errors.comprobante = "Ingrese una URL válida";
    isValid = false;
  }

  return isValid;
};

// URL validation helper
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Métodos para gestionar los detalles del gasto
const removeExpenseItem = (index) => {
  if (confirm("¿Está seguro de eliminar este concepto?")) {
    expenseItems.value.splice(index, 1);
  }
};

// Método para agregar un nuevo concepto vacío
const addNewExpenseItem = () => {
  const newItem = {
    concepto: "",
    nombre: "", // Para compatibilidad con la base de datos
    cantidad: 1,
    precioUnitario: "",
    precio_unitario: "", // Para compatibilidad con la base de datos
    subtotal: 0,
    expense_id: props.expense?.id || 0, // Se actualizará cuando se cree el gasto
    descuento: 0,
    impuesto: 0,
    total: 0,
    anomalia: false,
  };

  expenseItems.value.push(newItem);
};

// Método para actualizar el subtotal y total de un concepto
const updateItemSubtotal = (index) => {
  const item = expenseItems.value[index];
  const cantidad = parseFloat(item.cantidad) || 0;
  const precioUnitario = parseFloat(item.precioUnitario) || 0;
  const descuento = parseFloat(item.descuento) || 0;
  const impuesto = parseFloat(item.impuesto) || 0;

  // Calcular subtotal (cantidad * precio unitario)
  item.subtotal = cantidad * precioUnitario;

  // Calcular total (subtotal - descuento + impuesto)
  item.total = item.subtotal - descuento + impuesto;

  // Mantener campos sincronizados para compatibilidad
  item.precio_unitario = item.precioUnitario;
  item.nombre = item.concepto;
};

// Form submission handler
const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    const expenseData = {
      proveedor: form.proveedor,
      subtotal: parseFloat(form.subtotal),
      descuento: parseFloat(form.descuento),
      impuesto: parseFloat(form.impuesto),
      total: parseFloat(form.total),
      fecha: form.fecha,
      comprobante: form.comprobante || null,
      sucursalId: form.sucursalId,
      validado: form.validado,
      formaPago: form.formaPago,
      categoriaId: form.categoriaId,
      items: expenseItems.value.map((item) => ({
        ...item,
        expense_id: props.expense?.id || 0, // Se actualizará en el servidor
      })),
    };

    let result;

    if (props.expense) {
      // Update existing expense
      result = await expenseStore.updateExpense(props.expense.id, expenseData);
    } else {
      // Create new expense
      result = await expenseStore.createExpense(expenseData);
    }

    if (result) {
      emit("submit", result);
    }
  } catch (error) {
    console.error("Error saving expense:", error);
  } finally {
    loading.value = false;
  }
};
</script>
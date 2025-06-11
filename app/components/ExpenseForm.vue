<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Fecha" name="fecha">
        <UInput
          v-model="form.fecha"
          type="date"
          :error="errors.fecha"
          required
        />
      </UFormField>
      <UFormField label="Proveedor" name="proveedor">
        <UInput
          v-model="form.proveedor"
          placeholder="Nombre del proveedor"
          :error="errors.proveedor"
          required
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Sucursal" name="sucursalId">
        <USelect
          v-model="form.sucursalId"
          :items="sucursalOptions"
          class="w-40"
          placeholder="Selecciona una sucursal"
          :error="errors.sucursalId"
          required
        />
      </UFormField>

      <UFormField label="Forma de Pago" name="formaPago">
        <USelect
          v-model="form.formaPago"
          :items="formaPagoOptions"
          placeholder="Selecciona forma de pago"
          :error="errors.formaPago"
          required
        />
      </UFormField>
    </div>

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
          disabled
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

            <UFormField label="Categoría" name="categoryid">
              <USelect
                v-model="expenseItems[index].categoryid"
                :items="getSubcategoryOptions(index)"
                placeholder="Selecciona una Categoría"
                :loading="itemsLoadingSubcategories[index]"
                required
              >
                <template #empty>
                  <div class="p-2 text-sm text-gray-500">
                    {{ "No hay categorías disponibles" }}
                  </div>
                </template>
              </USelect>
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
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useExpenseStore } from "~/stores/expense";
import { useBranchStore } from "~/stores/branch";
import { useCategoryStore } from "~/stores/category";

// Initialize stores
const expenseStore = useExpenseStore();
const branchStore = useBranchStore();
const categoryStore = useCategoryStore();

const props = defineProps({
  expense: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["submit", "cancel"]);
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

// Subcategory states
const itemSubcategories = ref({}); // Store subcategories for each item by index
const itemsLoadingSubcategories = ref({}); // Track loading state for each item

// Function to get subcategory options for a specific item
const getSubcategoryOptions = (index) => {
  if (!itemSubcategories.value[index]) {
    return [];
  }

  return itemSubcategories.value[index].map((subcategory) => ({
    label: subcategory.nombre,
    value: subcategory.id,
  }));
};

// Function to load subcategories for a specific item
const loadItemSubcategories = async (index, subcategoryId) => {
  // Set loading state for this item
  itemsLoadingSubcategories.value[index] = true;

  try {
    // Directly fetch subcategories without filtering by category
    await categoryStore.fetchSubcategories();
    itemSubcategories.value[index] = categoryStore.subcategories;

    // If we have a subcategoryId, set it
    if (subcategoryId) {
      expenseItems.value[index].categoryid = subcategoryId;
    }
  } catch (error) {
    console.error(`Error fetching subcategories for item ${index}:`, error);
  } finally {
    itemsLoadingSubcategories.value[index] = false;
  }
};

// Sucursal options - computed from branch store
const sucursalOptions = computed(() => {
  return branchStore.branches.map((branch) => ({
    label: branch.nombre,
    value: parseInt(branch.id),
  }));
});

// Forma de pago options
const formaPagoOptions = [
  { label: "Efectivo", value: "Efectivo" },
  { label: "Transferencia", value: "Transferencia" },
];

// Calculate total when subtotal, descuento or impuesto change
watch([() => form.subtotal, () => form.descuento, () => form.impuesto], () => {
  const subtotal = parseFloat(form.subtotal) || 0;
  const descuento = parseFloat(form.descuento) || 0;
  const impuesto = parseFloat(form.impuesto) || 0;

  form.total = (subtotal - descuento + impuesto).toFixed(2);
});

// Observar cambios en las propiedades de los conceptos que afectan los cálculos
watch(
  expenseItems,
  (items) => {
    // Recalcular todos los subtotales y totales de los conceptos
    items.forEach((item, index) => {
      updateItemSubtotal(index);
    });
  },
  { deep: true }
);

// Initialize form with expense data if editing
onMounted(async () => {
  // Fetch branches if they haven't been loaded yet
  if (branchStore.branches.length === 0) {
    await branchStore.fetchBranches();
  }

  // Fetch all subcategories
  try {
    await categoryStore.fetchSubcategories();
  } catch (error) {
    console.error("Error fetching subcategories:", error);
  }

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

    // Cargar los detalles del gasto si existen
    if (props.expense.items && props.expense.items.length > 0) {
      expenseItems.value = [...props.expense.items];

      // Load subcategories for each item
      for (let i = 0; i < expenseItems.value.length; i++) {
        await loadItemSubcategories(i, expenseItems.value[i].categoryid);
      }
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

  // Validate that each expense item has a subcategory
  for (let i = 0; i < expenseItems.value.length; i++) {
    const item = expenseItems.value[i];

    if (!item.categoryid) {
      alert(`El concepto #${i + 1} requiere una categoría`);
      isValid = false;
      break;
    }
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
    // Actualizar totales al eliminar un concepto
    updateFormTotals();
  }
};

// Método para agregar un nuevo concepto vacío
const addNewExpenseItem = async () => {
  const newIndex = expenseItems.value.length;
  const newItem = {
    concepto: "",
    nombre: "", // Para compatibilidad con la base de datos
    cantidad: 1,
    precioUnitario: 0,
    precio_unitario: "0.00", // Para compatibilidad con la base de datos
    subtotal: "0.00",
    compraGastoId: props.expense?.id || 0, // Se actualizará cuando se cree el gasto
    descuento: 0,
    impuesto: 0,
    total: "0.00",
    categoryid: null,
  };

  // Initialize subcategories array for this item
  itemSubcategories.value[newIndex] = [];
  itemsLoadingSubcategories.value[newIndex] = false;

  expenseItems.value.push(newItem);

  // Load subcategories for the new item
  await loadItemSubcategories(newIndex);

  // Calcular el subtotal y total iniciales
  updateItemSubtotal(expenseItems.value.length - 1);
};

// Método para actualizar el subtotal y total de un concepto
const updateItemSubtotal = (index) => {
  const item = expenseItems.value[index];
  const cantidad = parseFloat(item.cantidad) || 0;
  const precioUnitario = parseFloat(item.precioUnitario) || 0;
  const descuento = parseFloat(item.descuento) || 0;
  const impuesto = parseFloat(item.impuesto) || 0;

  // Calcular subtotal (cantidad * precio unitario)
  const calculatedSubtotal = cantidad * precioUnitario;

  // Asignar el subtotal formateado para mostrar
  item.subtotal = calculatedSubtotal.toFixed(2);

  // Calcular total (subtotal - descuento + impuesto)
  const calculatedTotal = calculatedSubtotal - descuento + impuesto;

  // Asignar el total formateado para mostrar
  item.total = calculatedTotal.toFixed(2);

  // Mantener campos sincronizados para compatibilidad
  item.precio_unitario = precioUnitario.toFixed(2);
  item.nombre = item.concepto;

  // Recalcular totales generales del formulario
  updateFormTotals();
};

// Método para actualizar los totales del formulario principal
const updateFormTotals = () => {
  let subtotal = 0;
  let descuento = 0;
  let impuesto = 0;

  expenseItems.value.forEach((item) => {
    subtotal += parseFloat(item.subtotal) || 0;
    descuento += parseFloat(item.descuento) || 0;
    impuesto += parseFloat(item.impuesto) || 0;
  });

  // Actualizar valores del formulario
  form.subtotal = subtotal.toFixed(2);
  form.descuento = descuento.toFixed(2);
  form.impuesto = impuesto.toFixed(2);

  // Calcular el total general
  const total = subtotal - descuento + impuesto;
  form.total = total.toFixed(2);
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
      items: expenseItems.value.map((item) => {
        // Create a copy of the item to avoid modifying the original
        const itemCopy = { ...item };

        // Remove UI-specific properties
        delete itemCopy.concepto;
        delete itemCopy.precioUnitario;

        // Ensure subcategory ID is included
        return {
          ...itemCopy,
          compraGastoId: props.expense?.id || 0, // Se actualizará en el servidor
          categoryid: item.categoryid, // Use subcategoryid as categoryid
        };
      }),
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
    // Mostrar mensaje de error al usuario
    alert("Error al guardar el gasto. Por favor, inténtelo de nuevo.");
  } finally {
    loading.value = false;
  }
};
</script>
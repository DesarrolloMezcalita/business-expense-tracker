<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-1 gap-4">
      <!-- Nombre Field -->
      <div class="space-y-2">
        <label for="nombre" class="block text-sm font-medium text-gray-700"
          >Nombre</label
        >
        <UInput
          id="nombre"
          v-model="formData.nombre"
          placeholder="Ingrese nombre de la sucursal"
          @blur="validateField('nombre')"
          :class="{ 'border-red-500': errors.nombre }"
        />
        <p v-if="errors.nombre" class="text-red-500 text-xs mt-1">
          {{ errors.nombre }}
        </p>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <UButton
        type="button"
        label="Cancelar"
        color="gray"
        variant="outline"
        @click="$emit('cancel')"
      />
      <UButton
        type="submit"
        :label="isEditing ? 'Actualizar Sucursal' : 'Agregar Sucursal'"
        :loading="isSubmitting"
        :disabled="!isFormValid || isSubmitting"
      />
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";

const props = defineProps({
  branch: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit", "cancel"]);

const formData = reactive({
  id: props.branch.id || null,
  nombre: props.branch.nombre || "",
  created_at: props.branch.created_at || new Date().toISOString(),
});

const errors = reactive({
  nombre: "",
});

const isSubmitting = ref(false);

const isFormValid = computed(() => {
  return formData.nombre.trim() !== "" && !errors.nombre;
});

function validateField(field) {
  switch (field) {
    case "nombre":
      errors.nombre =
        formData.nombre.trim() === "" ? "El nombre es requerido" : "";
      break;
  }
}

function validateForm() {
  validateField("nombre");
  return isFormValid.value;
}

async function submitForm() {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    // Create a copy of the form data to emit
    const branchData = { ...formData };

    // If it's a new branch and no ID is provided, we don't send the ID field
    if (!props.isEditing && !branchData.id) {
      delete branchData.id;
    }

    emit("submit", branchData);
  } catch (error) {
    console.error("Error submitting form:", error);
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  // Initialize form data with props
  Object.assign(formData, props.branch);
});
</script>
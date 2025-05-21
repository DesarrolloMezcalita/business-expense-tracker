<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Name Field -->
      <div class="space-y-2">
        <label for="name" class="block text-sm font-medium text-gray-700"
          >Nombre</label
        >
        <UInput
          id="name"
          v-model="formData.name"
          placeholder="Nombre"
          @blur="validateField('name')"
          :class="{ 'border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="text-red-500 text-xs mt-1">
          {{ errors.name }}
        </p>
      </div>

      <!-- Phone Field -->
      <div class="space-y-2">
        <label for="text" class="block text-sm font-medium text-gray-700"
          >Teléfono</label
        >
        <UInput
          id="phone"
          v-model="formData.phone"
          placeholder="Teléfono"
          type="phone"
          @blur="validateField('phone')"
          :class="{ 'border-red-500': errors.phone }"
        />
        <p v-if="errors.phone" class="text-red-500 text-xs mt-1">
          {{ errors.phone }}
        </p>
      </div>

      <!-- Active Status Field -->
      <div class="space-y-2">
        <label for="is_active" class="block text-sm font-medium text-gray-700"
          >Estado</label
        >
        <USwitch id="is_active" v-model="formData.is_active">
          <template #on>Active</template>
          <template #off>Inactive</template>
        </USwitch>
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
        :label="isEditing ? 'Actualizar Usuario' : 'Agregar Usuario'"
        :loading="isSubmitting"
        :disabled="!isFormValid || isSubmitting"
      />
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";

const props = defineProps({
  user: {
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
  id: props.user.id || null,
  name: props.user.name || "",
  phone: props.user.phone || "",
  is_active: props.user.is_active !== undefined ? props.user.is_active : true,
  created_at:
    props.user.created_at || props.user.createdAt || new Date().toISOString(),
});

const errors = reactive({
  name: "",
  phone: "",
});

const isSubmitting = ref(false);

const isFormValid = computed(() => {
  return (
    formData.name.trim() !== "" &&
    formData.phone.trim() !== "" &&
    !errors.name &&
    !errors.phone
  );
});

function validateField(field) {
  switch (field) {
    case "name":
      errors.name = formData.name.trim() === "" ? "Name is required" : "";
      break;
    case "phone":
      if (formData.phone.trim() === "") {
        errors.phone = "Phone is required";
      } else {
        errors.phone = "";
      }
      break;
  }
}

function validateForm() {
  validateField("name");
  validateField("phone");

  return isFormValid.value;
}

async function submitForm() {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    // Create a copy of the form data to emit
    const userData = { ...formData };

    // If it's a new user and no ID is provided, we don't send the ID field
    if (!props.isEditing && !userData.id) {
      delete userData.id;
    }

    emit("submit", userData);
  } catch (error) {
    console.error("Error submitting form:", error);
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  // Initialize form data with props
  Object.assign(formData, props.user);
});
</script>
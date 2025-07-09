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

      <!-- Email Field -->
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-gray-700"
          >Correo</label
        >
        <UInput
          id="email"
          v-model="formData.email"
          placeholder="Correo"
          type="email"
          @blur="validateField('email')"
          :class="{ 'border-red-500': errors.email }"
        />
        <p v-if="errors.email" class="text-red-500 text-xs mt-1">
          {{ errors.email }}
        </p>
      </div>

      <!-- Role Field -->
      <div class="space-y-2">
        <label for="role" class="block text-sm font-medium text-gray-700"
          >Rol</label
        >
        <USelect
          id="role"
          v-model="formData.role"
          :items="roleOptions"
          @blur="validateField('role')"
          :class="{ 'border-red-500': errors.role }"
        />
        <p v-if="errors.role" class="text-red-500 text-xs mt-1">
          {{ errors.role }}
        </p>
      </div>

      <!-- Password Field -->
      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-gray-700"
          >Contraseña</label
        >
        <UInput
          id="password"
          v-model="formData.password"
          placeholder="Contraseña"
          type="password"
          @blur="validateField('password')"
          :class="{ 'border-red-500': errors.password }"
        />
        <p v-if="errors.password" class="text-red-500 text-xs mt-1">
          {{ errors.password }}
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
        variant="soft"
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
  email: props.user.email || "",
  password: props.user.password || "",
  role: props.user.role || "User",
  is_active: props.user.is_active !== undefined ? props.user.is_active : true,
  address: props.user.address || "",
  notes: props.user.notes || "",
  created_at:
    props.user.created_at || props.user.createdAt || new Date().toISOString(),
});

const errors = reactive({
  name: "",
  email: "",
  password: "",
  role: "",
});

const isSubmitting = ref(false);

const roleOptions = [
  { label: "Admin", value: "Admin" },
  // { label: "User", value: "User" },
  { label: "Editor", value: "Editor" },
];

const isFormValid = computed(() => {
  return (
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    validateEmail(formData.email) &&
    formData.role !== "" &&
    (formData.password !== "" || props.isEditing) &&
    !errors.name &&
    !errors.email &&
    (!errors.password || props.isEditing) &&
    !errors.role
  );
});

function validateField(field) {
  switch (field) {
    case "name":
      errors.name = formData.name.trim() === "" ? "Name is required" : "";
      break;
    case "email":
      if (formData.email.trim() === "") {
        errors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        errors.email = "Please enter a valid email address";
      } else {
        errors.email = "";
      }
      break;
    case "role":
      errors.role = formData.role === "" ? "Role is required" : "";
      break;
    case "password":
      errors.password =
        formData.password.trim() === "" ? "Password is required" : "";
      break;
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateForm() {
  validateField("name");
  validateField("email");
  if (!props.isEditing) validateField("password");
  validateField("role");

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
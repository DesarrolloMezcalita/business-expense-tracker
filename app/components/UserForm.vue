<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Name Field -->
      <div class="space-y-2">
        <label for="name" class="block text-sm font-medium text-gray-700"
          >Name</label
        >
        <UInput
          id="name"
          v-model="formData.name"
          placeholder="Enter full name"
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
          >Email</label
        >
        <UInput
          id="email"
          v-model="formData.email"
          placeholder="Enter email address"
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
          >Role</label
        >
        <USelect
          id="role"
          v-model="formData.role"
          :options="roleOptions"
          @blur="validateField('role')"
          :class="{ 'border-red-500': errors.role }"
        />
        <p v-if="errors.role" class="text-red-500 text-xs mt-1">
          {{ errors.role }}
        </p>
      </div>

      <!-- Status Field -->
      <div class="space-y-2">
        <label for="status" class="block text-sm font-medium text-gray-700"
          >Status</label
        >
        <USelect
          id="status"
          v-model="formData.status"
          :options="statusOptions"
          @blur="validateField('status')"
          :class="{ 'border-red-500': errors.status }"
        />
        <p v-if="errors.status" class="text-red-500 text-xs mt-1">
          {{ errors.status }}
        </p>
      </div>

      <!-- Address Field -->
      <div class="space-y-2 md:col-span-2">
        <label for="address" class="block text-sm font-medium text-gray-700"
          >Address</label
        >
        <UTextarea
          id="address"
          v-model="formData.address"
          placeholder="Enter address (optional)"
          :rows="2"
        />
      </div>

      <!-- Notes Field -->
      <div class="space-y-2 md:col-span-2">
        <label for="notes" class="block text-sm font-medium text-gray-700"
          >Notes</label
        >
        <UTextarea
          id="notes"
          v-model="formData.notes"
          placeholder="Additional notes (optional)"
          :rows="3"
        />
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <UButton
        type="button"
        label="Cancel"
        color="gray"
        variant="outline"
        @click="$emit('cancel')"
      />
      <UButton
        type="submit"
        :label="isEditing ? 'Update User' : 'Add User'"
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
  role: props.user.role || "User",
  status: props.user.status || "Active",
  address: props.user.address || "",
  notes: props.user.notes || "",
  createdAt: props.user.createdAt || new Date().toISOString(),
});

const errors = reactive({
  name: "",
  email: "",
  role: "",
  status: "",
});

const isSubmitting = ref(false);

const roleOptions = [
  { label: "Admin", value: "Admin" },
  { label: "User", value: "User" },
  { label: "Editor", value: "Editor" },
];

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const isFormValid = computed(() => {
  return (
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    validateEmail(formData.email) &&
    formData.role !== "" &&
    formData.status !== "" &&
    !errors.name &&
    !errors.email &&
    !errors.role &&
    !errors.status
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
    case "status":
      errors.status = formData.status === "" ? "Status is required" : "";
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
  validateField("role");
  validateField("status");

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
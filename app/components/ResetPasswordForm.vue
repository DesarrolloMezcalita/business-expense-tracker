<template>
  <div class="w-full max-w-md mx-auto">
    <form
      @submit.prevent="handleSubmit"
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <h2 class="text-2xl font-bold mb-6 text-center">Set New Password</h2>

      <UAlert v-if="error" type="danger" class="mb-4">
        {{ error }}
      </UAlert>

      <UAlert v-if="success" type="success" class="mb-4">
        {{ success }}
      </UAlert>

      <div class="mb-4">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="password"
        >
          New Password
        </label>
        <UInput
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter new password"
          :disabled="loading || success"
          required
          class="w-full"
          @blur="validateField('password')"
          :class="{ 'border-red-500': errors.password }"
        />
        <p v-if="errors.password" class="text-red-500 text-xs mt-1">
          {{ errors.password }}
        </p>
        <p v-else class="text-gray-600 text-xs mt-1">
          Password must be at least 8 characters long
        </p>
      </div>

      <div class="mb-6">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="confirmPassword"
        >
          Confirm Password
        </label>
        <UInput
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          :disabled="loading || success"
          required
          class="w-full"
          @blur="validateField('confirmPassword')"
          :class="{ 'border-red-500': errors.confirmPassword }"
        />
        <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">
          {{ errors.confirmPassword }}
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <UButton
          type="submit"
          :loading="loading"
          :disabled="loading || !isFormValid || success"
          block
        >
          Reset Password
        </UButton>

        <div class="text-center text-sm">
          <UButton
            variant="link"
            @click="$emit('switch-to-login')"
            :disabled="loading"
          >
            Back to Login
          </UButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
// import { useRouter } from "vue-router"; // Will be used later for redirects

const props = defineProps({
  email: {
    type: String,
    default: "",
  },
  token: {
    type: String,
    required: true,
  },
});

const authStore = useAuthStore();
// const router = useRouter(); // Will be used later for redirects

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");

const errors = reactive({
  password: "",
  confirmPassword: "",
});

const isFormValid = computed(() => {
  return (
    password.value.trim() !== "" &&
    confirmPassword.value.trim() !== "" &&
    password.value === confirmPassword.value &&
    password.value.length >= 8 &&
    !errors.password &&
    !errors.confirmPassword
  );
});

const validateField = (field) => {
  switch (field) {
    case "password":
      if (password.value.trim() === "") {
        errors.password = "Password is required";
      } else if (password.value.length < 8) {
        errors.password = "Password must be at least 8 characters long";
      } else {
        errors.password = "";
      }
      // Also validate confirm password if it has been entered
      if (confirmPassword.value) {
        validateField("confirmPassword");
      }
      break;
    case "confirmPassword":
      if (confirmPassword.value.trim() === "") {
        errors.confirmPassword = "Please confirm your password";
      } else if (confirmPassword.value !== password.value) {
        errors.confirmPassword = "Passwords do not match";
      } else {
        errors.confirmPassword = "";
      }
      break;
  }
};

const validateForm = () => {
  validateField("password");
  validateField("confirmPassword");

  return isFormValid.value;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    await authStore.resetPassword(props.token, password.value);

    // Show success message
    success.value = "Your password has been reset successfully.";

    // After 3 seconds, redirect to login
    setTimeout(() => {
      emit("switch-to-login");
    }, 3000);
  } catch (err) {
    error.value = err.message || "Failed to reset password. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Define emits
const emit = defineEmits(["switch-to-login"]);
</script>
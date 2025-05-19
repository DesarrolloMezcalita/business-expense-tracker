<template>
  <div class="w-full max-w-md mx-auto">
    <form
      @submit.prevent="handleRegister"
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <h2 class="text-2xl font-bold mb-6 text-center">Create Account</h2>

      <UAlert v-if="error" type="danger" class="mb-4">
        {{ error }}
      </UAlert>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
          Full Name
        </label>
        <UInput
          id="name"
          v-model="name"
          type="text"
          placeholder="Enter your full name"
          :disabled="loading"
          required
          class="w-full"
          @blur="validateField('name')"
          :class="{ 'border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="text-red-500 text-xs mt-1">
          {{ errors.name }}
        </p>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
          Email
        </label>
        <UInput
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          :disabled="loading"
          required
          class="w-full"
          @blur="validateField('email')"
          :class="{ 'border-red-500': errors.email }"
        />
        <p v-if="errors.email" class="text-red-500 text-xs mt-1">
          {{ errors.email }}
        </p>
      </div>

      <div class="mb-4">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="password"
        >
          Password
        </label>
        <UInput
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
          :disabled="loading"
          required
          class="w-full"
          @blur="validateField('password')"
          :class="{ 'border-red-500': errors.password }"
        />
        <p v-if="errors.password" class="text-red-500 text-xs mt-1">
          {{ errors.password }}
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
          placeholder="Confirm your password"
          :disabled="loading"
          required
          class="w-full"
          @blur="validateField('confirmPassword')"
          :class="{ 'border-red-500': errors.confirmPassword }"
        />
        <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">
          {{ errors.confirmPassword }}
        </p>
      </div>

      <div class="mb-6">
        <UCheckbox
          v-model="termsAccepted"
          label="I agree to the Terms of Service and Privacy Policy"
          @blur="validateField('termsAccepted')"
        />
        <p v-if="errors.termsAccepted" class="text-red-500 text-xs mt-1">
          {{ errors.termsAccepted }}
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <UButton
          type="submit"
          :loading="loading"
          :disabled="loading || !isFormValid"
          block
        >
          Register
        </UButton>

        <div class="text-center text-sm">
          Already have an account?
          <UButton
            variant="link"
            @click="$emit('switch-to-login')"
            :disabled="loading"
          >
            Login
          </UButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const { $authRedirect } = useNuxtApp();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const termsAccepted = ref(false);
const loading = ref(false);
const error = ref("");

const errors = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  termsAccepted: "",
});

const isFormValid = computed(() => {
  return (
    name.value.trim() !== "" &&
    email.value.trim() !== "" &&
    password.value.trim() !== "" &&
    confirmPassword.value.trim() !== "" &&
    password.value === confirmPassword.value &&
    termsAccepted.value &&
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword &&
    !errors.termsAccepted
  );
});

const validateField = (field) => {
  switch (field) {
    case "name":
      errors.name = name.value.trim() === "" ? "Name is required" : "";
      break;
    case "email":
      if (email.value.trim() === "") {
        errors.email = "Email is required";
      } else if (!validateEmail(email.value)) {
        errors.email = "Please enter a valid email address";
      } else {
        errors.email = "";
      }
      break;
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
    case "termsAccepted":
      errors.termsAccepted = !termsAccepted.value
        ? "You must accept the terms to continue"
        : "";
      break;
  }
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateForm = () => {
  validateField("name");
  validateField("email");
  validateField("password");
  validateField("confirmPassword");
  validateField("termsAccepted");

  return isFormValid.value;
};

const handleRegister = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = "";

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
      role: "User", // Default role for new registrations
    });

    // Redirect to original path or home page
    $authRedirect.redirectBack();
  } catch (err) {
    error.value = err.message || "Failed to register. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Define emits
defineEmits(["switch-to-login"]);
</script>
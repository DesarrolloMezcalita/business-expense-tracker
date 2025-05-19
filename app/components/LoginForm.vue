<template>
  <div class="w-full max-w-md mx-auto">
    <form
      @submit.prevent="handleLogin"
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

      <UAlert v-if="error" type="danger" class="mb-4">
        {{ error }}
      </UAlert>

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
        />
      </div>

      <div class="mb-6">
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
        />
      </div>

      <div class="flex items-center justify-between mb-6">
        <UCheckbox v-model="rememberMe" label="Remember me" />
      </div>

      <div class="flex flex-col gap-4">
        <UButton
          type="submit"
          :loading="loading"
          :disabled="loading || !isFormValid"
          block
        >
          Login
        </UButton>

        <!-- <div class="text-center text-sm">
          Don't have an account?
          <UButton
            variant="link"
            @click="$emit('switch-to-register')"
            :disabled="loading"
          >
            Register
          </UButton>
        </div> -->
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const { $authRedirect } = useNuxtApp();

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const loading = ref(false);
const error = ref("");

const isFormValid = computed(() => {
  return email.value.trim() !== "" && password.value.trim() !== "";
});

const handleLogin = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  error.value = "";

  try {
    await authStore.login(email.value, password.value);

    // Store email in localStorage if remember me is checked
    if (rememberMe.value) {
      localStorage.setItem("remembered_email", email.value);
    } else {
      localStorage.removeItem("remembered_email");
    }

    // Redirect to original path or home page
    $authRedirect.redirectBack();
  } catch (err) {
    error.value = err.message || "Failed to login. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Define emits
const emit = defineEmits(["switch-to-register", "switch-to-forgot-password"]);

const forgotPassword = () => {
  // Emit event to switch to forgot password form
  emit("switch-to-forgot-password");
};

// Check if there's a remembered email
const rememberedEmail = localStorage.getItem("remembered_email");
if (rememberedEmail) {
  email.value = rememberedEmail;
  rememberMe.value = true;
}
</script>
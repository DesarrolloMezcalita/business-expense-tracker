<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-gray-900">
          Business Expense Tracker
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          {{ getFormTitle }}
        </p>
      </div>

      <LoginForm
        v-if="currentForm === 'login'"
        @switch-to-register="currentForm = 'register'"
        @switch-to-forgot-password="currentForm = 'forgot-password'"
      />

      <RegisterForm
        v-else-if="currentForm === 'register'"
        @switch-to-login="currentForm = 'login'"
      />

      <ForgotPasswordForm
        v-else-if="currentForm === 'forgot-password'"
        @switch-to-login="currentForm = 'login'"
        @switch-to-reset-password="handleResetPassword"
      />

      <ResetPasswordForm
        v-else-if="currentForm === 'reset-password'"
        :email="resetPasswordData.email"
        :token="resetPasswordData.token"
        @switch-to-login="currentForm = 'login'"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

const currentForm = ref("login");
const resetPasswordData = ref({
  email: "",
  token: "",
});

const getFormTitle = computed(() => {
  switch (currentForm.value) {
    case "login":
      return "Sign in to your account";
    case "register":
      return "Create a new account";
    case "forgot-password":
      return "Reset your password";
    case "reset-password":
      return "Set a new password";
    default:
      return "";
  }
});

const handleResetPassword = (data) => {
  resetPasswordData.value = data;
  currentForm.value = "reset-password";
};

onMounted(async () => {
  // Check if user is already authenticated
  const isAuthenticated = await authStore.checkAuth();
  if (isAuthenticated) {
    // Redirect to original path or home page
    const { $authRedirect } = useNuxtApp();
    $authRedirect.redirectBack();
  }

  // Check for reset token in URL (for email links)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const email = urlParams.get("email");

  if (token && email) {
    resetPasswordData.value = { token, email };
    currentForm.value = "reset-password";
  }
});

// Define page metadata
definePageMeta({
  layout: "auth",
  middleware: ["guest"],
});
</script>
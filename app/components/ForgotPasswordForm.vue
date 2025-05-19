<template>
  <div class="w-full max-w-md mx-auto">
    <form
      @submit.prevent="handleSubmit"
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <h2 class="text-2xl font-bold mb-6 text-center">Reset Password</h2>

      <UAlert v-if="error" type="danger" class="mb-4">
        {{ error }}
      </UAlert>

      <UAlert v-if="success" type="success" class="mb-4">
        {{ success }}
      </UAlert>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
          Email
        </label>
        <UInput
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          :disabled="loading || success"
          required
          class="w-full"
        />
        <p class="text-gray-600 text-xs mt-1">
          We'll send you a link to reset your password.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <UButton
          type="submit"
          :loading="loading"
          :disabled="loading || !email || success"
          block
        >
          Send Reset Link
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
import { ref } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

const email = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");

// Define emits
const emit = defineEmits(["switch-to-login"]);

const handleSubmit = async () => {
  if (!email.value) return;

  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    await authStore.requestPasswordReset(email.value);

    // Show success message
    success.value =
      "Password reset link has been sent to your email. Please check your inbox.";

    // In a real app, the email would be sent to the user
    // For this demo, we'll show the reset token in the console
    console.log("Reset token (for demo purposes):", authStore.resetToken);

    // After 5 seconds, redirect to reset password form
    setTimeout(() => {
      emit("switch-to-reset-password", {
        email: email.value,
        token: authStore.resetToken,
      });
    }, 5000);
  } catch (err) {
    error.value = err.message || "Failed to send reset link. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
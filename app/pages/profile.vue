<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">My Profile</h1>

    <UCard class="max-w-2xl mx-auto">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Profile Information</h2>
          <UBadge :color="userRoleColor" variant="subtle">
            {{ authStore.user?.role }}
          </UBadge>
        </div>
      </template>

      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
      </div>

      <form v-else @submit.prevent="updateProfile" class="space-y-6">
        <UAlert v-if="error" type="danger" class="mb-4">
          {{ error }}
        </UAlert>

        <UAlert v-if="success" type="success" class="mb-4">
          {{ success }}
        </UAlert>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <UFormGroup label="Full Name" for="name">
              <UInput
                id="name"
                v-model="form.name"
                placeholder="Your full name"
                :disabled="loading"
                required
              />
            </UFormGroup>
          </div>

          <div>
            <UFormGroup label="Email Address" for="email">
              <UInput
                id="email"
                v-model="form.email"
                type="email"
                placeholder="Your email address"
                :disabled="loading"
                required
              />
            </UFormGroup>
          </div>
        </div>

        <UDivider />

        <div class="space-y-6">
          <h3 class="text-lg font-medium">Change Password</h3>
          <p class="text-sm text-gray-500">
            Leave blank if you don't want to change your password
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <UFormGroup label="Current Password" for="currentPassword">
                <UInput
                  id="currentPassword"
                  v-model="form.currentPassword"
                  type="password"
                  placeholder="Current password"
                  :disabled="loading"
                />
              </UFormGroup>
            </div>

            <div>
              <UFormGroup label="New Password" for="newPassword">
                <UInput
                  id="newPassword"
                  v-model="form.newPassword"
                  type="password"
                  placeholder="New password"
                  :disabled="loading"
                />
              </UFormGroup>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" @click="resetForm" :disabled="loading">
            Cancel
          </UButton>

          <UButton
            type="submit"
            @click="updateProfile"
            :loading="loading"
            :disabled="loading || !isFormValid"
          >
            Save Changes
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const loading = ref(false);
const error = ref("");
const success = ref("");

const form = reactive({
  name: "",
  email: "",
  currentPassword: "",
  newPassword: "",
});

const isFormValid = computed(() => {
  // Basic validation
  if (!form.name || !form.email) return false;

  // If changing password, both fields must be filled
  if (form.currentPassword && !form.newPassword) return false;
  if (!form.currentPassword && form.newPassword) return false;

  // If changing password, new password must be at least 8 characters
  if (form.newPassword && form.newPassword.length < 8) return false;

  return true;
});

const userRoleColor = computed(() => {
  const role = authStore.user?.role;
  switch (role) {
    case "Admin":
      return "blue";
    case "Editor":
      return "yellow";
    case "User":
      return "gray";
    default:
      return "gray";
  }
});

const resetForm = () => {
  // Reset form to current user data
  if (authStore.user) {
    form.name = authStore.user.name;
    form.email = authStore.user.email;
    form.currentPassword = "";
    form.newPassword = "";
  }

  error.value = "";
  success.value = "";
};

const updateProfile = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    // Update profile
    const updateData = {
      name: form.name,
      email: form.email,
    };

    // If changing password
    if (form.currentPassword && form.newPassword) {
      try {
        await authStore.changePassword(form.currentPassword, form.newPassword);
        form.currentPassword = "";
        form.newPassword = "";
      } catch (err) {
        error.value =
          err.message || "Failed to change password. Please try again.";
        loading.value = false;
        return;
      }
    }

    await authStore.updateProfile(updateData);
    success.value = "Profile updated successfully";
  } catch (err) {
    error.value = err.message || "Failed to update profile. Please try again.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Initialize form with current user data
  resetForm();
});

// Define page metadata
definePageMeta({
  middleware: ["auth"],
});
</script>
<template>
  <div>
    <div v-if="currentView === 'list'">
      <RecurringExpenseList
        @new="openForm(null)"
        @view="openDetail"
        @edit="openForm"
        @delete="handleDelete"
        @toggle-active="handleToggleActive"
      />
    </div>

    <BaseModal
      v-model="showForm"
      :title="isEditing ? 'Editar Gasto Recurrente' : 'Nuevo Gasto Recurrente'"
    >
      <RecurringExpenseForm
        :expense="currentExpense"
        :loading="formLoading"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </BaseModal>

    <!-- <UModal v-model:open="showForm" :ui="{ width: 'max-w-3xl' }">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium">
            {{
              isEditing ? "Editar Gasto Recurrente" : "Nuevo Gasto Recurrente"
            }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showForm = false"
          />
        </div>
      </template>

      <template #body>
        <RecurringExpenseForm
          :expense="currentExpense"
          :loading="formLoading"
          @submit="handleSubmit"
          @cancel="showForm = false"
        />
      </template>
    </UModal> -->

    <BaseModal v-model="showDetail" title="Detalle de Gasto Recurrente">
      <RecurringExpenseDetail
        :expense="currentExpense"
        @close="showDetail = false"
        @edit="openForm"
        @toggle-active="handleToggleActive"
        @mark-paid="handleMarkPaid"
        @view-expense="handleViewExpense"
      />
    </BaseModal>

    <!-- <UModal v-model:open="showDetail" :ui="{ width: 'max-w-4xl' }">
      <template #body v-if="currentExpense">
        <RecurringExpenseDetail
          :expense="currentExpense"
          @close="showDetail = false"
          @edit="openForm"
          @toggle-active="handleToggleActive"
          @mark-paid="handleMarkPaid"
          @view-expense="handleViewExpense"
        />
      </template>
    </UModal> -->

    <!-- Delete Confirmation Modal -->
    <!-- <BaseModal v-model="isDeleteModalOpen" title="Confirmar Eliminación">
      <div aria-describedby="delete-user-description">
        <p id="delete-user-description">
          ¿Está seguro que desea eliminar el gasto
          <strong>{{ deleteItemName }}</strong
          >? Esta acción no se puede deshacer.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            variant="soft"
            @click="isDeleteModalOpen = false"
          />
          <UButton
            label="Eliminar"
            color="error"
            icon="i-heroicons-trash"
            @click="confirmDeleteExpense"
          />
        </div>
      </template>
    </BaseModal> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRecurringExpenseStore } from "~/stores/recurring-expense";
// import { useExpenseStore } from "~/stores/expense"; // Uncomment when needed
import { useRouter } from "vue-router";

const router = useRouter();
const recurringExpenseStore = useRecurringExpenseStore();
// const expenseStore = useExpenseStore(); // Uncomment when needed

// Estado
const currentView = ref("list");
const showForm = ref(false);
const showDetail = ref(false);
const isDeleteModalOpen = ref(false);
const currentExpense = ref(null);
const formLoading = ref(false);

// Computed
const isEditing = computed(() => !!currentExpense.value);

// Métodos
const openForm = (expense = null) => {
  currentExpense.value = expense;
  showForm.value = true;
  showDetail.value = false;
};

const openDetail = (expense) => {
  currentExpense.value = expense;
  showDetail.value = true;
  showForm.value = false;
};

const handleSubmit = async (formData) => {
  formLoading.value = true;

  try {
    if (isEditing.value) {
      // Actualizar gasto recurrente existente
      await recurringExpenseStore.updateRecurringExpense(
        currentExpense.value.id,
        formData
      );
      showNotification({
        title: "Gasto recurrente actualizado",
        text: `El gasto "${formData.nombre}" ha sido actualizado correctamente.`,
        type: "success",
      });
    } else {
      // Crear nuevo gasto recurrente
      await recurringExpenseStore.createRecurringExpense(formData);
      showNotification({
        title: "Gasto recurrente creado",
        text: `El gasto "${formData.nombre}" ha sido creado correctamente.`,
        type: "success",
      });
    }

    // Cerrar formulario y actualizar lista
    showForm.value = false;
    currentExpense.value = null;
  } catch (error) {
    console.error("Error al guardar el gasto recurrente:", error);
    showNotification({
      title: "Error",
      text: "Ha ocurrido un error al guardar el gasto recurrente.",
      type: "error",
    });
  } finally {
    formLoading.value = false;
  }
};

const handleDelete = async (expense) => {
  try {
    await recurringExpenseStore.deleteRecurringExpense(expense.id);

    if (showDetail.value && currentExpense.value?.id === expense.id) {
      showDetail.value = false;
      currentExpense.value = null;
    }

    showNotification({
      title: "Gasto recurrente eliminado",
      text: `El gasto "${expense.nombre}" ha sido eliminado correctamente.`,
      type: "success",
    });
  } catch (error) {
    console.error("Error al eliminar el gasto recurrente:", error);
    showNotification({
      title: "Error",
      text: "Ha ocurrido un error al eliminar el gasto recurrente.",
      type: "error",
    });
  }
};

const handleToggleActive = async (expense) => {
  try {
    const updatedExpense = await recurringExpenseStore.toggleActive(
      expense.id,
      !expense.activo
    );

    if (currentExpense.value?.id === expense.id) {
      currentExpense.value = updatedExpense;
    }

    showNotification({
      title: updatedExpense.activo ? "Gasto activado" : "Gasto desactivado",
      text: `El gasto "${expense.nombre}" ha sido ${
        updatedExpense.activo ? "activado" : "desactivado"
      } correctamente.`,
      type: "success",
    });
  } catch (error) {
    console.error("Error al cambiar el estado del gasto recurrente:", error);
    showNotification({
      title: "Error",
      text: "Ha ocurrido un error al cambiar el estado del gasto recurrente.",
      type: "error",
    });
  }
};

const handleMarkPaid = async (_instance) => {
  // Aquí se implementaría la lógica para marcar como pagado
  // Esto podría incluir la creación de un gasto normal asociado a esta instancia
  showNotification({
    title: "Funcionalidad no implementada",
    text: "La funcionalidad para marcar como pagado aún no está implementada.",
    type: "info",
  });
};

const handleViewExpense = (expenseId) => {
  // Navegar a la vista de detalle del gasto asociado
  router.push(`/expenses?id=${expenseId}`);
};

const showNotification = ({ title, text, type = "info" }) => {
  const toast = useToast();
  toast.add({
    title,
    description: text,
    color: type === "success" ? "green" : type === "error" ? "red" : "blue",
    icon:
      type === "success"
        ? "i-heroicons-check-circle"
        : type === "error"
        ? "i-heroicons-exclamation-circle"
        : "i-heroicons-information-circle",
    timeout: 5000,
  });
};

// Inicialización
onMounted(async () => {
  try {
    await recurringExpenseStore.fetchRecurringExpenses();
  } catch (error) {
    console.error("Error al cargar los gastos recurrentes:", error);
    showNotification({
      title: "Error",
      text: "Ha ocurrido un error al cargar los gastos recurrentes.",
      type: "error",
    });
  }
});

// Definir el título de la página
useHead({
  title: "Gastos Recurrentes",
});
</script>
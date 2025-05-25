<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Gestor de Gastos</h1>
      <p class="text-gray-600 mt-1">
        Administra tus gastos empresariales de manera eficiente
      </p>
    </div>

    <!-- Lista de gastos -->
    <ExpenseList
      @new="createExpense"
      @view="viewExpense"
      @edit="editExpense"
      @delete="handleDelete"
    />

    <!-- Modal de formulario de gastos -->
    <UModal v-model:open="showForm">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium">
            {{ expense ? "Editar Gasto" : "Nuevo Gasto" }}
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="cancelForm"
            aria-label="Close"
          />
        </div>
      </template>

      <template #body>
        <ExpenseForm
          :expense="currentExpense"
          @submit="handleFormSubmit"
          @cancel="cancelForm"
        />
      </template>
    </UModal>

    <!-- Modal de detalles de gasto -->
    <UModal v-model:open="showDetail">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium">Detalles del Gasto</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="closeDetail"
          />
        </div>
      </template>
      <template #body>
        <ExpenseDetail
          :expense="currentExpense"
          :loading="expenseStore.loading"
          @close="closeDetail"
          @edit="editExpense"
        />
      </template>
    </UModal>

    <!-- Notificaciones -->
    <UNotification
      v-model="notification.show"
      :description="notification.message"
      :color="notification.color"
      :timeout="3000"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useExpenseStore } from "~/stores/expense";

// Estado
const showForm = ref(false);
const showDetail = ref(false);
const currentExpense = ref(null);
const notification = ref({
  show: false,
  message: "",
  color: "green",
});

// Store
const expenseStore = useExpenseStore();

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    await expenseStore.fetchExpenses();
  } catch {
    showNotification("Error al cargar los gastos", "red");
  }
});

// Métodos para gestionar gastos
const createExpense = () => {
  currentExpense.value = null;
  showForm.value = true;
  showDetail.value = false;
};

const editExpense = (expense) => {
  currentExpense.value = expense;
  showForm.value = true;
  showDetail.value = false;
};

const viewExpense = async (expense) => {
  try {
    // Si ya tenemos todos los detalles, usamos el objeto directamente
    // Si no, cargamos los detalles completos desde la API
    if (expense && Object.keys(expense).length > 5) {
      currentExpense.value = expense;
    } else {
      const fullExpense = await expenseStore.fetchExpense(expense.id);
      currentExpense.value = fullExpense;
    }

    showDetail.value = true;
    showForm.value = false;
  } catch {
    showNotification("Error al cargar los detalles del gasto", "red");
  }
};

const handleFormSubmit = (_expense) => {
  const isNew = !currentExpense.value;
  showNotification(
    isNew ? "Gasto creado correctamente" : "Gasto actualizado correctamente",
    "green"
  );

  showForm.value = false;
  currentExpense.value = null;
};

const cancelForm = () => {
  showForm.value = false;
  currentExpense.value = null;
};

const closeDetail = () => {
  showDetail.value = false;
  currentExpense.value = null;
};

const handleDelete = () => {
  showNotification("Gasto eliminado correctamente", "green");
};

// Utilidades
const showNotification = (message, color = "green") => {
  notification.value = {
    show: true,
    message,
    color,
  };
};

// Definir metadatos de la página
definePageMeta({
  middleware: ["auth"],
  layout: "default",
});
</script>
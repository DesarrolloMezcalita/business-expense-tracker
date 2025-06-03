import { defineStore } from "pinia";
import { useSupabase } from "~/utils/supabase";
import type { GastoRecurrente } from "~/types/recurring-expense";

interface GastoRecurrenteInstance {
  id: number;
  gasto_recurrente_id: number;
  fecha: string;
  monto: number;
  pagado: boolean;
  created_at: string;
  updated_at: string;
}

interface RecurringExpenseState {
  recurringExpenses: GastoRecurrente[];
  instances: GastoRecurrenteInstance[];
  loading: boolean;
  error: string | null;
  currentRecurringExpense: GastoRecurrente | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    search: string;
    status: string;
    frequency: string;
    minAmount: string;
    maxAmount: string;
    sucursalId: string;
    active: boolean | null;
  };
  sorting: {
    field: string;
    descending: boolean;
  };
}

export const useRecurringExpenseStore = defineStore("recurring-expense", {
  state: (): RecurringExpenseState => ({
    recurringExpenses: [],
    instances: [],
    loading: false,
    error: null,
    currentRecurringExpense: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
    filters: {
      search: "",
      status: "",
      frequency: "",
      minAmount: "",
      maxAmount: "",
      sucursalId: "",
      active: true,
    },
    sorting: {
      field: "created_at",
      descending: true,
    },
  }),

  getters: {
    paginatedRecurringExpenses: (state): GastoRecurrente[] => {
      // Apply filters
      let filtered = [...state.recurringExpenses];

      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(
          (expense) =>
            expense.nombre.toLowerCase().includes(searchLower) ||
            expense.proveedor.toLowerCase().includes(searchLower)
        );
      }

      if (state.filters.frequency) {
        filtered = filtered.filter(
          (expense) => expense.frecuencia === state.filters.frequency
        );
      }

      if (state.filters.sucursalId) {
        filtered = filtered.filter(
          (expense) => expense.sucursalid === parseInt(state.filters.sucursalId)
        );
      }

      if (state.filters.active !== null && state.filters.active !== undefined) {
        filtered = filtered.filter(
          (expense) => expense.activo === state.filters.active
        );
      }

      if (state.filters.minAmount) {
        filtered = filtered.filter(
          (expense) => expense.monto >= parseFloat(state.filters.minAmount)
        );
      }

      if (state.filters.maxAmount) {
        filtered = filtered.filter(
          (expense) => expense.monto <= parseFloat(state.filters.maxAmount)
        );
      }

      // Apply sorting
      const { field, descending } = state.sorting;
      filtered.sort((a, b) => {
        let valueA = a[field as keyof GastoRecurrente];
        let valueB = b[field as keyof GastoRecurrente];

        // Handle special cases for different field types
        if (field === "monto") {
          valueA = parseFloat(valueA as string);
          valueB = parseFloat(valueB as string);
        } else if (field === "created_at" || field === "updated_at") {
          valueA = new Date((valueA as string) || "9999-12-31").getTime();
          valueB = new Date((valueB as string) || "9999-12-31").getTime();
        } else if (field === "sucursalId") {
          // Ordenar por el nombre de la sucursal
          valueA = a.sucursal?.nombre?.toLowerCase() || "";
          valueB = b.sucursal?.nombre?.toLowerCase() || "";
        } else if (typeof valueA === "string") {
          valueA = valueA.toLowerCase();
          valueB = valueB as string;
          valueB = (valueB as string).toLowerCase();
        }

        // Apply sort direction
        if (descending) {
          return valueB !== null &&
            valueA !== null &&
            valueB !== undefined &&
            valueA !== undefined
            ? valueB > valueA
              ? 1
              : valueB < valueA
              ? -1
              : 0
            : 0;
        } else {
          return valueA !== null &&
            valueB !== null &&
            valueA !== undefined &&
            valueB !== undefined
            ? valueA > valueB
              ? 1
              : valueA < valueB
              ? -1
              : 0
            : 0;
        }
      });

      // Update total for pagination
      state.pagination.total = filtered.length;

      // Apply pagination
      const start = (state.pagination.page - 1) * state.pagination.limit;
      const end = start + state.pagination.limit;

      return filtered.slice(start, end);
    },

    totalPages: (state): number => {
      return Math.ceil(state.pagination.total / state.pagination.limit);
    },

    frequencies: (state): string[] => {
      const frequencies = new Set(
        state.recurringExpenses
          .map((expense) => expense.frecuencia)
          .filter((freq): freq is string => freq !== undefined)
      );
      return Array.from(frequencies);
    },
  },

  actions: {
    async fetchRecurringExpenses() {
      this.loading = true;
      this.error = null;

      try {
        const supabase = useSupabase();

        const query = supabase
          .from("gastos_recurrentes")
          .select(
            `
            *,
            sucursal:sucursales(id, nombre)
          `
          )
          .order("created_at", { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching recurring expenses:", error);
          throw error;
        } else {
          this.recurringExpenses = data as GastoRecurrente[];
        }

        console.log("this.recurringExpenses", this.recurringExpenses);

        this.pagination.total = this.recurringExpenses.length;
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        console.error("Error fetching recurring expenses:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchRecurringExpense(id: number): Promise<GastoRecurrente | null> {
      this.loading = true;
      this.error = null;

      try {
        const supabase = useSupabase();

        const { data, error } = await supabase
          .from("gastos_recurrentes")
          .select(
            `
            *,
            sucursal:sucursales(id, nombre)
          `
          )
          .eq("id", id)
          .single();

        if (error) {
          console.error(
            `Error fetching recurring expense with ID ${id}:`,
            error
          );
          throw error;
        } else {
          this.currentRecurringExpense = data as GastoRecurrente;
          return data as GastoRecurrente;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        console.error(`Error fetching recurring expense with ID ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchInstances(
      recurringExpenseId: number
    ): Promise<GastoRecurrenteInstance[]> {
      this.loading = true;
      this.error = null;

      try {
        const supabase = useSupabase();

        const { data, error } = await supabase
          .from("instancias_gastos_recurrentes")
          .select("*")
          .eq("gasto_recurrente_id", recurringExpenseId)
          .order("fecha", { ascending: false });

        if (error) {
          console.error(
            `Error fetching instances for recurring expense ID ${recurringExpenseId}:`,
            error
          );
          throw error;
        } else {
          this.instances = data;
          return data;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        console.error(
          `Error fetching instances for recurring expense ID ${recurringExpenseId}:`,
          error
        );
        return [];
      } finally {
        this.loading = false;
      }
    },

    async createRecurringExpense(
      recurringExpense: Partial<GastoRecurrente>
    ): Promise<GastoRecurrente | null> {
      this.loading = true;
      this.error = null;

      try {
        const supabase = useSupabase();

        // Add user_id to the recurring expense
        const newRecurringExpense = {
          ...recurringExpense,
          categoriaid: 1, // Default category ID
        };

        const { data, error } = await supabase
          .from("gastos_recurrentes")
          .insert(newRecurringExpense)
          .select()
          .single();

        if (error) {
          console.error("Error creating recurring expense:", error);
          throw error;
        } else {
          // Add to local state
          this.recurringExpenses.unshift(data as GastoRecurrente);
          this.pagination.total++;

          return data as GastoRecurrente;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        console.error("Error creating recurring expense:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateRecurringExpense(
      id: number,
      updates: Partial<GastoRecurrente>
    ): Promise<GastoRecurrente | null> {
      this.loading = true;
      this.error = null;

      try {
        const supabase = useSupabase();

        const { data, error } = await supabase
          .from("gastos_recurrentes")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error(
            `Error updating recurring expense with ID ${id}:`,
            error
          );
          throw error;
        } else {
          // Update in local state
          const index = this.recurringExpenses.findIndex((e) => e.id === id);
          if (index !== -1) {
            this.recurringExpenses[index] = data as GastoRecurrente;
          }

          if (
            this.currentRecurringExpense &&
            this.currentRecurringExpense.id === id
          ) {
            this.currentRecurringExpense = data as GastoRecurrente;
          }

          return data as GastoRecurrente;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        console.error(`Error updating recurring expense with ID ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteRecurringExpense(id: number): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const supabase = useSupabase();

        const { error } = await supabase
          .from("gastos_recurrentes")
          .delete()
          .eq("id", id);

        if (error) {
          console.error(
            `Error deleting recurring expense with ID ${id}:`,
            error
          );
          throw error;
        } else {
          // Remove from local state
          this.recurringExpenses = this.recurringExpenses.filter(
            (e) => e.id !== id
          );
          this.pagination.total--;

          if (
            this.currentRecurringExpense &&
            this.currentRecurringExpense.id === id
          ) {
            this.currentRecurringExpense = null;
          }

          return true;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
        console.error(`Error deleting recurring expense with ID ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Pagination actions
    setPage(page: number) {
      this.pagination.page = page;
    },

    setLimit(limit: number) {
      this.pagination.limit = limit;
      this.pagination.page = 1; // Reset to first page when changing limit
    },

    // Filter actions
    setFilters(filters: Partial<RecurringExpenseState["filters"]>) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // Reset to first page when applying filters
    },

    setSorting(field: string, descending = false) {
      this.sorting.field = field;
      this.sorting.descending = descending;
      this.pagination.page = 1; // Reset to first page when changing sorting
    },

    clearFilters() {
      this.filters = {
        search: "",
        status: "",
        frequency: "",
        minAmount: "",
        maxAmount: "",
        sucursalId: "",
        active: true,
      };
      this.sorting = {
        field: "created_at",
        descending: true,
      };
      this.pagination.page = 1;
    },

    // Toggle active status
    async toggleActive(
      id: number,
      active: boolean
    ): Promise<GastoRecurrente | null> {
      return this.updateRecurringExpense(id, { activo: active });
    },
  },
});

import { useStore } from '@/lib/store';

export function useExpenses() {
  const { state, upsertExpense, removeExpense } = useStore();
  return {
    expenses: state.expenses,
    upsertExpense,
    removeExpense,
  };
}

import { useStore } from '@/lib/store';

export function useEmployees() {
  const { state, addEmployee, patchEmployee, upsertEmployee } = useStore();
  return {
    employees: state.employees,
    addEmployee,
    patchEmployee,
    upsertEmployee,
  };
}

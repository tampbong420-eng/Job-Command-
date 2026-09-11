import { useStore } from '@/lib/store';

export function useCompany() {
  const { state, patchCompany, saveCompany } = useStore();
  return {
    profile: state.company,
    save: saveCompany,
    patch: patchCompany,
  };
}

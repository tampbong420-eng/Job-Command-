import { useStore } from '@/lib/store';

export function useVapiSettings() {
  const { state, patchVapi } = useStore();
  return {
    settings: state.vapiSettings,
    save: patchVapi,
  };
}

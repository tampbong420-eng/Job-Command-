import { useStore } from '@/lib/store';

export function useCustomers() {
  const { state, addJob, patchJob, upsertJob } = useStore();
  const customers = [...new Map(state.jobs.map((job) => [job.customerName, job])).values()].map(
    (job) => ({
      name: job.customerName,
      phone: job.customerPhone,
      address: job.address,
    }),
  );
  return {
    jobs: state.jobs,
    customers,
    addJob,
    patchJob,
    upsertJob,
  };
}

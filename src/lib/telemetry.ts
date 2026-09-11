import type { Employee } from '@/types';
import { supabase } from '@/lib/supabase';

export async function publishTelemetry(employee: Employee) {
  if (!supabase) return;
  await supabase.channel('job-command-fleet').send({
    type: 'broadcast',
    event: 'telemetry',
    payload: employee,
  });
}

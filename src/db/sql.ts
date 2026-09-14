export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'technician',
  phone text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  notes text,
  created_by_user_id text REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customers_name_idx ON customers (name);

CREATE TABLE IF NOT EXISTS jobs (
  id text PRIMARY KEY,
  job_number integer NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'queued',
  priority text NOT NULL DEFAULT 'medium',
  customer_id text NOT NULL REFERENCES customers(id),
  assigned_to_user_id text REFERENCES users(id),
  scheduled_at timestamptz,
  completed_at timestamptz,
  location text,
  created_by_user_id text REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status);
CREATE INDEX IF NOT EXISTS jobs_assignee_idx ON jobs (assigned_to_user_id);
CREATE INDEX IF NOT EXISTS jobs_customer_idx ON jobs (customer_id);

CREATE TABLE IF NOT EXISTS job_notes (
  id text PRIMARY KEY,
  job_id text NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  author_user_id text REFERENCES users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_events (
  id text PRIMARY KEY,
  job_id text NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  actor_user_id text REFERENCES users(id),
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_events_job_idx ON job_events (job_id);

CREATE TABLE IF NOT EXISTS job_assignments (
  id text PRIMARY KEY,
  job_id text NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_assignments_job_idx ON job_assignments (job_id);
CREATE INDEX IF NOT EXISTS job_assignments_user_idx ON job_assignments (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS job_assignments_job_user_idx ON job_assignments (job_id, user_id);

CREATE TABLE IF NOT EXISTS time_entries (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  job_id text REFERENCES jobs(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS time_entries_user_idx ON time_entries (user_id);
`;

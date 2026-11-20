CREATE TABLE IF NOT EXISTS scans (id text PRIMARY KEY, data jsonb NOT NULL, status text NOT NULL CHECK (status IN ('queued','running','complete','failed')), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS scans_created ON scans(created_at);
CREATE TABLE IF NOT EXISTS purchases (session_id text PRIMARY KEY, scan_id text NOT NULL REFERENCES scans(id), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY, count integer NOT NULL DEFAULT 1, expires_at timestamptz NOT NULL);

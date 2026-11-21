CREATE TABLE aiengg_eval_usage (
  id text PRIMARY KEY NOT NULL,
  calls integer DEFAULT 0 NOT NULL,
  minute integer DEFAULT 0 NOT NULL,
  minute_calls integer DEFAULT 0 NOT NULL
);

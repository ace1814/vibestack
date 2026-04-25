-- Run this in the Supabase SQL Editor for your vibestack project
-- Creates the course_signups table for the /course landing page

CREATE TABLE IF NOT EXISTS course_signups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  also_subscribe  BOOLEAN DEFAULT false,
  signed_up_at    TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE course_signups ENABLE ROW LEVEL SECURITY;
-- No public access policies — admin client (service role) only

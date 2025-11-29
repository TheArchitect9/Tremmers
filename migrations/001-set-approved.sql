-- Migration: set existing profiles to approved = true
-- Run this in Supabase SQL Editor to mark all existing profiles as approved

BEGIN;
UPDATE profiles
SET approved = true
WHERE approved IS DISTINCT FROM true;
COMMIT;

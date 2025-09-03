-- Migration: Add latest_completed_step column to users table
-- Date: September 3, 2025
-- Description: Adds a new integer column to track the latest completed onboarding step for users.

ALTER TABLE users
ADD COLUMN latest_completed_step INTEGER NOT NULL DEFAULT 0;

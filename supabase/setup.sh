#!/bin/bash
# HK Freelance Match - Supabase Setup Script
# Run this in your Supabase SQL Editor or via Supabase CLI

echo "Setting up HK Freelance Match database..."

# Read the migration file and execute
SQL_FILE="supabase/migrations/001_initial_schema.sql"

if [ -f "$SQL_FILE" ]; then
    echo "Migration file found: $SQL_FILE"
    echo "Please copy the contents and run in Supabase SQL Editor:"
    echo "1. Go to https://jskovcdvwfycwklfidje.supabase.co/project/sql"
    echo "2. Copy and paste the contents of $SQL_FILE"
    echo "3. Click Run"
else
    echo "Error: Migration file not found at $SQL_FILE"
fi

echo ""
echo "Alternatively, use Supabase CLI:"
echo "  supabase db push"
echo ""
echo "After setup, update your .env.local with:"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY from Settings > API"
echo "  - SUPABASE_SERVICE_ROLE_KEY from Settings > API (for server-side operations)"

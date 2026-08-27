import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://vgookzcygqfncyiwyuwg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnb29remN5Z3FmbmN5aXd5dXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MzQwMzAsImV4cCI6MjEwMzQxMDAzMH0.yi_tRPRiFMAAFrYK9nnX2msJMMqMluPKW4zCE0xlaqY'
)

export const isConfigured = true

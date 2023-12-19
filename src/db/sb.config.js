import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ltvavdcgdrfqhlfpgkks.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dmF2ZGNnZHJmcWhsZnBna2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA1NzEwMjUsImV4cCI6MjAwNjE0NzAyNX0.nAuA5lILpr3giK0fiurM0DprdD1JAf4xgam0laMGfRU";

export const supabase = createClient(supabaseUrl, supabaseKey);

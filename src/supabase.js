import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oqxosrxeuyybjjffwnoz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xeG9zcnhldXl5YmpqZmZ3bm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDU1NTUsImV4cCI6MjA5MDAyMTU1NX0.OazA8GqbD0j9BVpbTBc8-Mn51mlQz-xqkeTvr8Vjwss";

export const supabase = createClient(supabaseUrl, supabaseKey);

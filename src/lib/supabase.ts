import { createClient } from "@supabase/supabase-js";

const DATABASE_URL = process.env.DATABASE_URL; 
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase Credentials");
}

export default createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

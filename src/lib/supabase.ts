import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 客户端（当前 MVP 阶段使用 SQLite，此客户端备用）
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "documents";

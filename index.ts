// =====================================================================
// JOVI SYSTEM · Prestamos Pro — Edge Function: scheduled-backup
// Corre en el servidor (Deno), disparada automaticamente por un Cron Job
// de Supabase (ver SETUP.md, seccion de respaldo automatico).
// Guarda un JSON por empresa, por dia, en el bucket privado "backups".
// No requiere que nadie la llame manualmente.
// =====================================================================

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: companies, error: companiesError } = await admin.from("companies").select("id, name");
  if (companiesError) {
    return new Response(JSON.stringify({ error: companiesError.message }), { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const results: Record<string, string> = {};

  for (const company of companies || []) {
    const [clients, loans, payments, profiles] = await Promise.all([
      admin.from("clients").select("*").eq("company_id", company.id),
      admin.from("loans").select("*").eq("company_id", company.id),
      admin.from("payments").select("*").eq("company_id", company.id),
      admin.from("profiles").select("id, username, role").eq("company_id", company.id)
    ]);

    const snapshot = {
      company,
      generated_at: new Date().toISOString(),
      clients: clients.data || [],
      loans: loans.data || [],
      payments: payments.data || [],
      users: profiles.data || []
    };

    const path = `${company.id}/${today}.json`;
    const { error: uploadError } = await admin.storage
      .from("backups")
      .upload(path, JSON.stringify(snapshot, null, 2), {
        contentType: "application/json",
        upsert: true
      });

    results[company.name] = uploadError ? `error: ${uploadError.message}` : "ok";
  }

  return new Response(JSON.stringify({ date: today, results }), {
    headers: { "Content-Type": "application/json" }
  });
});

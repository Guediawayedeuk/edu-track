import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Body = {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: "teacher" | "parent" | "admin";
  // teacher
  subject?: string;
  // student handled separately; parent has no extra fields
};

function randPassword() {
  return Math.random().toString(36).slice(-10) + "A1!";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(url, service);
    const { data: hasAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!hasAdmin) {
      return new Response(JSON.stringify({ error: "Réservé aux administrateurs" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = (await req.json()) as Body;
    if (!body.email || !body.first_name || !body.last_name || !body.role) {
      return new Response(JSON.stringify({ error: "Champs requis manquants" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const password = body.password || randPassword();
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: body.email,
      password,
      email_confirm: true,
      user_metadata: { first_name: body.first_name, last_name: body.last_name },
    });
    if (createErr || !created.user) {
      return new Response(JSON.stringify({ error: createErr?.message || "Création échouée" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const newUserId = created.user.id;

    // role
    await admin.from("user_roles").insert({ user_id: newUserId, role: body.role });

    // teacher record
    if (body.role === "teacher") {
      await admin.from("teachers").insert({ user_id: newUserId, subject: body.subject || "Non assignée" });
    }

    return new Response(JSON.stringify({ user_id: newUserId, email: body.email, password }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

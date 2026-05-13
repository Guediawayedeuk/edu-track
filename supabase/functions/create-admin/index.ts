import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: "admin@edutrack.com",
      password: "Azerty10@",
      email_confirm: true,
      user_metadata: { first_name: "Admin", last_name: "EduTrack" },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const userId = data.user.id;

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ user_id: userId, first_name: "Admin", last_name: "EduTrack" });

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(
      JSON.stringify({ success: true, user_id: userId, message: "Admin account created successfully" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

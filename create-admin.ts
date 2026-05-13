import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://grbqpuqlltkcwpsubhui.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function createAdmin() {
  console.log("Creating admin user with service role...");
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: "admin@edutrack.com",
    password: "Azerty10@",
    email_confirm: true,
    user_metadata: { first_name: "Admin", last_name: "EduTrack" },
  });

  if (error) {
    console.error("Error creating user:", error.message);
    process.exit(1);
  }

  console.log("User created:", data.user.id);
  
  const { error: roleError } = await supabase
    .from("user_roles")
    .insert({ user_id: data.user.id, role: "admin" });
  
  if (roleError) {
    console.error("Error assigning role:", roleError.message);
    process.exit(1);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ 
      user_id: data.user.id, 
      first_name: "Admin", 
      last_name: "EduTrack" 
    });
  
  if (profileError) {
    console.error("Error creating profile:", profileError.message);
    process.exit(1);
  }

  console.log("Admin account created successfully!");
  console.log("Email: admin@edutrack.com");
  console.log("Password: Azerty10@");
}

createAdmin();

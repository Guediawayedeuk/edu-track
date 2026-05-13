import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://grbqpuqlltkcwpsubhui.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyYnFwdXFsbHRrY3dwc3ViaHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MzA5NzQsImV4cCI6MjA4ODAwNjk3NH0.odWXMv07KJJ249XKeR1GRz2xbJGqJruUkvcrz_tiVP8";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: new MemoryStorage(),
    persistSession: true,
    autoRefreshToken: true,
  }
});

async function createAdmin() {
  console.log("Creating admin user...");
  
  const { data, error } = await supabase.auth.signUp({
    email: "admin@edutrack.com",
    password: "Azerty10@",
    options: {
      data: { first_name: "Admin", last_name: "EduTrack" },
    },
  });

  if (error) {
    console.error("Error creating user:", error.message);
    process.exit(1);
  }

  console.log("User created:", data.user?.id);
  
  if (data.user) {
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: data.user.id, role: "admin" });
    
    if (roleError) {
      console.error("Error assigning role:", roleError.message);
      process.exit(1);
    } else {
      console.log("Admin role assigned successfully!");
    }
  }
}

createAdmin();

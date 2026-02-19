import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/process.ts"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

serve(async (req) => {
  try {
    const { record } = await req.json()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all SuperAdmins
    const { data: superAdmins } = await supabase.from("profiles").select("email, full_name").eq("role", "superadmin")

    // Send email to each SuperAdmin
    // Note: You'll need to configure email service (Resend, SendGrid, etc.)
    for (const admin of superAdmins || []) {
      console.log(`Sending notification to ${admin.email} about new user: ${record.email}`)
      // TODO: Implement actual email sending
    }

    return new Response(JSON.stringify({ message: "Notifications sent" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

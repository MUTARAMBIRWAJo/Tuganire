import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/_util/deps.ts" // Declare Deno variable

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

serve(async (req) => {
  try {
    const { record } = await req.json()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get article author info
    const { data: author } = await supabase.from("profiles").select("full_name").eq("id", record.author_id).single()

    // Get all Admins and SuperAdmins
    const { data: admins } = await supabase
      .from("profiles")
      .select("email, full_name")
      .in("role", ["admin", "superadmin"])

    // Send email to each admin
    for (const admin of admins || []) {
      console.log(`Notifying ${admin.email}: ${author?.full_name} submitted "${record.title}"`)
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


import { redirect } from "next/navigation";
import InviteForm from "./InviteForm.jsx";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError || !data) {
    redirect("/login");
  }

  let assistant = null;
  if (data.assistant_id) {
    const { data: assistantData, error: assistantError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.assistant_id)
      .single();

    if (!assistantError && assistantData) {
      assistant = assistantData;
    }
  }

  const userRole = data.role || null;
  const userId = user.id;

  return (
    <InviteForm
      userRole={userRole}
      userId={userId}
      assistant={assistant}
    />
  );
}
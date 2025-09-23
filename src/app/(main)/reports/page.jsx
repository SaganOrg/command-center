import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ReportsClient from "./ReportsClient";
import { format } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function Reports() {
  
  const supabase = await createSupabaseServerClient()

  // Fetch user and role
  let userRole = null;
  let userId = null;
  let executiveId = null;
  let reportData = null;
  let reportDates = new Set();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  userId = user.id;
  const { data: publicUser, error: publicError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (publicError) {

    redirect("/login");
  }

  userRole = publicUser.role || null;
  executiveId = publicUser.executive_id || null;

  // Fetch today's report for assistants
  if (userRole === "assistant") {
    const today = format(new Date(), "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("date", today)
      .eq("assistant_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
  
    } else if (data) {
      reportData = data;
    }

    // Fetch report dates
    const { data: datesData, error: datesError } = await supabase
      .from("reports")
      .select("date")
      .eq("assistant_id", userId);

    if (datesError) {
     
    } else {
      reportDates = new Set(datesData.map((r) => r.date));
    }
  }

  // Fetch reports for executives
  let reports = [];
  if (userRole === "executive") {
    let query = supabase
      .from("reports")
      .select("*")
      .eq("executive_id", userId);

    if (executiveId) {
      query = query.or(`executive_id.eq.${executiveId}`);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
    
    } else {
      reports = data || [];
    }
  }

  return (
    <ReportsClient
      userRole={userRole}
      userId={userId}
      executiveId={executiveId}
      initialReportData={reportData}
      initialReportDates={Array.from(reportDates)}
      initialReports={reports}
    />
  );
}
'use server';

const { createServerClient } = require('@supabase/ssr');
const { cookies } = require('next/headers');

// Initialize Supabase client
const createSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
};

// Check if a report exists for a given date and assistant_id
async function checkExistingReport(date, assistantId) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('date', date)
    .eq('assistant_id', assistantId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check existing report: ${error.message}`);
  }

  return data || null;
}

// Submit or update a report
async function submitReport(reportData, assistantId, executiveId, isUpdate) {
  const supabase = createSupabaseClient();

  const reportPayload = {
    date: reportData.date,
    assistant_id: assistantId,
    executive_id: executiveId,
    completed_task: reportData.completedTasks,
    outstanding_task: reportData.outstandingTasks,
    need_from_manager: reportData.needFromManager,
    tomorrows_plan: reportData.tomorrowPlans,
    business_level: parseInt(reportData.busynessLevel),
  };

  if (isUpdate) {
    const { data, error } = await supabase
      .from('reports')
      .update({
        ...reportPayload,
        updated_at: new Date().toISOString(),
      })
      .eq('date', reportData.date)
      .eq('assistant_id', assistantId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update report: ${error.message}`);
    }

    return data;
  } else {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...reportPayload,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit report: ${error.message}`);
    }

    return data;
  }
}

// Fetch report history for an executive
async function fetchReportHistory(executiveId) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('executive_id', executiveId);

  if (error) {
    throw new Error(`Failed to fetch report history: ${error.message}`);
  }

  return data || [];
}

export {
  checkExistingReport,
  submitReport,
  fetchReportHistory,
};
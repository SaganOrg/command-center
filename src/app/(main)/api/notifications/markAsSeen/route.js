import { createBrowserClient } from "@supabase/ssr";

// Initialize Supabase client



export async function POST(req) {

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
  const { notificationId, userId } = await req.json();
  console.log('Notification ID:', notificationId);



  const { error } = await supabase
    .from('notifications')
    .update({ seen: true })
    .eq('id', notificationId)
    .eq('recipient_id', userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}


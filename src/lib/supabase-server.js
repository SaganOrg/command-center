// import { createServerClient } from '@supabase/ssr';
// import { NextRequest, NextResponse } from 'next/server';

// export function createSupabaseServerClient(request) {
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//     {
//       cookies: {
//         get(name) {
//           return request.cookies.get(name)?.value;
//         },
//         set(name, value, options) {
//           // Note: Middleware can't directly set cookies in the response
//           // Handle cookie setting in API routes or pages
//         },
//         remove(name, options) {
//           // Note: Middleware can't directly delete cookies in the response
//         },
//       },
//     }
//   );
// }
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const { company, entity_code, order_status,order_type } = await request.json();

  const { data, error } = await supabase
    .schema("dba")
    .from("inventory_header")
    .select("order_ref,commodity,partner_name, warehouse_code")
    .eq("company", company)
    .eq("entity_code", entity_code)
    .eq("order_status", order_status)
    .eq("order_type", order_type)

  if (data?.length > 0) {
    return NextResponse.json({ data });
  } else {
    return NextResponse.json({
      data: [
    {
      "order_ref": "null"
    }
  ],
      message: "No matching data found for the given filters.",
    });
  }
}

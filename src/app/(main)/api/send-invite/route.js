import { NextResponse } from "next/server";
import { createBrowserClient } from "@supabase/ssr";

// Initialize Supabase client
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


export async function POST(request) {
  try {
    // Parse the request body
    const { email, userId } = await request.json();

    // Validate UUIDs
    const isValidUuid = (str) => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    if (!userId || !isValidUuid(userId)) {
      return NextResponse.json(
        { error: "userId is not valid" },
        { status: 400 }
      );
      }

      const isValidEmail = (str) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(str);
      };

      if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email is not valid" },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { error: userError.message },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const { data: userFound, error: userFoundError } = await supabase
      .from("users")
      .select("*")
      .ilike("email", normalizedEmail);

      if (userFoundError) {
          return NextResponse.json(
              { error: userError.message },
              { status: 400 }
          );
      }

    if (userFound.length > 0) {
      return NextResponse.json(
        { error: `Email already registered as ${userFound[0].role}` },
        { status: 400 }
      );
      }
      
      // Prepare email data for Brevo
    const apiKey = process.env.BREVO_API_KEY;
    const signupLink = `https://commandcenter.getsagan.com/assistant-signup/${userId}/${email}`;

    // const signupLink = `https://commandcenter.getsagan.com/assistant-signup/${email}`;

    const emailData = {
      sender: {
        name: "Command Center Team",
        email: "success@cc.getsagan.com",
        // email: "admin@aqza.com"
      },
      to: [{ email, name: "Sagan" }],
      subject: "Your Invitation to Join the Command Center",
      htmlContent: `
     <h1>Welcome to the Command Center</h1>
<p>Hi,</p>
<p>We’re excited to invite you to join the Command Center as an Executive Assistant.</p>
<p>Please use the link below to set up your account:</p>
<p><a href="${signupLink}" target="_blank">Set Up Your Account</a></p>
<p>We look forward to working with you!</p>
<p>Best,<br>Your Team at Command Center</p>
      `,
    };

    // Send email via Brevo
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(emailData),
    });
      


    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: `Failed to send email: ${errorData.message || response.statusText}` },
        { status: 400 }
      );
      }

    return NextResponse.json(
      { message: 'Invitation sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    // console.error('Error deleting task:', error);÷\
    return NextResponse.json(
      { error: `Failed to send invitation., ${error}` },
      { status: 400 }
    );
  }
}
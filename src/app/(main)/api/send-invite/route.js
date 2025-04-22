import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
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
    const apiKey = process.env.NEXT_PUBLIC_BREVO_API_KEY;
    const signupLink = `https://commandcenter.getsagan.com/assistant-signup/${userId}/${email}`;

    const emailData = {
      sender: {
        name: "Sagan",
        email: "jon@getsagan.com",
      },
      to: [{ email, name: "Recipient Name" }],
      subject: "You’ve Been Invited to Join the Command Center",
      htmlContent: `
        <p>Hi,</p>
        <p>You have been invited to join the Command Center as an Executive Assistant.</p>
        <p>Click the link below to create your account and get started:</p>
        <p><a href="${signupLink}">${signupLink}</a></p>
        <p>Looking forward to having you on board.</p>
        <p>Best regards,<br>Your Team</p>
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
      
    console.log("Brevo Response Status:", response.status);
    const responseBody = await response.json();
    console.log("Brevo Response Body:", responseBody);

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
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation.' },
      { status: 400 }
    );
  }
}
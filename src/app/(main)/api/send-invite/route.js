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
      
      // Prepare email data for n8n webhook
    const signupLink = `https://commandcenter.getsagan.com/assistant-signup/${userId}/${email}`;

    const message = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Email</title>\n</head>\n<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">\n  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">\n    <tr>\n      <td align="center">\n        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">\n          <tr>\n            <td style="padding: 40px;">\n              <h1>Welcome to the Command Center</h1>\n              <p>Hi,</p>\n              <p>We're excited to invite you to join the Command Center as an Executive Assistant.</p>\n              <p>Please use the link below to set up your account:</p>\n              <p><a href="${signupLink}" target="_blank">Set Up Your Account</a></p>\n              <p>We look forward to working with you!</p>\n              <p>Best,<br>Your Team at Command Center</p>\n            </td>\n          </tr>\n        </table>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>`;

    const webhookData = {
      from: "success@ss.getsagan.com",
      to: email,
      subject: "Your Invitation to Join the Command Center",
      message: message,
      cc: "",
      webhookUrl: "https://saganworld.app.n8n.cloud/webhook/3ac0779f-591a-458f-8290-3d7a8f0bf123"
    };

    // Send email via n8n webhook
    const response = await fetch("https://saganworld.app.n8n.cloud/webhook/3ac0779f-591a-458f-8290-3d7a8f0bf123", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
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
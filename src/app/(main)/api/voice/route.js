// app/api/transcribe-and-task/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { createBrowserClient } from "@supabase/ssr";

// Initialize Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const id = formData.get("userId");
    
    const isValidUuid = (str) => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    if (!id || !isValidUuid(id)) {
      return NextResponse.json(
          { error: "userId is not valid" },
          { status: 400 }
        );
    }

    // Fetch user role from public users table
    const { data: publicUser, error: publicUserError } = await supabase
      .from("users")
      .select("role, assistant_id")
      .eq("id", id)
      .single();
    if (publicUserError) {
      return NextResponse.json(
        { error: publicUserError.message },
        { status: 500 }
      );
    }

    // Check role and assistant_id
    if (publicUser.role !== "executive") {
      return NextResponse.json(
        { error: "Voice recording is only available for executives." },
        { status: 403 }
      );
    }
    if (publicUser.assistant_id === null) {
      return NextResponse.json(
        {
          error:
            "Please add assistant first. Redirecting to settings page ...",
        },
        { status: 400 }
      );
    }

    // Get the audio file from the request (multipart/form-data)
    const audioBlob = formData.get("audio");
    if (!audioBlob) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert Blob to File for OpenAI
    const audioFile = new File([audioBlob], "recording.webm", {
      type: "audio/webm",
    });

    // Transcribe audio with OpenAI Whisper
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });
    const transcribedText = transcriptionResponse.text;

    // Generate title with OpenAI GPT-3.5
    const titleResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates concise task titles based on provided text.",
        },
        {
          role: "user",
          content: `In Five Words or Less, Generate a Title for this Task based on this transcription: ${transcribedText}`,
        },
      ],
      max_tokens: 10,
    });
    const generatedTitle = titleResponse.choices[0].message.content.trim();

    // Insert task into Supabase
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: generatedTitle,
        task: transcribedText,
        created_at: new Date().toISOString(),
        created_by: id,
        assigned_to: publicUser.assistant_id,
        status: "inbox",
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        task: data,
        transcription: transcribedText,
        title: generatedTitle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in transcribe-and-task API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process audio and create task" },
      { status: 500 }
    );
  }
}
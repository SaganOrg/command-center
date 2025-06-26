import { NextResponse } from "next/server";
import { createBrowserClient } from "@supabase/ssr";

// Initialize Supabase client
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Function to update candidate embeddings
async function updateCandidateEmbeddings(request) {
    try {
        // Parse incoming request for executive_id and assistant_id
        const { executive_id, assistant_id } = await request.json();

        // UUID validation function
        const isValidUuid = (str) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(str);
        };

        // Validate UUIDs
        if (!executive_id || !assistant_id || !isValidUuid(executive_id) || !isValidUuid(assistant_id)) {
            return NextResponse.json(
                { error: "Invalid or missing executive_id or assistant_id" },
                { status: 400 }
            );
        }

        // Fetch user data from users table
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', executive_id)
            .single();

        // Check for user fetch errors
        if (userError || !user) {
            return NextResponse.json(
                { error: userError?.message || "User not found" },
                { status: 400 }
            );
        }

        // Update assistant_id to null in users table
        const { error: userUpdateError } = await supabase
            .from('users')
            .update({ assistant_id: null })
            .eq('id', executive_id);

        if (userUpdateError) {
            return NextResponse.json(
                { error: userUpdateError.message },
                { status: 500 }
            );
        }

        // Update tasks table: set assigned_to to null where created_by matches executive_id
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .update({ assigned_to: null })
            .eq('created_by', executive_id);

        if (tasksError) {
            return NextResponse.json(
                { error: tasksError.message },
                { status: 500 }
            );
        }

        // Update reports table: set assistant_id to null where created_by matches executive_id
        const { data: reports, error: reportsError } = await supabase
            .from('reports')
            .update({ assistant_id: null })
            .eq('executive_id', executive_id);

        if (reportsError) {
            return NextResponse.json(
                { error: reportsError.message },
                { status: 500 }
            );
        }

        // Return success response
        return NextResponse.json(
            { message: "Assistant ID successfully removed from users, tasks, and reports" },
            { status: 200 }
        );
    } catch (error) {
        // Catch any unexpected errors
        return NextResponse.json(
            { error: "Internal server error: " + error.message },
            { status: 500 }
        );
    }
}

// Next.js API route handler
export async function POST(request) {
    try {
        const response = await updateCandidateEmbeddings(request);
        if (!response) {
            return NextResponse.json(
                { error: "No response from updateCandidateEmbeddings" },
                { status: 500 }
            );
        }
        return response;
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error in POST handler: " + error.message },
            { status: 500 }
        );
    }
}
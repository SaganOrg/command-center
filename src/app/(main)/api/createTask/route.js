// app/api/tasks/route.js
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { createBrowserClient } from "@supabase/ssr";

// Initialize Supabase client (ensure environment variables are set)
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Use service role key for server-side
);

export async function POST(request) {
  try {
    // Parse the request body
      const newTask = await request.json();
      const id = newTask.userId;
      
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
      .from('users')
      .select('*')
      .eq('id', id);
    if (publicUserError) {
      return NextResponse.json(
        { error: publicUserError.message },
        { status: 400 }
      );
    }

    let taskToAdd;
    if (publicUser[0].role === 'executive') {
      if (publicUser[0].assistant_id === null) {
        return NextResponse.json(
          {
            error: 'Please create assistant first. Redirecting to settings page....',
          },
          { status: 400 }
        );
      }
      taskToAdd = {
        title: newTask.title || 'Untitled Project',
        task: newTask.task || '',
        status: newTask.status || 'todo', // Default status, adjust as needed
        labels: '',
        attachments: '',
        created_by: id,
        assigned_to: publicUser[0]?.assistant_id || null,
        due_date: newTask.due_date || format(new Date(), 'yyyy-MM-dd'),
        purpose: newTask.purpose || '',
        end_result: newTask.end_result || '',
      };
    } else if (publicUser[0].role === 'assistant') {
      taskToAdd = {
        title: newTask.title || 'Untitled Project',
        task: newTask.task || '',
        status: newTask.status || 'todo', // Default status, adjust as needed
        labels: '',
        attachments: '',
        created_by: publicUser[0].executive_id,
        assigned_to: id,
        due_date: newTask.due_date || format(new Date(), 'yyyy-MM-dd'),
        purpose: newTask.purpose || '',
        end_result: newTask.end_result || '',
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 403 }
      );
    }

    // Insert task into Supabase
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskToAdd])
      .select();
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { task: data[0] },
      { status: 201 }
    );
  } catch (error) {
    // console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 400 }
    );
  }
}
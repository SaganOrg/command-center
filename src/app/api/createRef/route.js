import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Initialize Supabase client (ensure environment variables are set)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Use service role key for server-side
);

export async function POST(request) {
  try {
    // Parse the request body
    const newTask = await request.json();
    const id = newTask.userId;
    const tags = newTask.tags || []; // Array of tag IDs
    const images = newTask.images || []; // Array of image URLs
    
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
        title: newTask.title || 'Untitled',
        description: newTask.description || '',
        content: newTask.content || '',
        type: 'text',
        executive_id: id,
        assistant_id: publicUser[0].assistant_id,
      };
    } else if (publicUser[0].role === 'assistant') {
      taskToAdd = {
        title: newTask.title || 'Untitled',
        description: newTask.description || '',
        content: newTask.content || '',
        type: 'text',
        executive_id: publicUser[0].executive_id,
        assistant_id: id,
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 403 }
      );
    }

    // Insert task into Supabase reference-attachments
    const { data: taskData, error: taskError } = await supabase
      .from('reference_items')
      .insert([taskToAdd])
      .select();
    if (taskError) {
      return NextResponse.json(
        { error: taskError.message },
        { status: 400 }
      );
    }

    const refId = taskData[0].id; // Assuming the table returns an 'id' field

    // Insert tags into reference-tags table
    if (tags.length > 0) {
     
      const tagInserts = tags.map(tagId => ({
        reference_item_id: refId,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('reference_item_tags')
        .insert(tagInserts);
        
      if (tagError) {
        return NextResponse.json(
          { error: `Failed to insert tags: ${tagError.message}` },
          { status: 400 }
        );
      }
    }

    // Insert images into reference-images table
    if (images.length > 0) {
      const imageInserts = images.map(imageUrl => ({
        reference_item_id: refId,
        url: imageUrl
      }));
      
      const { error: imageError } = await supabase
        .from('attachments')
        .insert(imageInserts);
        
      if (imageError) {
        return NextResponse.json(
          { error: `Failed to insert images: ${imageError.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { task: taskData[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 400 }
    );
  }
}
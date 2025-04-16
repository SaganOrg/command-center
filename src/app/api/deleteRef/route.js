import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Utility function to extract file path from Supabase Storage URL
const getStorageFilePath = (url) => {
  try {
    // Example URL: https://your-supabase-project.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
    const urlParts = new URL(url);
    // Extract path after '/object/public/bucket-name/'
    const path = urlParts.pathname.split('/').slice(4).join('/');
    return path;
  } catch (error) {
    console.error('Error parsing URL:', url, error);
    return null;
  }
};


export async function POST(request) {
  try {
    // Parse the request body
    const { userId, taskId } = await request.json();

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

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is not valid" },
        { status: 400 }
      );
    }

    // Fetch user role from public users table
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    if (publicUserError) {
      return NextResponse.json(
        { error: publicUserError.message },
        { status: 400 }
      );
    }

    // Validate user role
    if (!['executive', 'assistant'].includes(publicUser[0].role)) {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 403 }
      );
    }

    if (publicUser[0].role === 'executive' && publicUser[0].assistant_id === null) {
      return NextResponse.json(
        { error: 'Please create assistant first.' },
        { status: 400 }
      );
    }

    // Verify task exists and belongs to the user
    const { data: taskData, error: taskFetchError } = await supabase
      .from('reference_items')
      .select('*')
      .eq('id', taskId);
    if (taskFetchError || !taskData.length) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    // Fetch all attachments for the task to delete from Storage
    const { data: attachments, error: attachmentsError } = await supabase
      .from('attachments')
      .select('url')
      .eq('reference_item_id', taskId);
    if (attachmentsError) {
      return NextResponse.json(
        { error: `Failed to fetch attachments: ${attachmentsError.message}` },
        { status: 400 }
      );
    }

    // Delete attachments from Supabase Storage
    if (attachments.length > 0) {
      const bucketName = 'reference-attachments'; // Replace with your actual bucket name
      const filePaths = attachments
        .map(attachment => getStorageFilePath(attachment.url))
        .filter(path => path !== null);

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase
          .storage
          .from(bucketName)
          .remove(filePaths);
        if (storageError) {
          console.error('Storage deletion error:', storageError);
          return NextResponse.json(
            { error: `Failed to delete files from storage: ${storageError.message}` },
            { status: 400 }
          );
        }
      }

      // Delete attachments from the attachments table
      const { error: deleteAttachmentsError } = await supabase
        .from('attachments')
        .delete()
        .eq('reference_item_id', taskId);
      if (deleteAttachmentsError) {
        return NextResponse.json(
          { error: `Failed to delete attachments: ${deleteAttachmentsError.message}` },
          { status: 400 }
        );
      }
    }

    // Delete all reference tags
    const { error: deleteTagsError } = await supabase
      .from('reference_item_tags')
      .delete()
      .eq('reference_item_id', taskId);
    if (deleteTagsError) {
      return NextResponse.json(
        { error: `Failed to delete tags: ${deleteTagsError.message}` },
        { status: 400 }
      );
    }

    // Delete the reference from reference_items
    const { error: deleteTaskError } = await supabase
      .from('reference_items')
      .delete()
      .eq('id', taskId);
    if (deleteTaskError) {
      return NextResponse.json(
        { error: `Failed to delete task: ${deleteTaskError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Task and associated data deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 400 }
    );
  }
}
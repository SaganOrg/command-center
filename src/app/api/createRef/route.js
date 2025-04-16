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

    // Insert task into Supabase reference_items
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

    const refId = taskData[0]?.id;

    // Insert tags into reference_item_tags table
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

    // Insert images into attachments table
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
      { task: taskData[0], tags: tags, images: images },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create ref' },
      { status: 400 }
    );
  }
}

export async function PATCH(request) {
  try {
    // Parse the request body
    const updateData = await request.json();
    const { userId, taskId, title, description, content, newTags = [], existingTags = [], deletedTags = [], newImages = [], existingImages = [], deletedImages = [] } = updateData;

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
      .eq('id', taskId)
      // .in('executive_id', [userId, publicUser[0].executive_id].filter(Boolean));
    if (taskFetchError || !taskData.length) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    // Prepare task update
    const taskUpdate = {
      title: title || taskData[0].title,
      description: description || taskData[0].description,
      content: content || taskData[0].content,
      updated_at: new Date().toISOString(),
    };

    // Update task in reference_items
    const { data: updatedTask, error: taskUpdateError } = await supabase
      .from('reference_items')
      .update(taskUpdate)
      .eq('id', taskId)
      .select();
    if (taskUpdateError) {
      return NextResponse.json(
        { error: taskUpdateError.message },
        { status: 400 }
      );
    }

    // Handle tags
    // Remove deleted tags
    if (deletedTags.length > 0) {
      const { error: deleteTagError } = await supabase
        .from('reference_item_tags')
        .delete()
        .eq('reference_item_id', taskId)
        .in('tag_id', deletedTags);
      if (deleteTagError) {
        return NextResponse.json(
          { error: `Failed to delete tags: ${deleteTagError.message}` },
          { status: 400 }
        );
      }
    }

    // Add new tags
    if (newTags.length > 0) {
      const tagInserts = newTags.map(tagId => ({
        reference_item_id: taskId,
        tag_id: tagId
      }));
      const { error: tagInsertError } = await supabase
        .from('reference_item_tags')
        .insert(tagInserts);
      if (tagInsertError) {
        return NextResponse.json(
          { error: `Failed to insert tags: ${tagInsertError.message}` },
          { status: 400 }
        );
      }
    }

    // Existing tags are retained (no action needed)

    // Handle images
    // Remove deleted images
    if (deletedImages.length > 0) {
      const { error: deleteImageError } = await supabase
        .from('attachments')
        .delete()
        .eq('reference_item_id', taskId)
        .in('url', deletedImages);
      if (deleteImageError) {
        return NextResponse.json(
          { error: `Failed to delete images: ${deleteImageError.message}` },
          { status: 400 }
        );
      }
    }

    // Add new images
    if (newImages.length > 0) {
      const imageInserts = newImages.map(imageUrl => ({
        reference_item_id: taskId,
        url: imageUrl
      }));
      const { error: imageInsertError } = await supabase
        .from('attachments')
        .insert(imageInserts);
      if (imageInsertError) {
        return NextResponse.json(
          { error: `Failed to insert images: ${imageInsertError.message}` },
          { status: 400 }
        );
      }
    }

    // Existing images are retained (no action needed)

    // Fetch updated tags and images for response
    const { data: updatedTags, error: tagsFetchError } = await supabase
      .from('reference_item_tags')
      .select('tag_id')
      .eq('reference_item_id', taskId);
    if (tagsFetchError) {
      return NextResponse.json(
        { error: `Failed to fetch tags: ${tagsFetchError.message}` },
        { status: 400 }
      );
    }

    const { data: updatedImages, error: imagesFetchError } = await supabase
      .from('attachments')
      .select('url')
      .eq('reference_item_id', taskId);
    if (imagesFetchError) {
      return NextResponse.json(
        { error: `Failed to fetch images: ${imagesFetchError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        task: updatedTask[0],
        tags: updatedTags.map(tag => tag.tag_id),
        images: updatedImages.map(image => image.url)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task', },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
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
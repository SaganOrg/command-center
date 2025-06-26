'use server';

const { createServerClient } = require('@supabase/ssr');
const { cookies } = require('next/headers');

// Initialize Supabase client
const createSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore setAll errors in Server Components
          }
        },
      },
    }
  );
}

// Update task status
async function updateTaskStatus(taskId, newStatus) {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId);

  if (error) {
    throw new Error(error.message || 'Failed to update task status');
  }
}

// Reorder tasks
async function reorderTasks(updatedTasks) {
  const supabase = createSupabaseClient();
  const { error } = await Promise.all(
    updatedTasks.map((task) =>
      supabase.from('tasks').update({ order: task.order }).eq('id', task.id)
    )
  );

  if (error) {
    throw new Error(error.message || 'Failed to reorder tasks');
  }
}

// Save (update) task
async function saveTask(updatedTask) {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('tasks')
    .update({
      title: updatedTask.title || 'Untitled',
      task: updatedTask.task || '',
      status: updatedTask.status || 'inbox',
      labels: updatedTask.labels || '',
      attachments: updatedTask.attachments || '',
      due_date: updatedTask.due_date,
      purpose: updatedTask.purpose || '',
      end_result: updatedTask.end_result || '',
    })
    .eq('id', updatedTask.id);

  if (error) {
    throw new Error(error.message || 'Failed to save task');
  }

  return updatedTask;
}

// Delete task
async function deleteTask(taskId) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);

  if (error) {
    throw new Error(error.message || 'Failed to delete task');
  }
}

// Create task
// async function createTask(newTask, userId) {
//   const supabase = createSupabaseClient();
//   const { data: userData, error: userError } = await supabase
//     .from('users')
//     .select('assistant_id')
//     .eq('id', userId)
//     .single();

//   if (userError || !userData) {
//     throw new Error('Failed to fetch user data');
//   }

//   if (!userData.assistant_id) {
//     throw new Error(
//       'Please create assistant first. Redirecting to settings page....'
//     );
//   }

//   const taskWithDefaults = {
//     ...newTask,
//     user_id: userId,
//     title: newTask.title || 'Untitled',
//     status: newTask.status || 'inbox',
//     labels: newTask.labels || '',
//     attachments: newTask.attachments || '',
//     purpose: newTask.purpose || '',
//     end_result: newTask.end_result || '',
//   };

//   const { data, error } = await supabase
//     .from('tasks')
//     .insert([taskWithDefaults])
//     .select()
//     .single();

//   if (error) {
//     throw new Error(error.message || 'Failed to create task');
//   }

//   return data;
// }

// Add comment
async function addComment(taskId, comment) {
  const supabase = createSupabaseClient();
  const { data:user, error: userError } = await supabase.auth.getUser();
  // console.log(user);
  if (userError || !user) {
    throw new Error(userError?.message || 'Failed to authenticate user');
  }

  const { data: publicUser, error: publicError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.user.id)
    .single();
  if (publicError) {
    throw new Error(publicError.message || 'Failed to fetch user data');
  }
  console.log(user.user.id);
  const newComment = {
    task_id: taskId,
    user_id: publicUser.id,
    content: comment.content || '',
    author_name: publicUser.full_name || publicUser.role,
  };

  const { data, error } = await supabase
    .from('comments')
    .insert([newComment])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to add comment');
  }

  return data;
}

// Edit comment
async function editComment(commentId, updatedComment) {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('comments')
    .update({
      content: updatedComment.content || '',
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId);

  if (error) {
    throw new Error(error.message || 'Failed to edit comment');
  }

  return { ...updatedComment, id: commentId };
}

// Delete comment
async function deleteComment(commentId) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from('comments').delete().eq('id', commentId);

  if (error) {
    throw new Error(error.message || 'Failed to delete comment');
  }
}

async function createNotification({ recipient_id, sender_id, title, message }) {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('notifications')
    .insert([{ recipient_id, sender_id, title, message }]);
  if (error) throw new Error(error.message || 'Failed to create notification');
}



export{
  updateTaskStatus,
  reorderTasks,
  saveTask,
  deleteTask,
//   createTask,
  addComment,
  editComment,
  deleteComment,
  createNotification
};
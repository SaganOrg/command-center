'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ListChecks,
  Plus,
  Clock,
  ClipboardList,
  Timer,
  FileText,
  Archive,
  Inbox,
  Kanban,
  Grid,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TaskColumn from '@/components/projects/TaskColumn';
import TaskForm from '@/components/projects/TaskForm';
import TaskEditDialog from '@/components/projects/TaskEditDialog';
import ColumnCarousel from '@/components/projects/ColumnCarousel';
import ProjectsGrid from '@/components/projects/ProjectsGrid';
import { useRouter } from 'next/navigation';
import {
  updateTaskStatus,
  reorderTasks,
  saveTask,
  deleteTask,
  createTask,
  addComment,
  editComment,
  deleteComment,
} from './projects-actions';
import { createBrowserClient } from '@supabase/ssr';

export default function ProjectsClient({
  userRole,
  userId,
  tasks: initialTasks,
  comments: initialComments,
  users,
}) {

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [tasks, setTasks] = useState(initialTasks);
  const [comments, setComments] = useState(initialComments);
  const [columns] = useState([
    { id: 'inbox', title: 'Inbox' },
    { id: 'confirmedreceived', title: 'Confirmed Received' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'waiting', title: 'Waiting' },
    { id: 'review', title: 'Review' },
    { id: 'archive', title: 'Archive' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState('inbox');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [activeView, setActiveView] = useState('kanban');
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Handle drag-and-drop events
    const handleGlobalDragStart = (e) => {
      const taskId = e.dataTransfer?.getData('taskId');
      if (taskId) setDraggedTaskId(taskId);
    };
    const handleGlobalDragEnd = () => setDraggedTaskId(null);

    document.addEventListener('dragstart', handleGlobalDragStart);
    document.addEventListener('dragend', handleGlobalDragEnd);

    // Set up Supabase real-time subscription for tasks
    const channel = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          const updatedTask = payload.new;
          setTasks((prev) =>
            prev.map((task) =>
              task.id === updatedTask.id ? { ...task, ...updatedTask } : task
            )
          );
          setRefreshKey((prev) => prev + 1); // Force re-render of ColumnCarousel
        }
      )
      .subscribe();

    return () => {
      document.removeEventListener('dragstart', handleGlobalDragStart);
      document.removeEventListener('dragend', handleGlobalDragEnd);
      supabase.removeChannel(channel);
    };
  }, []);

  const getTasksByStatus = (status) =>
    tasks.filter((task) => task.status === status);
  const getCommentsByTaskId = (taskId) =>
    comments.filter((comment) => comment.task_id === taskId);

  const handleDrop = async (taskId, newStatus) => {
    try {
      setIsLoading(true);
      await updateTaskStatus(taskId, newStatus);

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      setRefreshKey((prev) => prev + 1); // Force re-render of ColumnCarousel
      const columnTitle =
        columns.find((col) => col.id === newStatus)?.title || newStatus;
      toast({
        title: 'Project moved',
        description: `Project moved to ${columnTitle}.`,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to move project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setDraggedTaskId(null);
    }
  };

  const handleReorderTasks = async (draggedTaskId, targetIndex, status) => {
    if (!draggedTaskId) return;
    const statusTasks = [...getTasksByStatus(status)];
    const draggedTaskIndex = statusTasks.findIndex(
      (task) => task.id === draggedTaskId
    );
    if (draggedTaskIndex === -1) return;

    const draggedTask = statusTasks[draggedTaskIndex];
    statusTasks.splice(draggedTaskIndex, 1);
    statusTasks.splice(targetIndex, 0, draggedTask);

    const updatedTasks = statusTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    try {
      setIsLoading(true);
      await reorderTasks(updatedTasks);

      setTasks((prev) => {
        const otherTasks = prev.filter((task) => task.status !== status);
        return [...otherTasks, ...updatedTasks].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
      });
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder tasks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setDraggedTaskId(null);
    }
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.types.includes('taskId')) {
      const taskId = e.dataTransfer.getData('taskId');
      if (taskId && draggedTaskId !== taskId) setDraggedTaskId(taskId);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = async (updatedTask) => {
    try {
      setIsLoading(true);
      const savedTask = await saveTask(updatedTask);

      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? savedTask : t))
      );
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(savedTask);
      }
      setIsTaskDialogOpen(false);
      toast({
        title: 'Project updated',
        description: 'Your project has been saved.',
      });
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setIsLoading(true);
      await deleteTask(taskId);

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setComments((prev) =>
        prev.filter((comment) => comment.task_id !== taskId)
      );
      setIsTaskDialogOpen(false);
      toast({
        title: 'Project deleted',
        description: 'Project has been removed.',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = (status) => {
    setNewTaskStatus(status);
    setIsNewTaskDialogOpen(true);
  };

  const handleCreateTask = async (newTask) => {
    try {
      setIsLoading(true);
      const taskWithUserId = {
        ...newTask,
        userId,
      };

      const response = await fetch('/api/createTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskWithUserId),
      });

      const result = await response.json();

      if (!response.ok) {
        if (
          result.error ===
          'Please create assistant first. Redirecting to settings page....'
        ) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          });
          setIsNewTaskDialogOpen(false);
          router.push('/settings');
          return;
        }
        throw new Error(result.error || 'Failed to create project');
      }

      setTasks((prev) => [...prev, result.task]);
      setIsNewTaskDialogOpen(false);
      toast({
        title: 'Project created',
        description: 'Your new project has been created.',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (taskId, comment) => {
    try {
      setIsLoading(true);
      const newComment = await addComment(taskId, comment, userId);

      setComments((prev) => [...prev, newComment]);
      toast({
        title: 'Comment added',
        description: 'Your comment has been added.',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (taskId, commentId, updatedComment) => {
    try {
      setIsLoading(true);
      const editedComment = await editComment(commentId, updatedComment);

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, ...editedComment } : comment
        )
      );
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated.',
      });
    } catch (error) {
      console.error('Error editing comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to edit comment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (taskId, commentId) => {
    try {
      setIsLoading(true);
      await deleteComment(commentId);

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been removed.',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditColumnTitle = (id, newTitle) => {
    toast({
      title: 'Column names are fixed',
      description: 'Column names cannot be changed.',
    });
  };

  const getColumnIcon = (columnId) => {
    switch (columnId) {
      case 'inbox':
        return <Inbox className="h-5 w-5" />;
      case 'confirmedreceived':
        return <ClipboardList className="h-5 w-5" />;
      case 'inprogress':
        return <Clock className="h-5 w-5" />;
      case 'waiting':
        return <Timer className="h-5 w-5" />;
      case 'review':
        return <FileText className="h-5 w-5" />;
      case 'archive':
        return <Archive className="h-5 w-5" />;
      default:
        return <ListChecks className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 py-6"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center">
          <ListChecks className="mr-2 h-6 w-6" />
          Projects Board
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNewTaskDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add New Project
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="kanban"
        value={activeView}
        onValueChange={setActiveView}
        className="w-full mb-6"
      >
        <TabsList className="grid w-[400px] grid-cols-2 mx-auto">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Grid View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          <ColumnCarousel
            key={refreshKey}
            columns={columns.map((column) => ({
              id: column.id,
              title: column.title,
              icon: getColumnIcon(column.id),
              tasks: getTasksByStatus(column.id),
              isLoading,
              onDrop: handleDrop,
              onTaskClick: handleTaskClick,
              onReorderTasks: handleReorderTasks,
              draggedTaskId,
              onDragOver: handleDragOver,
              onAddTask: handleAddTask,
              onEditColumnTitle: handleEditColumnTitle,
              isEditing: editingColumnId === column.id,
              setIsEditing: (isEditing) =>
                setEditingColumnId(isEditing ? column.id : null),
            }))}
          />
        </TabsContent>

        <TabsContent value="grid" className="mt-4">
          <ProjectsGrid
            tasks={tasks}
            columns={columns}
            onTaskClick={handleTaskClick}
            onAddTask={() => setIsNewTaskDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {selectedTask && (
        <TaskEditDialog
          isOpen={isTaskDialogOpen}
          task={{
            ...selectedTask,
            comments: getCommentsByTaskId(selectedTask.id),
          }}
          onClose={() => {
            setIsTaskDialogOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          users={users}
        />
      )}

      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the details for your new project.
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            onSave={handleCreateTask}
            onCancel={() => setIsNewTaskDialogOpen(false)}
            statuses={columns.map((col) => ({ id: col.id, name: col.title }))}
            initialStatus={newTaskStatus}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TaskColumn from "@/components/projects/TaskColumn";
import TaskForm from "@/components/projects/TaskForm";
import TaskEditDialog from "@/components/projects/TaskEditDialog";
import ColumnCarousel from "@/components/projects/ColumnCarousel";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Projects = () => {
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]); // New state for comments
  const [columns] = useState([
    { id: "inbox", title: "Inbox" },
    { id: "confirmedreceived", title: "Confirmed Received" },
    { id: "inprogress", title: "In Progress" },
    { id: "waiting", title: "Waiting" },
    { id: "review", title: "Review" },
    { id: "archive", title: "Archive" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState("inbox");
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [activeView, setActiveView] = useState("kanban");
  const [refreshKey, setRefreshKey] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const { toast } = useToast();

  const router = useRouter();

  useEffect(() => {
      const fetchUserRole = async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not verify user. Please log in again.",
          });
          router.push("/login");
          return;
        }
        if (user) {
          console.log(user);
          setUserRole(user.user_metadata.role || null);
          if (user.user_metadata.role === "assistant") {
            setUserId(user.user_metadata.owner_id || null);
          } else {
            setUserId(user.id || null); // For executives, use their own ID
          }
        } else {
          toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "Please log in to access reports.",
          });
          router.push("/login");
        }
      };
      fetchUserRole();
    }, [toast]);

  useEffect(() => {
    fetchTasksAndComments();
  }, []);

  useEffect(() => {
    const handleGlobalDragStart = (e) => {
      const taskId = e.dataTransfer?.getData("taskId");
      if (taskId) setDraggedTaskId(taskId);
    };

    const handleGlobalDragEnd = () => setDraggedTaskId(null);

    document.addEventListener("dragstart", handleGlobalDragStart);
    document.addEventListener("dragend", handleGlobalDragEnd);

    return () => {
      document.removeEventListener("dragstart", handleGlobalDragStart);
      document.removeEventListener("dragend", handleGlobalDragEnd);
    };
  }, []);

  const fetchTasksAndComments = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      setUserRole(user.user_metadata.role);

      const { data: publicUser, error: publicError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id);

      if (publicError) throw publicError;

      let tasksData;
      if (user.user_metadata.role === "assistant") {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("created_by", user.user_metadata.owner_id);
        if (error) throw error;
        tasksData = data || [];
      } else {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("created_by", user.id);
        if (error) throw error;
        tasksData = data || [];
      }
      setTasks(tasksData);

      // Fetch all comments for the tasks
      const taskIds = tasksData.map((task) => task.id);
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .in("task_id", taskIds);
      if (commentsError) throw commentsError;
      setComments(commentsData || []);
    } catch (error) {
      console.error("Error fetching tasks or comments:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks or comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTasksByStatus = (status) =>
    tasks.filter((task) => task.status === status);

  const getCommentsByTaskId = (taskId) =>
    comments.filter((comment) => comment.task_id === taskId);

  const handleDrop = async (taskId, newStatus) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      window.location.reload();

      const columnTitle =
        columns.find((col) => col.id === newStatus)?.title || newStatus;
      toast({
        title: "Project moved",
        description: `Project moved to ${columnTitle}.`,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to move project",
        variant: "destructive",
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
      await Promise.all(
        updatedTasks.map((task) =>
          supabase.from("tasks").update({ order: task.order }).eq("id", task.id)
        )
      );

      setTasks((prev) => {
        const otherTasks = prev.filter((task) => task.status !== status);
        return [...otherTasks, ...updatedTasks].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
      });

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error reordering tasks:", error);
      toast({
        title: "Error",
        description: "Failed to reorder tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDraggedTaskId(null);
    }
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.types.includes("taskId")) {
      const taskId = e.dataTransfer.getData("taskId");
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

      const { error } = await supabase
        .from("tasks")
        .update({
          title: updatedTask.title,
          task: updatedTask.task,
          status: updatedTask.status,
          labels: updatedTask.labels || "",
          attachments: updatedTask.attachments || "",
          due_date: updatedTask.due_date,
          purpose: updatedTask.purpose,
          end_result: updatedTask.end_result,
        })
        .eq("id", updatedTask.id);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );

      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }

      setIsTaskDialogOpen(false);
      toast({
        title: "Project updated",
        description: "Your project has been saved.",
      });
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setComments((prev) => prev.filter((comment) => comment.task_id !== taskId));
      setIsTaskDialogOpen(false);
      toast({
        title: "Project deleted",
        description: "Project has been removed.",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
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

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      const { data: publicUser, error: publicUserError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id);

      if (publicUserError) throw publicUserError;

      let taskToAdd;
      if (user.user_metadata.role === "executive") {
        taskToAdd = {
          title: newTask.title || "Untitled Project",
          task: newTask.task || "",
          status: newTask.status || newTaskStatus,
          labels: "",
          attachments: "",
          created_by: user.id,
          assigned_to: publicUser[0]?.assistant_id || null,
          due_date: newTask.due_date || format(new Date(), "yyyy-MM-dd"),
          purpose: newTask.purpose || "",
          end_result: newTask.end_result || "",
        };
      } else if (user.user_metadata.role === "assistant") {
        taskToAdd = {
          title: newTask.title || "Untitled Project",
          task: newTask.task || "",
          status: newTask.status || newTaskStatus,
          labels: "",
          attachments: "",
          created_by: user.user_metadata.owner_id,
          assigned_to: user.id,
          due_date: newTask.due_date || format(new Date(), "yyyy-MM-dd"),
          purpose: newTask.purpose || "",
          end_result: newTask.end_result || "",
        };
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([taskToAdd])
        .select();

      if (error) throw error;

      setTasks((prev) => [...prev, data[0]]);
      setIsNewTaskDialogOpen(false);
      toast({
        title: "Project created",
        description: "Your new project has been created.",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (taskId, comment) => {
    try {
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const newComment = {
        task_id: taskId,
        user_id: user.id,
        content: comment.content,
      };

      const { data, error } = await supabase
        .from("comments")
        .insert([newComment])
        .select();

      if (error) throw error;

      setComments((prev) => [...prev, data[0]]);
      toast({
        title: "Comment added",
        description: "Your comment has been added.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (taskId, commentId, updatedComment) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("comments")
        .update({ content: updatedComment.content, updated_at: new Date().toISOString() })
        .eq("id", commentId);

      if (error) throw error;

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, ...updatedComment } : comment
        )
      );
      toast({
        title: "Comment updated",
        description: "Your comment has been updated.",
      });
    } catch (error) {
      console.error("Error editing comment:", error);
      toast({
        title: "Error",
        description: "Failed to edit comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (taskId, commentId) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setComments((prev) =>
        prev.filter((comment) => comment.id !== commentId)
      );
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditColumnTitle = (id, newTitle) => {
    toast({
      title: "Column names are fixed",
      description: "Column names cannot be changed.",
    });
  };

  const getColumnIcon = (columnId) => {
    switch (columnId) {
      case "inbox":
        return <Inbox className="h-5 w-5" />;
      case "confirmedreceived":
        return <ClipboardList className="h-5 w-5" />;
      case "inprogress":
        return <Clock className="h-5 w-5" />;
      case "waiting":
        return <Timer className="h-5 w-5" />;
      case "review":
        return <FileText className="h-5 w-5" />;
      case "archive":
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
          task={{ ...selectedTask, comments: getCommentsByTaskId(selectedTask.id) }}
          onClose={() => {
            setIsTaskDialogOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
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
};

export default Projects;
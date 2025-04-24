import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import ProjectsClient from "./ProjectsClient.jsx";
import { createSupabaseServerClient } from "@/lib/supabase-server.js";

export default async function ProjectsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: publicUser, error: publicError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (publicError || !publicUser) {
    redirect("/login");
  }

  const userRole = publicUser.role || null;
  const userId = publicUser.role === "assistant" ? publicUser.executive_id : user.id;

  let tasksData = [];
  if (publicUser.role === "assistant") {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", publicUser.id);
    if (!error) tasksData = data || [];
  } else {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("created_by", publicUser.id);
    if (!error) tasksData = data || [];
  }

  const taskIds = tasksData.map((task) => task.id);
  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("*")
    .in("task_id", taskIds);

  const normalizedTasks = tasksData.map((task) => ({
    ...task,
    title: task.title || "Untitled",
    task: task.task || "",
    status: task.status || "inbox",
    comments: commentsData?.filter((comment) => comment.task_id === task.id) || [],
  }));

  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("id, full_name");

  const usersMap = usersData ? usersData.reduce((acc, user) => {
    acc[user.id] = user.full_name;
    return acc;
  }, {}) : {};

  return (
    <ProjectsClient
      userRole={userRole}
      userId={userId}
      tasks={normalizedTasks}
      comments={commentsData || []}
      users={usersMap}
    />
  );
}

import LibraryClient from "./LibraryClient";
import { createSupabaseServerClient } from "@/lib/supabase-server";


export default async function Library() {
  const supabase = await createSupabaseServerClient();

  // Fetch user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  let userData = null;
  let referenceItems = [];
  let availableTags = [];

  if (user) {
    // Fetch user data
    const { data: publicUser, error: publicError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (publicError) {
      // console.error("Error fetching user data:", publicError);
      throw new Error("Failed to fetch user data");
    }

    userData = publicUser;

    // Fetch reference items
    let query = supabase
      .from("reference_items")
      .select(
        `
        *,
        reference_item_tags (
          tags (id, name)
        ),
        attachments (id, name, size, type, url, storage_path)
      `
      )
      .order("updated_at", { ascending: false });

    if (userData.role === "executive") {
      query = query.eq("executive_id", userData.id);
    } else if (userData.role === "assistant") {
      query = query.eq("assistant_id", userData.id);
    }

    const { data: itemsData, error: itemsError } = await query;

    if (itemsError) {
      // console.error("Error fetching reference items:", itemsError);
      throw new Error("Failed to fetch reference items");
    }

    referenceItems = itemsData.map((item) => ({
      id: item.id,
      executive_id: item.executive_id,
      assistant_id: item.assistant_id,
      title: item.title,
      description: item.description || "",
      content: item.content || "",
      tags: item.reference_item_tags.map((rt) => rt.tags.name),
      icon: getIconForType(item.type),
      attachments: item.attachments.map((att) => ({
        id: att.id,
        name: att.name,
        size: att.size,
        type: att.type,
        url: att.url,
        storagePath: att.storage_path,
      })),
      updated_at: new Date(item.updated_at).toLocaleDateString(),
      type: item.type,
      image_url: item.image_url,
      table_data: item.table_data,
    }));

    // Fetch tags
    let tagsQuery = supabase.from("tags").select("*");
    if (userData.role === "executive") {
      tagsQuery = tagsQuery.eq("executive_id", userData.id);
    } else if (userData.role === "assistant") {
      tagsQuery = tagsQuery.eq("assistant_id", userData.id);
    }

    const { data: tagsData, error: tagsError } = await tagsQuery;

    if (tagsError) {
      // console.error("Error fetching tags:", tagsError);
      throw new Error("Failed to fetch tags");
    }

    availableTags = tagsData || [];
  }

  // Function to determine icon (replicated from original code)
  function getIconForType(type) {
    switch (type) {
      case "image":
        return "ImageIcon";
      case "file":
        return "FileArchive";
      case "database":
        return "TableIcon";
      case "text":
      default:
        return "TypeIcon";
    }
  }

  return (
    <LibraryClient
      initialUserData={userData}
      initialReferenceItems={referenceItems}
      initialAvailableTags={availableTags}
    />
  );
}
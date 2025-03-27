"use client";
import React, { useState, useEffect } from "react";

import {
  Search,
  Phone,
  Plane,
  FileText,
  RotateCcw,
  Plus,
  Tag,
  FileArchive,
  Edit,
  Trash,
  Check,
  X,
  Download,
  Image as ImageIcon,
  Table as TableIcon,
  Type as TypeIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const Library = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase credentials missing. Auth features will be disabled."
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const { toast } = useToast();

  const router = useRouter();

  // Fetch user role and ID on mount
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
        const { data: publicUser, error: publicError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id);
        if (publicError) throw publicError;

        setUserRole(publicUser[0].role || null);
        if (publicUser[0].role === "assistant") {
          setUserId(publicUser[0].executive_id || null);
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
  }, [toast, router]);

  const [referenceItems, setReferenceItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [newTagValue, setNewTagValue] = useState("");
  const [tableHeaders, setTableHeaders] = useState([
    "Column 1",
    "Column 2",
    "Column 3",
  ]);
  const [tableRows, setTableRows] = useState([
    ["", "", ""],
    ["", "", ""],
  ]);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      content: "",
      tags: [],
      newTag: "",
      attachments: [],
      type: "text",
      imageUrl: "",
      tableData: {
        headers: ["Column 1", "Column 2", "Column 3"],
        rows: [
          ["", "", ""],
          ["", "", ""],
        ],
      },
    },
  });

  // Fetch reference items based on user role
  const fetchReferenceItems = async () => {
    if (!userId || !userRole) return;

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

    if (userRole === "executive") {
      query = query.eq("user_id", userId);
    } else if (userRole === "assistant" && userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching reference items:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load reference items",
      });
      return;
    }

    const items = data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
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
        storagePath: att.storage_path, // Include storage path
      })),
      updated_at: new Date(item.updated_at).toLocaleDateString(),
      type: item.type,
      image_url: item.image_url,
      table_data: item.table_data,
    }));

    setReferenceItems(items);
  };

  // Fetch tags
  const fetchTags = async () => {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching tags:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tags",
      });
    } else {
      setAvailableTags(data || []);
    }
  };

  // Create or get tag
  const getOrCreateTag = async (tagName) => {
    const existingTag = availableTags.find((t) => t.name === tagName);
    if (existingTag) return existingTag.id;

    const { data, error } = await supabase
      .from("tags")
      .insert({ name: tagName })
      .select()
      .single();

    if (error) {
      console.error("Error creating tag:", error);
      return null;
    }

    setAvailableTags((prev) => [...prev, data]);
    return data.id;
  };

  // Create reference item
  const createReferenceItem = async (data) => {
    if (!userId) throw new Error("No user logged in");

    const tableData =
      data.type === "database"
        ? { headers: tableHeaders, rows: tableRows }
        : null;

    const { data: itemData, error: itemError } = await supabase
      .from("reference_items")
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        content: data.content,
        type: data.type,
        image_url: data.type === "image" ? data.imageUrl : null,
        table_data: tableData,
      })
      .select()
      .single();

    if (itemError) throw itemError;

    // Add tags
    const tagIds = await Promise.all(
      data.tags.map((tag) => getOrCreateTag(tag))
    );
    const tagRelations = tagIds
      .filter((id) => id)
      .map((tagId) => ({
        reference_item_id: itemData.id,
        tag_id: tagId,
      }));

    if (tagRelations.length > 0) {
      const { error: tagError } = await supabase
        .from("reference_item_tags")
        .insert(tagRelations);
      if (tagError) throw tagError;
    }

    // Add attachments
    if (data.attachments.length > 0) {
      const attachmentsToInsert = data.attachments.map((att) => ({
        reference_item_id: itemData.id,
        name: att.name,
        size: att.size,
        type: att.type,
        url: att.url,
        storage_path: att.storagePath, // Add storage path to database
      }));
      const { error: attError } = await supabase
        .from("attachments")
        .insert(attachmentsToInsert);
      if (attError) throw attError;
    }

    return itemData;
  };

  // Update reference item
  const updateReferenceItem = async (id, data) => {
    if (!userId) throw new Error("No user logged in");

    const tableData =
      data.type === "database"
        ? { headers: tableHeaders, rows: tableRows }
        : null;

    const { error: itemError } = await supabase
      .from("reference_items")
      .update({
        title: data.title,
        description: data.description,
        content: data.content,
        type: data.type,
        image_url: data.type === "image" ? data.imageUrl : null,
        table_data: tableData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (itemError) throw itemError;

    // Update tags
    await supabase
      .from("reference_item_tags")
      .delete()
      .eq("reference_item_id", id);
    const tagIds = await Promise.all(
      data.tags.map((tag) => getOrCreateTag(tag))
    );
    const tagRelations = tagIds
      .filter((id) => id)
      .map((tagId) => ({
        reference_item_id: id,
        tag_id: tagId,
      }));

    if (tagRelations.length > 0) {
      const { error: tagError } = await supabase
        .from("reference_item_tags")
        .insert(tagRelations);
      if (tagError) throw tagError;
    }

    // Delete old attachments from storage and database
    const { data: oldAttachments } = await supabase
      .from("attachments")
      .select("*")
      .eq("reference_item_id", id);

    if (oldAttachments && oldAttachments.length > 0) {
      const pathsToDelete = oldAttachments
        .filter((att) => att.storage_path)
        .map((att) => att.storage_path);
      if (pathsToDelete.length > 0) {
        await supabase.storage
          .from("reference-attachments")
          .remove(pathsToDelete);
      }
      await supabase.from("attachments").delete().eq("reference_item_id", id);
    }

    // Insert new attachments
    if (data.attachments.length > 0) {
      const attachmentsToInsert = data.attachments.map((att) => ({
        reference_item_id: id,
        name: att.name,
        size: att.size,
        type: att.type,
        url: att.url,
        storage_path: att.storagePath, // Add storage path to database
      }));
      const { error: attError } = await supabase
        .from("attachments")
        .insert(attachmentsToInsert);
      if (attError) throw attError;
    }
  };

  const deleteReferenceItem = async (id) => {
    if (!userId) throw new Error("No user logged in");

    // Fetch attachments to delete from storage
    const { data: attachments } = await supabase
      .from("attachments")
      .select("storage_path")
      .eq("reference_item_id", id);

    if (attachments && attachments.length > 0) {
      const pathsToDelete = attachments
        .filter((att) => att.storage_path)
        .map((att) => att.storage_path);
      if (pathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("reference-attachments")
          .remove(pathsToDelete);
        if (storageError) {
          console.error("Error deleting files from storage:", storageError);
          throw storageError;
        }
      }
    }

    // Delete the reference item (cascading deletes will handle attachments and tags)
    const { error } = await supabase
      .from("reference_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  };

  // Update tag
  const updateTag = async (tagId, newName) => {
    const { error } = await supabase
      .from("tags")
      .update({ name: newName })
      .eq("id", tagId);

    if (error) {
      console.error("Error updating tag:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update tag",
      });
    } else {
      setAvailableTags((prev) =>
        prev.map((tag) => (tag.id === tagId ? { ...tag, name: newName } : tag))
      );
      fetchReferenceItems(); // Refresh items to reflect tag changes
      toast({
        title: "Success",
        description: `Tag updated to "${newName}"`,
      });
    }
  };

  // Delete tag
  const deleteTag = async (tagId, tagName) => {
    const { error } = await supabase.from("tags").delete().eq("id", tagId);

    if (error) {
      console.error("Error deleting tag:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete tag",
      });
    } else {
      setAvailableTags((prev) => prev.filter((tag) => tag.id !== tagId));
      fetchReferenceItems(); // Refresh items to reflect tag removal
      toast({
        title: "Success",
        description: `Tag "${tagName}" deleted`,
      });
    }
  };

  useEffect(() => {
    if (userId && userRole) {
      fetchReferenceItems();
      fetchTags();
    }
  }, [userId, userRole, router]);

  const filteredItems = referenceItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      item.attachments.some((att) =>
        att.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => item.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const resetForm = (item) => {
    if (item) {
      form.reset({
        title: item.title,
        description: item.description,
        content: item.content,
        tags: item.tags,
        newTag: "",
        attachments: item.attachments || [],
        type: item.type,
        imageUrl: item.image_url || "",
        tableData: item.table_data || {
          headers: ["Column 1", "Column 2", "Column 3"],
          rows: [
            ["", "", ""],
            ["", "", ""],
          ],
        },
      });
      setTableHeaders(
        item.table_data?.headers || ["Column 1", "Column 2", "Column 3"]
      );
      setTableRows(
        item.table_data?.rows || [
          ["", "", ""],
          ["", "", ""],
        ]
      );
    } else {
      form.reset({
        title: "",
        description: "",
        content: "",
        tags: [],
        newTag: "",
        attachments: [],
        type: "text",
        imageUrl: "",
        tableData: {
          headers: ["Column 1", "Column 2", "Column 3"],
          rows: [
            ["", "", ""],
            ["", "", ""],
          ],
        },
      });
      setTableHeaders(["Column 1", "Column 2", "Column 3"]);
      setTableRows([
        ["", "", ""],
        ["", "", ""],
      ]);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    resetForm(item);
    setIsEditDialogOpen(true);
  };

  const handleNewItem = () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please log in to add a new item",
      });
      return;
    }
    setEditingItem(null);
    resetForm();
    setIsNewItemDialogOpen(true);
  };

  // const handleFileUpload = (e) => {
  //   const files = e.target.files;
  //   if (!files || files.length === 0) return;

  //   const newAttachments= Array.from(files).map(
  //     (file) => ({
  //       id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  //       name: file.name,
  //       size: file.size,
  //       type: file.type,
  //       url: URL.createObjectURL(file),
  //     })
  //   );

  //   const currentAttachments = form.getValues("attachments") || [];
  //   form.setValue("attachments", [...currentAttachments, ...newAttachments]);
  //   e.target.value = "";
  // };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments = await Promise.all(
      Array.from(files).map(async (file) => {
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("reference-attachments") // Your bucket name
          .upload(fileName, file);

        if (error) {
          console.error("Error uploading file:", error);
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: `Failed to upload ${file.name}`,
          });
          return null;
        }

        // Get the public URL
        const { data: publicData } = supabase.storage
          .from("reference-attachments")
          .getPublicUrl(fileName);

        return {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicData.publicUrl,
          storagePath: fileName, // Store the path for deletion later
        };
      })
    );

    const validAttachments = newAttachments.filter((att) => att !== null);
    const currentAttachments = form.getValues("attachments") || [];
    form.setValue("attachments", [...currentAttachments, ...validAttachments]);
    e.target.value = "";
  };

  const removeAttachment = async (id) => {
    const currentAttachments = form.getValues("attachments") || [];
    const attachmentToRemove = currentAttachments.find((att) => att.id === id);

    if (attachmentToRemove && attachmentToRemove.storagePath) {
      const { error } = await supabase.storage
        .from("reference-attachments")
        .remove([attachmentToRemove.storagePath]);

      if (error) {
        console.error("Error deleting file from storage:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete ${attachmentToRemove.name} from storage`,
        });
        return;
      }
    }

    form.setValue(
      "attachments",
      currentAttachments.filter((att) => att.id !== id)
    );
  };

  const addTableColumn = () => {
    setTableHeaders([...tableHeaders, `Column ${tableHeaders.length + 1}`]);
    setTableRows(tableRows.map((row) => [...row, ""]));
  };

  const removeTableColumn = (index) => {
    if (tableHeaders.length <= 1) return;
    setTableHeaders((prev) => prev.filter((_, i) => i !== index));
    setTableRows((prev) =>
      prev.map((row) => row.filter((_, i) => i !== index))
    );
  };

  const addTableRow = () => {
    setTableRows([...tableRows, Array(tableHeaders.length).fill("")]);
  };

  const removeTableRow = (index) => {
    if (tableRows.length <= 1) return;
    setTableRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTableHeader = (index, value) => {
    setTableHeaders((prev) => prev.map((h, i) => (i === index ? value : h)));
  };

  const updateTableCell = (rowIndex, colIndex, value) => {
    setTableRows((prev) =>
      prev.map((row, i) =>
        i === rowIndex
          ? row.map((cell, j) => (j === colIndex ? value : cell))
          : row
      )
    );
  };

  const onSubmit = async (data) => {
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
      const { data: publicUser, error: publicError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id);
      if (publicError) throw publicError;
      if (
        publicUser[0].role === "executive" &&
        publicUser[0].assistant_id === null
      ) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Assistant not found. Redirecting to settings page ...",
        });
        router.push("/settings");
        return;
      }
    }

    try {
      if (data.newTag && !data.tags.includes(data.newTag)) {
        data.tags.push(data.newTag);
      }

      if (editingItem) {
        await updateReferenceItem(editingItem.id, data);
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        await createReferenceItem(data);
        toast({
          title: "Success",
          description: "New item added successfully",
        });
      }

      fetchReferenceItems();
      setEditingItem(null);
      setIsEditDialogOpen(false);
      setIsNewItemDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save item",
      });
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteReferenceItem(id);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      fetchReferenceItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete item",
      });
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const startEditTag = (tag) => {
    setEditingTag(tag);
    setNewTagValue(tag);
  };

  const saveEditedTag = async () => {
    if (editingTag && newTagValue && newTagValue !== editingTag) {
      const tagToUpdate = availableTags.find((tag) => tag.name === editingTag);
      if (tagToUpdate) {
        await updateTag(tagToUpdate.id, newTagValue);
      }
    }
    setEditingTag(null);
    setNewTagValue("");
  };

  const cancelEditTag = () => {
    setEditingTag(null);
    setNewTagValue("");
  };

  const handleDeleteTag = async (tagName) => {
    const tagToDelete = availableTags.find((tag) => tag.name === tagName);
    if (tagToDelete) {
      await deleteTag(tagToDelete.id, tagName);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "file":
        return FileArchive;
      case "database":
        return TableIcon;
      case "text":
      default:
        return TypeIcon;
    }
  };

  const renderContentByType = (item) => {
    switch (item.type) {
      case "image":
        return (
          <div className="mt-2">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-auto rounded-md object-cover max-h-28"
              />
            ) : (
              <div className="flex items-center justify-center h-24 bg-gray-100 rounded-md">
                <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
          </div>
        );
      case "file":
        return (
          <div className="mt-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <FileArchive className="mr-2 h-4 w-4" />
              <span>{item.attachments.length} file(s) attached</span>
            </div>
          </div>
        );
      case "database":
        return (
          <div className="mt-2 overflow-hidden">
            {item.table_data && (
              <div className="overflow-x-auto text-xs border rounded-md">
                <table className="min-w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      {item.table_data.headers
                        .slice(0, 3)
                        .map((header, index) => (
                          <th
                            key={index}
                            className="px-2 py-1.5 font-medium text-left truncate"
                          >
                            {header}
                          </th>
                        ))}
                      {item.table_data.headers.length > 3 && (
                        <th className="px-2 py-1.5 font-medium text-left">
                          +{item.table_data.headers.length - 3} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {item.table_data.rows.slice(0, 1).map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          rowIndex % 2 === 0 ? "bg-white" : "bg-muted/20"
                        }
                      >
                        {row.slice(0, 3).map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-2 py-1 truncate border-t"
                          >
                            {cell || "—"}
                          </td>
                        ))}
                        {row.length > 3 && (
                          <td className="px-2 py-1 truncate border-t">...</td>
                        )}
                      </tr>
                    ))}
                    {item.table_data.rows.length > 1 && (
                      <tr>
                        <td
                          colSpan={Math.min(item.table_data.headers.length, 4)}
                          className="px-2 py-1 text-center text-muted-foreground border-t text-xs"
                        >
                          +{item.table_data.rows.length - 1} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case "text":
      default:
        return (
          <CardDescription className="line-clamp-2">
            {item.description}
          </CardDescription>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 md:px-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reference Library
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Access and manage shared knowledge, processes, and contacts
          </p>
        </div>
        <Button
          className="mt-4 md:mt-0"
          onClick={handleNewItem}
          disabled={!userId}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Entry
        </Button>
      </div>

      <Dialog open={isNewItemDialogOpen} onOpenChange={setIsNewItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Reference</DialogTitle>
            <DialogDescription>
              Create a new reference item in your library.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const currentTags = field.value || [];
                          if (!currentTags.includes(value)) {
                            field.onChange([...currentTags, value]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tags" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTags.map((tag) => (
                            <SelectItem key={tag.id} value={tag.name}>
                              {tag.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {field.value?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="mr-1 mb-1"
                        >
                          {tag}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() =>
                              field.onChange(
                                field.value.filter((t) => t !== tag)
                              )
                            }
                          />
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Tag</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Add new tag" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attachments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attachments</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*,application/pdf"
                        multiple
                        onChange={handleFileUpload}
                      />
                    </FormControl>
                    <div className="mt-2 space-y-2">
                      {field.value?.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm">
                            {att.name} ({(att.size / 1024).toFixed(1)} KB)
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(att.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("type") === "image" && (
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://example.com/image.jpg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch("type") === "database" && (
                <div className="space-y-3 border p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Table Data</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTableColumn}
                    >
                      Add Column
                    </Button>
                  </div>

                  <div className="overflow-x-auto border rounded-md">
                    <table className="min-w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          {tableHeaders.map((header, index) => (
                            <th key={index} className="px-2 py-1">
                              <div className="flex items-center gap-1">
                                <Input
                                  value={header}
                                  onChange={(e) =>
                                    updateTableHeader(index, e.target.value)
                                  }
                                  className="h-7 text-xs w-full"
                                  placeholder="Column name"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => removeTableColumn(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                              <td key={colIndex} className="px-2 py-1 border-t">
                                <Input
                                  value={cell}
                                  onChange={(e) =>
                                    updateTableCell(
                                      rowIndex,
                                      colIndex,
                                      e.target.value
                                    )
                                  }
                                  className="h-7 text-xs"
                                  placeholder="Cell value"
                                />
                              </td>
                            ))}
                            <td className="w-10 border-t">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => removeTableRow(rowIndex)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTableRow}
                  >
                    Add Row
                  </Button>
                </div>
              )}
              <DialogFooter>
                <Button type="submit">Save reference</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reference</DialogTitle>
            <DialogDescription>
              Update this reference item in your library.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const currentTags = field.value || [];
                          if (!currentTags.includes(value)) {
                            field.onChange([...currentTags, value]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tags" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTags.map((tag) => (
                            <SelectItem key={tag.id} value={tag.name}>
                              {tag.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {field.value?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="mr-1 mb-1"
                        >
                          {tag}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() =>
                              field.onChange(
                                field.value.filter((t) => t !== tag)
                              )
                            }
                          />
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Tag</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Add new tag" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attachments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attachments</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*,application/pdf"
                        multiple
                        onChange={handleFileUpload}
                      />
                    </FormControl>
                    <div className="mt-2 space-y-2">
                      {field.value?.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm">
                            {att.name} ({(att.size / 1024).toFixed(1)} KB)
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(att.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("type") === "image" && (
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://example.com/image.jpg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch("type") === "database" && (
                <div className="space-y-3 border p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Table Data</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTableColumn}
                    >
                      Add Column
                    </Button>
                  </div>

                  <div className="overflow-x-auto border rounded-md">
                    <table className="min-w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          {tableHeaders.map((header, index) => (
                            <th key={index} className="px-2 py-1">
                              <div className="flex items-center gap-1">
                                <Input
                                  value={header}
                                  onChange={(e) =>
                                    updateTableHeader(index, e.target.value)
                                  }
                                  className="h-7 text-xs w-full"
                                  placeholder="Column name"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => removeTableColumn(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                              <td key={colIndex} className="px-2 py-1 border-t">
                                <Input
                                  value={cell}
                                  onChange={(e) =>
                                    updateTableCell(
                                      rowIndex,
                                      colIndex,
                                      e.target.value
                                    )
                                  }
                                  className="h-7 text-xs"
                                  placeholder="Cell value"
                                />
                              </td>
                            ))}
                            <td className="w-10 border-t">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => removeTableRow(rowIndex)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTableRow}
                  >
                    Add Row
                  </Button>
                </div>
              )}
              <DialogFooter>
                <Button type="submit">Update reference</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 mt-6">
        <div className="space-y-5">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search library..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium flex items-center">
                <Tag className="h-3.5 w-3.5 mr-1.5" /> Tags
              </h3>
              <div className="flex items-center space-x-1">
                <Input
                  value={form.watch("newTag") || ""}
                  onChange={(e) => form.setValue("newTag", e.target.value)}
                  placeholder="New tag"
                  className="h-7 text-xs"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={async () => {
                    const newTag = form.getValues("newTag");
                    if (newTag) {
                      await getOrCreateTag(newTag);
                      form.setValue("newTag", "");
                    }
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => (
                  <div key={tag.id} className="flex items-center mb-1">
                    {editingTag === tag.name ? (
                      <div className="flex items-center">
                        <Input
                          value={newTagValue}
                          onChange={(e) => setNewTagValue(e.target.value)}
                          className="h-7 text-xs w-24 mr-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={saveEditedTag}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={cancelEditTag}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant={
                          selectedTags.includes(tag.name)
                            ? "default"
                            : "outline"
                        }
                        className="text-xs py-1 px-2 cursor-pointer flex items-center gap-1"
                      >
                        <span onClick={() => toggleTag(tag.name)}>
                          {tag.name}
                        </span>
                        <div className="flex items-center ml-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0"
                            onClick={() => startEditTag(tag.name)}
                          >
                            <Edit className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 text-destructive"
                            onClick={() => handleDeleteTag(tag.name)}
                          >
                            <X className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-2">
                No tags available
              </div>
            )}
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <RotateCcw className="mr-1.5 h-3 w-3" />
            <span>Last updated: Today</span>
          </div>
        </div>

        <div>
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-md transition-shadow border-muted/40"
                  >
                    <CardHeader className="pb-2 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-1.5 rounded-full">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.updated_at}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditItem(item);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <CardTitle className="text-base leading-tight">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-1 min-h-[60px]">
                      {renderContentByType(item)}

                      {item.attachments &&
                        item.attachments.length > 0 &&
                        item.type !== "file" && (
                          <div className="mt-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <FileArchive className="h-3.5 w-3.5" />
                              <span>
                                {item.attachments.length} attachment
                                {item.attachments.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        )}
                    </CardContent>

                    <div className="px-6 pb-1">
                      <div className="flex flex-wrap gap-1 mb-3 min-h-[26px] max-h-[52px] overflow-hidden">
                        {item.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs py-0.5 px-1.5 bg-muted/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <CardFooter className="justify-between gap-2 border-t pt-2.5 pb-3 bg-muted/5">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{item.title}</DialogTitle>
                            <DialogDescription>
                              {item.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 space-y-4">
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {item.type === "text" && (
                              <div className="p-4 bg-muted/50 rounded-md whitespace-pre-line">
                                {item.content}
                              </div>
                            )}

                            {item.type === "image" && item.image_url && (
                              <div className="flex justify-center">
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="max-w-full max-h-[400px] object-contain rounded-md"
                                />
                              </div>
                            )}

                            {item.type === "database" && item.table_data && (
                              <div className="overflow-x-auto border rounded-md">
                                <table className="min-w-full">
                                  <thead className="bg-muted/50">
                                    <tr>
                                      {item.table_data.headers.map(
                                        (header, index) => (
                                          <th
                                            key={index}
                                            className="px-4 py-2 font-medium text-left"
                                          >
                                            {header}
                                          </th>
                                        )
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.table_data.rows.map(
                                      (row, rowIndex) => (
                                        <tr
                                          key={rowIndex}
                                          className={
                                            rowIndex % 2 === 0
                                              ? "bg-white"
                                              : "bg-muted/20"
                                          }
                                        >
                                          {row.map((cell, cellIndex) => (
                                            <td
                                              key={cellIndex}
                                              className="px-4 py-2 border-t"
                                            >
                                              {cell || "—"}
                                            </td>
                                          ))}
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {item.attachments &&
                              item.attachments.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium mb-2">
                                    Attachments
                                  </h4>
                                  <div className="space-y-2">
                                    {item.attachments.map((attachment) => (
                                      <div
                                        key={attachment.id}
                                        className="flex items-center justify-between bg-gray-50 rounded p-3"
                                      >
                                        <div className="flex items-center">
                                          <FileArchive className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <span>{attachment.name}</span>
                                          <span className="text-xs text-muted-foreground ml-2">
                                            (
                                            {(attachment.size / 1024).toFixed(
                                              1
                                            )}{" "}
                                            KB)
                                          </span>
                                        </div>
                                        <div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                try {
                  const response = await fetch(attachment.url);
                  if (!response.ok) throw new Error("Failed to fetch file");

                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = attachment.name; // Set the file name for download
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url); // Clean up
                } catch (error) {
                  console.error("Download error:", error);
                  toast({
                    variant: "destructive",
                    title: "Download Error",
                    description: `Failed to download ${attachment.name}`,
                  });
                }
              }}
                                          >
                                            <Download className="h-4 w-4 mr-1" />{" "}
                                            Download
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                          <DialogFooter className="flex justify-between mt-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive border-destructive hover:bg-destructive/10"
                                >
                                  <Trash className="h-4 w-4 mr-1" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Reference Item
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {item.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10 h-8"
                          >
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Reference Item
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{item.title}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteItem(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/10 rounded-lg">
              <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-muted-foreground/70">
                No reference items found
              </h3>
              <p className="text-sm text-muted-foreground/50 mt-1">
                Try changing your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Library;

'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';

const { revalidatePath } = require('next/cache');


// Fetch tags
async function fetchTags(userData) {
  const supabase =await createSupabaseServerClient()
  let query = supabase.from('tags').select('*');
  if (userData.role === 'executive') {
    query = query.eq('executive_id', userData.id);
  } else if (userData.role === 'assistant') {
    query = query.eq('assistant_id', userData.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Error fetching tags: ${error.message}`);
  return data || [];
}

// Create or get tag
async function getOrCreateTag(tagName, userData) {

  const supabase = await createSupabaseServerClient()
  
  const tags = await fetchTags(userData);
  const existingTag = tags.find((t) => t.name === tagName);
  if (existingTag) return existingTag.id;

  let insertData = { name: tagName };
  if (userData.role === 'executive') {
    insertData = { ...insertData, executive_id: userData.id, assistant_id: userData.assistant_id };
  } else if (userData.role === 'assistant') {
    insertData = { ...insertData, assistant_id: userData.id, executive_id: userData.executive_id };
  }

  const { data, error } = await supabase
    .from('tags')
    .insert(insertData)
    .select()
    .single();

  if (error) throw new Error(`Error creating tag: ${error.message}`);
  return data.id;
}

// Update tag
async function updateTag(tagId, newName) {
  const supabase =await createSupabaseServerClient()
  const { error } = await supabase.from('tags').update({ name: newName }).eq('id', tagId);
  if (error) throw new Error(`Error updating tag: ${error.message}`);
  revalidatePath('/library');
}

// Delete tag
async function deleteTag(tagId) {
  const supabase =await createSupabaseServerClient()
  const { error } = await supabase.from('tags').delete().eq('id', tagId);
  if (error) throw new Error(`Error deleting tag: ${error.message}`);
  revalidatePath('/library');
}

// Fetch reference items
async function fetchReferenceItems(userData) {
  const supabase =await createSupabaseServerClient()
  let query = supabase
    .from('reference_items')
    .select(
      `*, reference_item_tags (tags (id, name)), attachments (id, name, size, type, url, storage_path)`
    )
    .order('updated_at', { ascending: false });

  if (userData.role === 'executive') {
    query = query.eq('executive_id', userData.id);
  } else if (userData.role === 'assistant') {
    query = query.eq('assistant_id', userData.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Error fetching reference items: ${error.message}`);

  const items = data.map((item) => ({
    id: item.id,
    executive_id: item.executive_id,
    assistant_id: item.assistant_id,
    title: item.title,
    description: item.description || '',
    content: item.content || '',
    tags: item.reference_item_tags.map((rt) => rt.tags.name),
    icon: require('./utils').getIconForType(item.type),
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

  return items;
}

// Create reference item
 async function createReferenceItem(data, userData) {
  const supabase =await createSupabaseServerClient()
  if (!userData.id) throw new Error('No user logged in');

  const tableData = data.type === 'database' ? data.tableData : null;
  let insertData = {
    title: data.title,
    description: data.description,
    content: data.content,
    type: data.type,
    image_url: data.type === 'image' ? data.imageUrl : null,
    table_data: tableData,
  };

  if (userData.role === 'executive') {
    insertData = { ...insertData, assistant_id: userData.assistant_id, executive_id: userData.id };
  } else if (userData.role === 'assistant') {
    insertData = { ...insertData, assistant_id: userData.id, executive_id: userData.executive_id };
  }

  const { data: itemData, error: itemError } = await supabase
    .from('reference_items')
    .insert(insertData)
    .select()
    .single();

  if (itemError) throw new Error(`Error creating item: ${itemError.message}`);

  // Add tags
  const tagIds = await Promise.all(data.tags.map((tag) => getOrCreateTag(tag, userData)));
  const tagRelations = tagIds
    .filter((id) => id)
    .map((tagId) => ({ reference_item_id: itemData.id, tag_id: tagId }));

  if (tagRelations.length > 0) {
    const { error: tagError } = await supabase.from('reference_item_tags').insert(tagRelations);
    if (tagError) throw new Error(`Error adding tags: ${tagError.message}`);
  }

  // Add attachments
  if (data.attachments.length > 0) {
    const attachmentsToInsert = data.attachments.map((att) => ({
      reference_item_id: itemData.id,
      name: att.name,
      size: att.size,
      type: att.type,
      url: att.url,
      storage_path: att.storagePath,
    }));
    const { error: attError } = await supabase.from('attachments').insert(attachmentsToInsert);
    if (attError) throw new Error(`Error adding attachments: ${attError.message}`);
  }

  revalidatePath('/library');
  return {
    id: itemData.id,
    executive_id: itemData.executive_id,
    assistant_id: itemData.assistant_id,
    title: itemData.title,
    description: itemData.description || '',
    content: itemData.content || '',
    tags: data.tags,
    icon: require('./utils').getIconForType(itemData.type),
    attachments: data.attachments,
    updated_at: new Date(itemData.updated_at).toLocaleDateString(),
    type: itemData.type,
    image_url: itemData.image_url,
    table_data: itemData.table_data,
  };
}

// Update reference item
async function updateReferenceItem(id, data, userData) {
  const supabase =await createSupabaseServerClient()
  if (!userData.id) throw new Error('No user logged in');

  const tableData = data.type === 'database' ? data.tableData : null;
  const { error: itemError } = await supabase
    .from('reference_items')
    .update({
      title: data.title,
      description: data.description,
      content: data.content,
      type: data.type,
      image_url: data.type === 'image' ? data.imageUrl : null,
      table_data: tableData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (itemError) throw new Error(`Error updating item: ${itemError.message}`);

  // Update tags
  await supabase.from('reference_item_tags').delete().eq('reference_item_id', id);
  const tagIds = await Promise.all(data.tags.map((tag) => getOrCreateTag(tag, userData)));
  const tagRelations = tagIds
    .filter((id) => id)
    .map((tagId) => ({ reference_item_id: id, tag_id: tagId }));

  if (tagRelations.length > 0) {
    const { error: tagError } = await supabase.from('reference_item_tags').insert(tagRelations);
    if (tagError) throw new Error(`Error updating tags: ${tagError.message}`);
  }

  // Delete old attachments
  const { data: oldAttachments } = await supabase
    .from('attachments')
    .select('*')
    .eq('reference_item_id', id);

  if (oldAttachments && oldAttachments.length > 0) {
    const pathsToDelete = oldAttachments
      .filter((att) => att.storage_path)
      .map((att) => att.storage_path);
    if (pathsToDelete.length > 0) {
      await supabase.storage.from('reference-attachments').remove(pathsToDelete);
    }
    await supabase.from('attachments').delete().eq('reference_item_id', id);
  }

  // Insert new attachments
  if (data.attachments.length > 0) {
    const attachmentsToInsert = data.attachments.map((att) => ({
      reference_item_id: id,
      name: att.name,
      size: att.size,
      type: att.type,
      url: att.url,
      storage_path: att.storagePath,
    }));
    const { error: attError } = await supabase.from('attachments').insert(attachmentsToInsert);
    if (attError) throw new Error(`Error adding attachments: ${attError.message}`);
  }

  revalidatePath('/library');
}

// Delete reference item
async function deleteReferenceItem(id, userData) {
  const supabase =await createSupabaseServerClient()
  if (!userData.id) throw new Error('No user logged in');

  const { data: attachments } = await supabase
    .from('attachments')
    .select('storage_path')
    .eq('reference_item_id', id);

  if (attachments && attachments.length > 0) {
    const pathsToDelete = attachments
      .filter((att) => att.storage_path)
      .map((att) => att.storage_path);
    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('reference-attachments')
        .remove(pathsToDelete);
      if (storageError) throw new Error(`Error deleting storage files: ${storageError.message}`);
    }
  }

  const { error } = await supabase.from('reference_items').delete().eq('id', id);
  if (error) throw new Error(`Error deleting item: ${error.message}`);

  revalidatePath('/library');
}

// Upload file
async function uploadFile(file) {
  const supabase =await createSupabaseServerClient()
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('reference-attachments')
    .upload(fileName, file);

  if (error) throw new Error(`Error uploading file: ${error.message}`);

  const { data: publicData } = supabase.storage
    .from('reference-attachments')
    .getPublicUrl(fileName);

  return {
    id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    url: publicData.publicUrl,
    storagePath: fileName,
  };
}

// Delete file
async function deleteFile(storagePath) {
  const supabase =await createSupabaseServerClient()
  const { error } = await supabase.storage
    .from('reference-attachments')
    .remove([storagePath]);

  if (error) throw new Error(`Error deleting file from storage: ${error.message}`);
}

export {
  fetchReferenceItems,
  createReferenceItem,
  updateReferenceItem,
  deleteReferenceItem,
  fetchTags,
  getOrCreateTag,
  updateTag,
  deleteTag,
  uploadFile,
  deleteFile,
};
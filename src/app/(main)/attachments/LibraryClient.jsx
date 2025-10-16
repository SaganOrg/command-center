'use client';

import { useState, useEffect } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import  SearchBar  from '@/components/attachments/SearchBar';
import  TagsFilter  from '@/components/attachments/TagsFilter';
import  ReferenceList  from '@/components/attachments/ReferenceList';
import  ReferenceDialog  from '@/components/attachments/ReferenceDialog';
import { fetchReferenceItems, deleteReferenceItem, fetchTags } from './actions';

export default function LibraryClient({ initialUserData, initialReferenceItems, initialAvailableTags }) {
  const [userRole, setUserRole] = useState(initialUserData?.role || null);
  const [userId, setUserId] = useState(null);
  const { toast } = useToast();
  const [userData, setUserData] = useState(initialUserData);
  const router = useRouter();
  const [referenceItems, setReferenceItems] = useState(initialReferenceItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState(initialAvailableTags);
  const [editingItem, setEditingItem] = useState(null);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (initialUserData) {
      setUserData(initialUserData);
      setUserRole(initialUserData.role || null);
      setUserId(initialUserData.role === 'assistant' ? initialUserData.executive_id : initialUserData.id);
    } else {
      router.push('/login');
    }
  }, [initialUserData, router]);

  const fetchReferenceItemsData = async () => {
    if (!userId || !userRole) return;
    try {
      const items = await fetchReferenceItems(userData);
      setReferenceItems(items);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load reference items' });
    }
  };

  const fetchTagsData = async () => {
    if (!userData) return;
    try {
      const tags = await fetchTags(userData);
      setAvailableTags(tags);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load tags' });
    }
  };

  useEffect(() => {
    if (userId && userRole) {
      fetchReferenceItemsData();
      fetchTagsData();
    }
  }, [userId, userRole]);

  const handleNewItem = () => {
    if (!userId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please log in to add a new item' });
      return;
    }
    setEditingItem(null);
    setIsNewItemDialogOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteReferenceItem(id, userData);
      toast({ title: 'Success', description: 'Item deleted successfully' });
      await fetchReferenceItemsData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete item' });
    }
  };

  const handleSave = () => {
    setEditingItem(null);
    setIsEditDialogOpen(false);
    setIsNewItemDialogOpen(false);
  };

  const filteredItems = referenceItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.attachments.some((att) => att.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => item.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 md:px-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-24">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reference Library</h1>
          <p className="text-muted-foreground mt-1 text-sm">Access and manage shared knowledge, processes, and contacts</p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={handleNewItem} disabled={!userId}>
          <Plus className="mr-2 h-4 w-4" /> + Add Reference
        </Button>
      </div>

      <ReferenceDialog
        open={isNewItemDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (isNewItemDialogOpen) setIsNewItemDialogOpen(open);
          if (isEditDialogOpen) setIsEditDialogOpen(open);
        }}
        userData={userData}
        editingItem={editingItem}
        availableTags={availableTags}
        onSave={handleSave}
        fetchReferenceItemsData={fetchReferenceItemsData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 mt-6">
        <div className="space-y-5">
          <SearchBar onSearch={setSearchQuery} />
          <TagsFilter
            userData={userData}
            availableTags={availableTags}
            onTagsChange={setSelectedTags}
            fetchTagsData={fetchTagsData}
            fetchReferenceItemsData={fetchReferenceItemsData}
          />
          <div className="flex items-center text-xs text-muted-foreground">
            <RotateCcw className="mr-1.5 h-3 w-3" />
            <span>Last updated: Today</span>
          </div>
        </div>
        <ReferenceList
          items={filteredItems}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          userData={userData}
        />
      </div>
    </motion.div>
  );
}
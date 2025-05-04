'use client';

import { useState } from 'react';
import { Tag, Plus, Check, X, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getOrCreateTag, updateTag, deleteTag } from '@/app/(main)/attachments/actions';
import { useToast } from '@/hooks/use-toast';

export default function TagsFilter({ userData, availableTags, onTagsChange, fetchTagsData, fetchReferenceItemsData }) {
  const {toast} = useToast()
  const [selectedTags, setSelectedTags] = useState([]);
  const [editingTag, setEditingTag] = useState(null);
  const [newTagValue, setNewTagValue] = useState('');
  const { register, handleSubmit, reset } = useForm({ defaultValues: { newTag: '' } });

  const toggleTag = (tag) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newSelectedTags);
    onTagsChange(newSelectedTags);
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
        await fetchTagsData();
        await fetchReferenceItemsData();
        toast({ title: 'Success', description: `Tag updated to "${newTagValue}"` });
      }
    }
    setEditingTag(null);
    setNewTagValue('');
  };

  const cancelEditTag = () => {
    setEditingTag(null);
    setNewTagValue('');
  };

  const handleDeleteTag = async (tagName) => {
    const tagToDelete = availableTags.find((tag) => tag.name === tagName);
    if (tagToDelete) {
      await deleteTag(tagToDelete.id);
      await fetchTagsData();
      await fetchReferenceItemsData();
      toast({ title: 'Success', description: `Tag "${tagName}" deleted` });
    }
  };

  const createNewTag = async (data) => {
    if (data.newTag) {
      await getOrCreateTag(data.newTag, userData);
      reset({ newTag: '' });
      await fetchTagsData();
    }
  };

  return (
    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium flex items-center">
          <Tag className="h-3.5 w-3.5 mr-1.5" /> Tags
        </h3>
        <form onSubmit={handleSubmit(createNewTag)} className="flex items-center space-x-1">
          <Input
            {...register('newTag')}
            placeholder="New tag"
            className="h-7 text-xs"
          />
          <Button type="submit" size="sm" variant="ghost" className="h-7 px-2">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </form>
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
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={saveEditedTag}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={cancelEditTag}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Badge
                  variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
                  className="text-xs py-1 px-2 cursor-pointer flex items-center gap-1"
                >
                  <span onClick={() => toggleTag(tag.name)}>{tag.name}</span>
                  <div className="flex items-center ml-1">
                    <Button size="sm" variant="ghost" className="h-4 w-4 p-0" onClick={() => startEditTag(tag.name)}>
                      <Edit className="h-2.5 w-2.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-4 w-4 p-0 text-destructive" onClick={() => handleDeleteTag(tag.name)}>
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground text-center py-2">No tags available</div>
      )}
    </div>
  );
}
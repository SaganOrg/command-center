'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
import { useToast} from '@/hooks/use-toast'
import { createReferenceItem, updateReferenceItem, uploadFile, deleteFile } from '@/app/(main)/attachments/actions';

export default function ReferenceDialog({ open, onOpenChange, userData, editingItem, availableTags, onSave, fetchReferenceItemsData }) {
  const {toast} = useToast()
  const [isLoading, setIsLoading] = useState(false);
  const [tableHeaders, setTableHeaders] = useState(['Column 1', 'Column 2', 'Column 3']);
  const [tableRows, setTableRows] = useState([['', '', ''], ['', '', '']]);

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      content: '',
      tags: [],
      newTag: '',
      attachments: [],
      type: 'text',
      imageUrl: '',
      tableData: { headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['', '', ''], ['', '', '']] },
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        title: editingItem.title,
        description: editingItem.description,
        content: editingItem.content,
        tags: editingItem.tags,
        newTag: '',
        attachments: editingItem.attachments || [],
        type: editingItem.type,
        imageUrl: editingItem.image_url || '',
        tableData: editingItem.table_data || { headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['', '', ''], ['', '', '']] },
      });
      setTableHeaders(editingItem.table_data?.headers || ['Column 1', 'Column 2', 'Column 3']);
      setTableRows(editingItem.table_data?.rows || [['', '', ''], ['', '', '']]);
    } else {
      form.reset({
        title: '',
        description: '',
        content: '',
        tags: [],
        newTag: '',
        attachments: [],
        type: 'text',
        imageUrl: '',
        tableData: { headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['', '', ''], ['', '', '']] },
      });
      setTableHeaders(['Column 1', 'Column 2', 'Column 3']);
      setTableRows([['', '', ''], ['', '', '']]);
    }
  }, [editingItem, form]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const newAttachments = await Promise.all(
      Array.from(files).map(async (file) => {
        try {
          return await uploadFile(file);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Upload Error', description: `Failed to upload ${file.name}` });
          return null;
        }
      })
    );

    const validAttachments = newAttachments.filter((att) => att !== null);
    const currentAttachments = form.getValues('attachments') || [];
    form.setValue('attachments', [...currentAttachments, ...validAttachments]);
    e.target.value = '';
    setIsLoading(false);
  };

  const removeAttachment = async (id) => {
    const currentAttachments = form.getValues('attachments') || [];
    const attachmentToRemove = currentAttachments.find((att) => att.id === id);

    if (attachmentToRemove && attachmentToRemove.storagePath) {
      try {
        await deleteFile(attachmentToRemove.storagePath);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: `Failed to delete ${attachmentToRemove.name}` });
        return;
      }
    }

    form.setValue('attachments', currentAttachments.filter((att) => att.id !== id));
  };

  const addTableColumn = () => {
    setTableHeaders([...tableHeaders, `Column ${tableHeaders.length + 1}`]);
    setTableRows(tableRows.map((row) => [...row, '']));
  };

  const removeTableColumn = (index) => {
    if (tableHeaders.length <= 1) return;
    setTableHeaders((prev) => prev.filter((_, i) => i !== index));
    setTableRows((prev) => prev.map((row) => row.filter((_, i) => i !== index)));
  };

  const addTableRow = () => {
    setTableRows([...tableRows, Array(tableHeaders.length).fill('')]);
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
      prev.map((row, i) => (i === rowIndex ? row.map((cell, j) => (j === colIndex ? value : cell)) : row))
    );
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (data.newTag && !data.tags.includes(data.newTag)) {
        data.tags.push(data.newTag);
      }

      const formattedData = {
        ...data,
        tableData: data.type === 'database' ? { headers: tableHeaders, rows: tableRows } : null,
      };

      if (editingItem) {
        await updateReferenceItem(editingItem.id, formattedData, userData);
        toast({ title: 'Success', description: 'Item updated successfully' });
      } else {
        await createReferenceItem(formattedData, userData);
        toast({ title: 'Success', description: 'New item added successfully' });
      }

      await fetchReferenceItemsData();
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save item' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Reference' : 'Add New Reference'}</DialogTitle>
          <DialogDescription>
            {editingItem ? 'Update this reference item in your library.' : 'Create a new reference item in your library.'}
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
                        if (!currentTags.includes(value)) field.onChange([...currentTags, value]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tags" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {field.value?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="mr-1 mb-1">
                        {tag}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => field.onChange(field.value.filter((t) => t !== tag))}
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
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*,application/pdf"
                        multiple
                        onChange={handleFileUpload}
                        disabled={isLoading}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </FormControl>
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded">
                        <span className="text-sm text-gray-600 animate-pulse">Processing...</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 space-y-2">
                    {field.value?.map((att) => (
                      <div key={att.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{att.name} ({(att.size / 1024).toFixed(1)} KB)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(att.id)}
                          disabled={isLoading}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
            {form.watch('type') === 'image' && (
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {form.watch('type') === 'database' && (
              <div className="space-y-3 border p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Table Data</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addTableColumn}>
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
                                onChange={(e) => updateTableHeader(index, e.target.value)}
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
                                onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
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
                <Button type="button" variant="outline" size="sm" onClick={addTableRow}>
                  Add Row
                </Button>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (editingItem ? 'Updating...' : 'Saving...') : (editingItem ? 'Update reference' : 'Save reference')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
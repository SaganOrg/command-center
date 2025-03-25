"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { PaperclipIcon, X, Send } from "lucide-react";

const CommentForm = ({ taskId, onAddComment }) => {
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const form = useForm({
    defaultValues: {
      comment: "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onAddComment(taskId, {
      text: data.comment,
      authorName: "Sagan", // In a real app, this would be the logged-in user's name
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
    });
    form.reset();
    setAttachments([]);
  });

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments = [];

    Array.from(files).forEach((file) => {
      // Create object URL for preview (in a real app, you would upload to a server)
      const fileUrl = URL.createObjectURL(file);

      newAttachments.push({
        id: `attachment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
      });
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  placeholder="Add a comment..."
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Attachments</p>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm"
                >
                  <div className="flex items-center">
                    <PaperclipIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="truncate max-w-[200px]">
                      {attachment.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500"
          >
            <PaperclipIcon className="h-4 w-4 mr-1" />
            Attach files
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            multiple
          />

          <Button
            type="submit"
            size="sm"
            disabled={
              !form.getValues().comment.trim() && attachments.length === 0
            }
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CommentForm;

"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";

const CommentForm = ({ taskId, onAddComment }) => {
  const form = useForm({
    defaultValues: {
      comment: "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (data.comment.trim()) { // Only submit if comment is not empty
      onAddComment(taskId, {
        content: data.comment, // Changed 'text' to 'content' to match your Supabase schema
        // Removed authorName and timestamp since they'll be handled by Supabase
      });
      form.reset();
    }
  });

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

        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!form.getValues().comment.trim()} // Disable if comment is empty
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CommentForm;
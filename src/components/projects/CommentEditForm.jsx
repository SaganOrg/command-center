"use client"
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaperclipIcon, X } from 'lucide-react';
import { userAgentFromString } from 'next/server';



const CommentEditForm = ({ 
  comment, 
  onSave, 
  onCancel 
}) => {
  const [text, setText] = useState(comment.text);
  const [attachments, setAttachments] = useState(comment.attachments || []);
  const fileInputRef = userAgentFromString(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSave({
        ...comment,
        text,
        attachments: attachments.length > 0 ? attachments : undefined
      });
    }
  };

  // const handleFileChange = (e) => {
  //   const files = e.target.files;
  //   if (!files || files.length === 0) return;

  //   const newAttachments = [];
    
  //   Array.from(files).forEach(file => {
  //     // Create object URL for preview (in a real app, you would upload to a server)
  //     const fileUrl = URL.createObjectURL(file);
      
  //     newAttachments.push({
  //       id: `attachment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  //       name: file.name,
  //       size: file.size,
  //       type: file.type,
  //       url: fileUrl
  //     });
  //   });
    
  //   setAttachments(prev => [...prev, ...newAttachments]);
  // };

  // const removeAttachment = (id) => {
  //   setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  // };

  return (
    <>
    
<form onSubmit={handleSubmit} className="space-y-3 mt-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[80px] resize-none"
      />
      
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Attachments</p>
          <div className="space-y-2">
            {attachments.map(attachment => (
              <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
                <div className="flex items-center">
                  <PaperclipIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="truncate max-w-[200px]">{attachment.name}</span>
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
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            size="sm"
            disabled={!text.trim()}
          >
            Save
          </Button>
        </div>
      </div>
  </form>
    </>
  );
};

export default CommentEditForm;

"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, PaperclipIcon, Eye, Trash2 } from 'lucide-react';
import CommentEditForm from './CommentEditForm';
import AttachmentPreviewDialog from './AttachmentPreviewDialog';


const CommentList = ({ 
  comments, 
  onEditComment, 
  onDeleteComment, 
  taskId 
}) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [isAttachmentPreviewOpen, setIsAttachmentPreviewOpen] = useState(false);
  
  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }
  
  const handleSaveEdit = (updatedComment) => {
    onEditComment(updatedComment.id, updatedComment);
    setEditingCommentId(null);
  };

  const openAttachmentPreview = (attachment) => {
    setSelectedAttachment(attachment);
    setIsAttachmentPreviewOpen(true);
  };
  
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author_name}`} />
            <AvatarFallback className="text-xs">
              {comment.author_name}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{comment.author_name}</p>
              <div className="flex items-center">
                <p className="text-xs text-muted-foreground mr-2">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                {editingCommentId !== comment.id && (
                  <div className="flex space-x-1">
                    {/* <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => setEditingCommentId(comment.id)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button> */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-destructive" 
                      onClick={() => onDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {editingCommentId === comment.id ? (
              <CommentEditForm
                comment={comment}
                onSave={handleSaveEdit}
                onCancel={() => setEditingCommentId(null)}
              />
            ) : (
              <>
                <p className="mt-1 text-sm">{comment.content}</p>
                
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {comment.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded p-2 text-xs">
                        <a 
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline max-w-[80%] truncate"
                        >
                          <PaperclipIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{attachment.name}</span>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => openAttachmentPreview(attachment)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}

      <AttachmentPreviewDialog
        attachment={selectedAttachment}
        isOpen={isAttachmentPreviewOpen}
        onClose={() => {
          setIsAttachmentPreviewOpen(false);
          setSelectedAttachment(null);
        }}
      />
    </div>
  );
};

export default CommentList;

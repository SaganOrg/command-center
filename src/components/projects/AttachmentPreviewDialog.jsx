
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PaperclipIcon, FileText, ExternalLink } from 'lucide-react';



const AttachmentPreviewDialog = ({ 
  attachment, 
  isOpen, 
  onClose 
}) => {
  if (!attachment) return null;
  
  const isImage = attachment.type.startsWith('image/');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PaperclipIcon className="h-5 w-5" />
            {attachment.name}
          </DialogTitle>
          <DialogDescription>
            {(attachment.size / 1024).toFixed(2)} KB - {attachment.type}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto my-6 flex items-center justify-center">
          {isImage ? (
            <img 
              src={attachment.url} 
              alt={attachment.name} 
              className="max-w-full max-h-[60vh] object-contain"
            />
          ) : (
            <div className="text-center p-10 bg-slate-50 rounded-lg">
              <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <p className="mb-4">This file type cannot be previewed directly.</p>
              <Button asChild>
                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open File
                </a>
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button asChild variant="outline">
            <a href={attachment.url} download={attachment.name}>
              Download
            </a>
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentPreviewDialog;

"use client"
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { 
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '@/components/ui/collapsible';



const CollapsibleTaskCard = ({
  task,
  onClick,
  index,
  onDragStart,
  onDragEnter,
  isDragging,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    
    // Explicitly set the data needed for dragging operations
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('sourceStatus', task.status);
    e.dataTransfer.setData('sourceIndex', index.toString());
    
    onDragStart(e, task, index);
  };

  const handleDragEnter = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDragEnter(e, index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card 
      className={`mb-4 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-gray-400 ${
        isDragging ? 'opacity-50' : ''
      } ${className}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
    >
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
          <div className="flex items-center">
            {isOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            <span className="font-medium truncate">{task.title}</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-2">
          <div 
            className="text-sm text-muted-foreground py-2 border-t"
            onClick={(e) => {
              e.stopPropagation(); 
              onClick();
            }}
          >
            {task.description && (
              <p className="mb-2 line-clamp-2">{task.description}</p>
            )}
            {task.dueDate && (
              <p className="text-xs">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            )}
            <button 
              className="mt-2 text-xs text-primary hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              View Details
            </button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleTaskCard;

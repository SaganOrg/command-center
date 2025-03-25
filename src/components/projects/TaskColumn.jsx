"use client"
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash, Check, X } from 'lucide-react';
import TaskCard from './TaskCard';
import CollapsibleTaskCard from './CollapsibleTaskCard';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


const TaskColumn = ({
  title,
  icon,
  tasks,
  status,
  isLoading,
  onDrop,
  onTaskClick,
  onReorderTasks,
  draggedTaskId,
  onDragOver,
  onAddTask,
  onEditColumnTitle,
  onDeleteColumn,
  isEditing = false,
  setIsEditing,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropPreviewIndex, setDropPreviewIndex] = useState(null);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const columnRef = useRef(null);

  const handleColumnDragOver = (e) => {
    e.preventDefault(); // Allow drop
    onDragOver(e, status);
    setIsDraggedOver(true);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggedOver(false);
    
    // Get all the necessary data from dataTransfer
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    
    const sourceStatus = e.dataTransfer.getData('sourceStatus');
    const currentDropIndex = determineDropIndex(e, sortedTasks.length);
    
    if (sourceStatus === status) {
      // If we're dragging within the same column, reorder tasks
      onReorderTasks(taskId, currentDropIndex, status);
    } else {
      // If we're dragging between columns, change status
      onDrop(taskId, status);
    }
    
    setDraggedIndex(null);
    setDropPreviewIndex(null);
  };

  // Helper function to determine the drop index based on mouse position
  const determineDropIndex = (e, totalItems) => {
    if (!columnRef.current) return 0;
    
    const columnRect = columnRef.current.getBoundingClientRect();
    const scrollArea = columnRef.current.querySelector('.scroll-area');
    const scrollTop = scrollArea ? scrollArea.scrollTop : 0;
    
    const taskCards = columnRef.current.querySelectorAll('.task-card');
    if (taskCards.length === 0) return 0;
    
    const mouseY = e.clientY - columnRect.top + scrollTop;
    
    for (let i = 0; i < taskCards.length; i++) {
      const card = taskCards[i];
      const cardRect = card.getBoundingClientRect();
      const cardMiddle = cardRect.top + (cardRect.height / 2) - columnRect.top + scrollTop;
      
      if (mouseY < cardMiddle) {
        return i;
      }
    }
    
    return totalItems;
  };

  const handleDragStart = (e, task, index) => {
    e.stopPropagation();
    setDraggedIndex(index);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.types.includes('taskId')) {
      // Update the drop preview based on mouse position
      const currentDropIndex = determineDropIndex(e, sortedTasks.length);
      setDropPreviewIndex(currentDropIndex);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    
    if (e.dataTransfer.types.includes('taskId')) {
      // Continuously update the drop preview while dragging over
      const currentDropIndex = determineDropIndex(e, sortedTasks.length);
      setDropPreviewIndex(currentDropIndex);
    }
  };
  
  const handleDragLeave = (e) => {
    // Check if we're leaving the column area
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDropPreviewIndex(null);
      setIsDraggedOver(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropPreviewIndex(null);
    setIsDraggedOver(false);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && onEditColumnTitle) {
      onEditColumnTitle(editedTitle);
    }
    if (setIsEditing) {
      setIsEditing(false);
    }
  };

  // Add indicator if the column is empty and something is being dragged
  const shouldShowEmptyColumnIndicator = tasks.length === 0 && draggedTaskId !== null;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return;
  });

  return (
    <div 
      ref={columnRef}
      className={`rounded-lg h-full flex flex-col overflow-hidden shadow-sm bg-white border border-slate-200 transition-all duration-200 hover:shadow-md ${isDraggedOver ? 'border-2 border-primary ring-4 ring-primary/20' : ''}`}
      onDragOver={handleColumnDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
    >
      <div className={`flex items-center p-4 border-b border-slate-100 ${isDraggedOver ? 'bg-primary/10' : ''}`}>
        <div className="p-1.5 rounded-full bg-slate-100">
          <div className="text-slate-600">
            {icon}
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex items-center ml-2 gap-1 flex-1">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleSaveTitle}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                setEditedTitle(title);
                if (setIsEditing) setIsEditing(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <h3 className="font-medium ml-2 text-base flex-1 truncate">{title}</h3>
            <div className="ml-2 bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium text-slate-600">
              {tasks.length}
            </div>

            {onEditColumnTitle && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 ml-1">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="flex flex-col gap-1">
                    {onEditColumnTitle && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start"
                        onClick={() => setIsEditing && setIsEditing(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit name
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </>
        )}
      </div>
      
      {isLoading ? (
        <div className="p-4 space-y-3">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
      ) : (
        <ScrollArea className="flex-1 p-3 scroll-area">
          <div className="space-y-3 pr-1">
            {shouldShowEmptyColumnIndicator && (
              <div 
                className="h-2 w-full bg-slate-200 rounded-full mb-2 transform transition-all duration-200 animate-pulse"
              />
            )}
            
            {dropPreviewIndex === 0 && (
              <div 
                className="h-1 w-full bg-primary rounded-full mb-2 transform transition-all duration-200 animate-pulse"
              />
            )}
            
            {sortedTasks.map((task, index) => (
              <React.Fragment key={task.id}>
                {dropPreviewIndex === index && index > 0 && (
                  <div 
                    className="h-1 w-full bg-primary rounded-full mb-2 transform transition-all duration-200 animate-pulse"
                  />
                )}
                
                {status === 'archive' ? (
                  <CollapsibleTaskCard
                    task={task}
                    index={index}
                    onClick={() => onTaskClick(task)}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    isDragging={draggedTaskId === task.id}
                    className="task-card"
                  />
                ) : (
                  <TaskCard 
                    task={task} 
                    index={index}
                    onClick={() => onTaskClick(task)}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    isDragging={draggedTaskId === task.id}
                    className="task-card"
                  />
                )}
                
                {dropPreviewIndex === index + 1 && (
                  <div 
                    className="h-1 w-full bg-primary rounded-full mt-2 transform transition-all duration-200 animate-pulse"
                  />
                )}
              </React.Fragment>
            ))}
            
            {tasks.length === 0 && dropPreviewIndex === 0 && (
              <div 
                className="h-1 w-full bg-primary rounded-full mt-2 transform transition-all duration-200 animate-pulse"
              />
            )}
          </div>
        </ScrollArea>
      )}
      
      <div className="p-3 border-t border-slate-100">
        <Button 
          variant="outline" 
          className="w-full border border-dashed border-slate-300 hover:bg-slate-50"
          onClick={() => onAddTask(status)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>
    </div>
  );
};

export default TaskColumn;

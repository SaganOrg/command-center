// components/projects/ColumnCarousel.tsx
"use client"
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TaskColumn from './TaskColumn';



const ColumnCarousel = ({ columns }) => {
  const carouselRef = useRef(null);
  const COLUMN_WIDTH = 350; // Matches the w-[350px] in the className

  const scrollLeft = () => {
    if (carouselRef.current) {
      const currentScroll = carouselRef.current.scrollLeft;
      const newScroll = Math.max(0, currentScroll - COLUMN_WIDTH);
      carouselRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const currentScroll = carouselRef.current.scrollLeft;
      const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
      const newScroll = Math.min(maxScroll, currentScroll + COLUMN_WIDTH);
      carouselRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto scroll-smooth gap-4 pb-4 snap-x snap-mandatory"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch' // Improves iOS scrolling
        }}
      >
        {columns?.map((column) => (
          <div
            key={column.id}
            className="min-w-[300px] w-[350px] max-w-md flex-shrink-0 snap-start"
          >
            <TaskColumn
              title={column.title}
              icon={column.icon}
              tasks={column.tasks}
              status={column.id}
              isLoading={column.isLoading}
              onDrop={column.onDrop}
              onTaskClick={column.onTaskClick}
              onReorderTasks={column.onReorderTasks}
              draggedTaskId={column.draggedTaskId}
              onDragOver={column.onDragOver}
              onAddTask={column.onAddTask}
              onEditColumnTitle={column.onEditColumnTitle}
              isEditing={column.isEditing}
              setIsEditing={column.setIsEditing}
            />
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white"
        onClick={scrollLeft}
        disabled={carouselRef.current?.scrollLeft === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white"
        onClick={scrollRight}
        disabled={
          carouselRef.current?.scrollLeft >= 
          (carouselRef.current?.scrollWidth - carouselRef.current?.clientWidth - 1)
        }
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ColumnCarousel;
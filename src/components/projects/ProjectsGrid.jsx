"use client"
import React, {useState} from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';



const ProjectsGrid = ({ 
  tasks, 
  columns, 
  onTaskClick,
  onAddTask 
}) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredTasks = React.useMemo(() => {
    if (activeTab === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.status === activeTab);
  }, [tasks, activeTab]);

  const getStatusBadge = (status) => {
    const column = columns.find(col => col.id === status);
    if (!column) return status;
    return column.title;
  };

  return (
    <div className="space-y-6">
      <div className="flex-col md:flex md:flex-row justify-between items-center">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            {columns.map(column => (
              <TabsTrigger key={column.id} value={column.id} className="flex-1">
                {column.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <Button onClick={onAddTask} className="ml-4 whitespace-nowrap flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <Card 
            key={task.id} 
            className="cursor-pointer hover:shadow-md transition-shadow border border-slate-200"
            onClick={() => onTaskClick(task)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {getStatusBadge(task.status)}
                </Badge>
                {task.dueDate && (
                  <span className="text-xs flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm line-clamp-3 text-muted-foreground">
                {task.description || task.purpose || 'No description provided.'}
              </p>
            </CardContent>
            <CardFooter className="pt-0 border-t border-slate-100 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.comments?.length || 0} comment{task.comments?.length !== 1 ? 's' : ''}
              </div>
            </CardFooter>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">No projects found in this category</p>
            <Button variant="outline" onClick={onAddTask} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add New Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsGrid;

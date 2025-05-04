'use client';

import { useState } from 'react';
import {
  FileArchive, Edit, Trash, Download, Image as ImageIcon, Table as TableIcon, Type as TypeIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
// import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

export default function ReferenceCard({ item, onEdit, onDelete, userData }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const Icon = { ImageIcon, FileArchive, TableIcon, TypeIcon }[item.icon] || TypeIcon;

  const renderContentByType = () => {
    switch (item.type) {
      case 'image':
        return (
          <div className="mt-2">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="w-full h-auto rounded-md object-cover max-h-28" />
            ) : (
              <div className="flex items-center justify-center h-24 bg-gray-100 rounded-md">
                <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
          </div>
        );
      case 'file':
        return (
          <div className="mt-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <FileArchive className="mr-2 h-4 w-4" />
              <span>{item.attachments.length} file(s) attached</span>
            </div>
          </div>
        );
      case 'database':
        return (
          <div className="mt-2 overflow-hidden">
            {item.table_data && (
              <div className="overflow-x-auto text-xs border rounded-md">
                <table className="min-w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      {item.table_data.headers.slice(0, 3).map((header, index) => (
                        <th key={index} className="px-2 py-1.5 font-medium text-left truncate">{header}</th>
                      ))}
                      {item.table_data.headers.length > 3 && (
                        <th className="px-2 py-1.5 font-medium text-left">+{item.table_data.headers.length - 3} more</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {item.table_data.rows.slice(0, 1).map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                        {row.slice(0, 3).map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-2 py-1 truncate border-t">{cell || '—'}</td>
                        ))}
                        {row.length > 3 && <td className="px-2 py-1 truncate border-t">...</td>}
                      </tr>
                    ))}
                    {item.table_data.rows.length > 1 && (
                      <tr>
                        <td colSpan={Math.min(item.table_data.headers.length, 4)} className="px-2 py-1 text-center text-muted-foreground border-t text-xs">
                          +{item.table_data.rows.length - 1} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return <CardDescription className="line-clamp-2">{item.description}</CardDescription>;
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await fetch(attachment.url);
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Download Error', description: `Failed to download ${attachment.name}` });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-muted/40">
      <CardHeader className="pb-2 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">{item.updated_at}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </div>
        <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-1 min-h-[60px]">
        {renderContentByType()}
        {item.attachments && item.attachments.length > 0 && item.type !== 'file' && (
          <div className="mt-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileArchive className="h-3.5 w-3.5" />
              <span>{item.attachments.length} attachment{item.attachments.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </CardContent>
      <div className="px-6 pb-1">
        <div className="flex flex-wrap gap-1 mb-3 min-h-[26px] max-h-[52px] overflow-hidden">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs py-0.5 px-1.5 bg-muted/30">{tag}</Badge>
          ))}
        </div>
      </div>
      <CardFooter className="justify-between gap-2 border-t pt-2.5 pb-3 bg-muted/5">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">View Details</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{item.title}</DialogTitle>
              <DialogDescription>{item.description}</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
              {item.type === 'text' && (
                <div className="p-4 bg-muted/50 rounded-md whitespace-pre-line">{item.content}</div>
              )}
              {item.type === 'image' && item.image_url && (
                <div className="flex justify-center">
                  <img src={item.image_url} alt={item.title} className="max-w-full max-h-[400px] object-contain rounded-md" />
                </div>
              )}
              {item.type === 'database' && item.table_data && (
                <div className="overflow-x-auto border rounded-md">
                  <table className="min-w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        {item.table_data.headers.map((header, index) => (
                          <th key={index} className="px-4 py-2 font-medium text-left">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {item.table_data.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 border-t">{cell || '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {item.attachments && item.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {item.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                        <div className="flex items-center">
                          <FileArchive className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{attachment.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({(attachment.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(attachment)}
                        >
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-between mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Reference Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{item.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10 h-8">
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Reference Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{item.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
'use client';

import { FileText } from 'lucide-react';
import  ReferenceCard  from './ReferenceCard';

export default function ReferenceList({ items, onEdit, onDelete, userData }) {
  if (!items.length) {
    return (
      <div className="text-center py-10 bg-muted/10 rounded-lg">
        <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-muted-foreground/70">No reference items found</h3>
        <p className="text-sm text-muted-foreground/50 mt-1">Try changing your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <ReferenceCard
          key={item.id}
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
          userData={userData}
        />
      ))}
    </div>
  );
}
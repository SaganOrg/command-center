"use client"
import React from 'react';
import { cn } from '@/lib/utils';

import { LucideIcon } from 'lucide-react';


const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
  href
}) => {

     // <motion.div
    //   initial={{ opacity: 0, y: 20 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   transition={{ duration: 0.6, delay: delay, ease: [0.22, 1, 0.36, 1] }}
    // >
    return (
      <>
   
   <a
        href={href}
        className={cn(
          "block h-full p-6 rounded-2xl bg-white border border-border/50",
          "shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        )}
      >
        <div className="w-12 h-12 mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </a>
            {/* </motion.div> */}
            </>
  );
};

export default FeatureCard;

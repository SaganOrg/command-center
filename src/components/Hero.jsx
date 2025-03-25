"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import  Link  from 'next/link';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section className="py-16 md:py-24">
      <motion.div 
        className="container mx-auto px-4 md:px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="inline-block mb-6 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
          variants={itemVariants}
        >
          Streamlined Collaboration
        </motion.div>
        
        <motion.h1 
          className="max-w-3xl mx-auto mb-6 font-medium leading-tight tracking-tighter"
          variants={itemVariants}
        >
          The Sagan <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            Command Center
          </span>
        </motion.h1>
        
        <motion.p 
          className="max-w-xl mx-auto mb-10 text-lg text-muted-foreground"
          variants={itemVariants}
        >
          Seamless collaboration between executives and assistants. 
          Streamline daily operations, reporting, and task management in one elegant interface.
        </motion.p>
        
        <motion.div 
          className="flex justify-center items-center"
          variants={itemVariants}
        >
          <Link href="/reports" className="btn-primary flex items-center gap-2 group">
            Get Started
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

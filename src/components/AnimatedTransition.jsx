"use client"

import { motion } from 'framer-motion';


export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const AnimatedTransition = ({ 
  children, 
  className = "" 
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={slideUpVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedTransition;

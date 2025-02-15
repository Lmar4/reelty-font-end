"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/25 z-50'
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className='fixed bottom-0 left-0 right-0 h-[80vh] bg-white rounded-t-[10px] z-50 overflow-hidden'
          >
            {/* Handle */}
            <div className='flex justify-center p-4'>
              <div className='w-12 h-1.5 bg-gray-300 rounded-full' />
            </div>

            {/* Content */}
            <div className='px-4 pb-8 h-[calc(100%-2rem)] overflow-y-auto'>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

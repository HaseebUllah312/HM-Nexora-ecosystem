"use client";

import React from "react";
import Link from "next/link";
import { FiWifiOff } from "react-icons/fi";
import { motion } from "framer-motion";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-24 h-24 mb-8 flex items-center justify-center rounded-3xl bg-red-500/10 text-red-500"
      >
        <FiWifiOff size={48} />
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-bold mb-4"
      >
        You're Offline
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-gray-400 max-w-md mb-8"
      >
        It looks like you've lost your internet connection. Don't worry, HM nexora will be back as soon as you're reconnected.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary px-8 py-3 rounded-xl font-semibold mb-4 w-full"
        >
          Try Again
        </button>
        <Link href="/" className="block text-accent-primary font-medium hover:underline">
          Go to Home
        </Link>
      </motion.div>
      
      <div className="mt-12 text-sm text-gray-500 border-t border-white/5 pt-8 w-full max-w-xs">
        <p>Tip: You can still browse previously visited pages while offline.</p>
      </div>
    </div>
  );
}
